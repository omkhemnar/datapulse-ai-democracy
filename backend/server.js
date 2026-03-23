const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 5001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datapulse', {
  // Use latest parser
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const BoothOfficer = require('./models/BoothOfficer');
const VoterAuth = require('./models/VoterAuth');
const AI_SERVICE_URL = 'http://127.0.0.1:8000';
const DATA_FILE = path.join(__dirname, 'data', 'voters.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty data if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ voters: [], clusters: [] }));
}

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Fallback classification when AI service is down
function fallbackClassification(voters) {
  const voter_groups = [];
  const group_counts = {};
  const scheme_map = {};

  voters.forEach((v, idx) => {
    const age = parseInt(v.Age) || 0;
    const gen = (v.Gender || '').toLowerCase();
    const occ = (v.Occupation || '').toLowerCase();
    const isFemale = gen.includes('female') || gen === 'f';
    const isFarmer = occ.includes('farmer');

    const groups = [];
    const eligible_schemes = [];

    if (age < 18) {
      groups.push('Youth (Under 18)');
      eligible_schemes.push('Child Welfare Schemes');
    } else if (age <= 25) {
      groups.push('Youth (18-25)');
      eligible_schemes.push('Skill India (18+)', 'Youth Education Scholarship', 'Startup India');
    } else if (age <= 35) {
      groups.push('Youth (26-35)');
      eligible_schemes.push('Skill India (18+)', 'Startup India');
    } else if (age < 60) {
      groups.push('Working Age (36-59)');
    } else {
      groups.push('Senior Citizens (60+)');
      eligible_schemes.push('Ayushman Bharat', 'Senior Citizen Pension');
    }
    if (isFemale) {
      groups.push('Women');
      eligible_schemes.push('Beti Bachao Beti Padhao', 'Ujjwala Yojana');
      if (age >= 21 && age <= 60) eligible_schemes.push('Ladli Behna Yojana');
    }
    if (isFarmer) {
      groups.push('Farmers');
      eligible_schemes.push('PM-KISAN', 'Crop Insurance (Fasal Bima)');
    }

    groups.forEach(g => { group_counts[g] = (group_counts[g] || 0) + 1; });
    [...new Set(eligible_schemes)].forEach(s => {
      if (!scheme_map[s]) scheme_map[s] = 0;
      scheme_map[s]++;
    });

    voter_groups.push({
      id: v.id || idx + 1,
      Name: v.Name,
      Age: v.Age,
      Gender: v.Gender,
      Occupation: v.Occupation,
      BoothID: v.BoothID,
      groups,
      primary_group: groups[0],
      eligible_schemes: [...new Set(eligible_schemes)],
    });
  });

  const scheme_groups = Object.entries(scheme_map).map(([scheme, count]) => ({
    scheme,
    count,
    eligibility: scheme,
    description: '',
  }));
  const clusters = Object.entries(group_counts).map(([cluster_name, count]) => ({ cluster_name, count }));
  const group_summary = Object.entries(group_counts).map(([name, count]) => ({ name, count }));
  const recommendations = scheme_groups.map(sg => ({ cluster: sg.eligibility, scheme: sg.scheme }));

  return { clusters, recommendations, voter_groups, scheme_groups, group_summary };
}

// Helper to read voters data
function getVotersData() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper to save voters data
function saveVotersData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Upload and process CSV
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const content = req.file.buffer.toString('utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const voters = records.map((row, idx) => ({
      id: idx + 1,
      Name: row.cand_name || row.Name || row.name || '',
      Age: parseInt(row.Age || row.age) || (row.cand_name ? Math.floor(Math.random() * 20) + 35 : 0),
      Gender: row.cand_sex ? (row.cand_sex === 'M' ? 'Male' : 'Female') : (row.Gender || row.gender || ''),
      BoothID: row.pc_name || row.BoothID || row.boothid || row.boothId || '',
      Area: row.st_name || row.Area || row.area || '',
      Occupation: row.partyabbre || row.Occupation || row.occupation || '',
      Experience: row.totvotpoll || row.Experience || row.experience || '',
    })).filter(v => v.Name);

    const data = getVotersData();
    data.voters = voters;

    // Call AI service for clustering and classification
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/cluster`, {
        voters: data.voters,
      }, { timeout: 10000 });
      data.clusters = aiResponse.data.clusters || [];
      data.recommendations = aiResponse.data.recommendations || [];
      data.voter_groups = aiResponse.data.voter_groups || [];
      data.scheme_groups = aiResponse.data.scheme_groups || [];
      data.group_summary = aiResponse.data.group_summary || [];
    } catch (aiError) {
      console.warn('AI service unavailable, using fallback classification:', aiError.message);
      const fallback = fallbackClassification(data.voters);
      data.clusters = fallback.clusters;
      data.recommendations = fallback.recommendations;
      data.voter_groups = fallback.voter_groups;
      data.scheme_groups = fallback.scheme_groups;
      data.group_summary = fallback.group_summary;
    }

    saveVotersData(data);
    res.json({ message: 'Data uploaded successfully', count: voters.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to process CSV' });
  }
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  try {
    const data = getVotersData();
    const voters = data.voters || [];

    if (voters.length === 0) {
      return res.json({
        ageDistribution: [],
        genderRatio: {},
        boothCounts: [],
        clusterDistribution: [],
        recommendations: [],
        voter_groups: [],
        scheme_groups: [],
        group_summary: [],
        totalVoters: 0,
      });
    }

    // Age distribution
    const ageBuckets = { '18-25': 0, '26-40': 0, '41-60': 0, '61+': 0 };
    voters.forEach(v => {
      const age = v.Age || 0;
      if (age <= 25) ageBuckets['18-25']++;
      else if (age <= 40) ageBuckets['26-40']++;
      else if (age <= 60) ageBuckets['41-60']++;
      else ageBuckets['61+']++;
    });
    const ageDistribution = Object.entries(ageBuckets).map(([label, count]) => ({ label, count }));

    // Gender ratio
    const genderRatio = {};
    voters.forEach(v => {
      const g = (v.Gender || 'Unknown').trim() || 'Unknown';
      genderRatio[g] = (genderRatio[g] || 0) + 1;
    });

    // Booth-wise counts
    const boothMap = {};
    voters.forEach(v => {
      const b = v.BoothID || 'Unknown';
      boothMap[b] = (boothMap[b] || 0) + 1;
    });
    const boothCounts = Object.entries(boothMap).map(([boothId, count]) => ({ boothId, count }));

    // Cluster distribution (from AI or fallback)
    let clusterDistribution = [];
    if (data.clusters && data.clusters.length > 0) {
      const clusterMap = {};
      data.clusters.forEach(c => {
        const name = c.cluster_name || c.name || 'Unknown';
        clusterMap[name] = (clusterMap[name] || 0) + (c.count || 1);
      });
      clusterDistribution = Object.entries(clusterMap).map(([name, count]) => ({ name, count }));
    } else {
      // Fallback: derive clusters from occupation/age
      const clusters = { 'Youth': 0, 'Farmers': 0, 'Senior Citizens': 0, 'Women (other)': 0 };
      voters.forEach(v => {
        const age = v.Age || 0;
        const occ = (v.Occupation || '').toLowerCase();
        const gen = (v.Gender || '').toLowerCase();
        if (age <= 30) clusters['Youth']++;
        else if (occ.includes('farmer')) clusters['Farmers']++;
        else if (age >= 60) clusters['Senior Citizens']++;
        else clusters['Women (other)']++;
      });
      clusterDistribution = Object.entries(clusters).filter(([_, c]) => c > 0).map(([name, count]) => ({ name, count }));
    }

    // Compute classification if missing (e.g. data loaded before update)
    let voterGroups = data.voter_groups || [];
    let schemeGroups = data.scheme_groups || [];
    let groupSummary = data.group_summary || [];
    if (!voterGroups.length && voters.length > 0) {
      const fb = fallbackClassification(voters);
      voterGroups = fb.voter_groups;
      schemeGroups = fb.scheme_groups;
      groupSummary = fb.group_summary;
    }

    res.json({
      ageDistribution,
      genderRatio,
      boothCounts,
      clusterDistribution,
      recommendations: data.recommendations || [],
      voter_groups: voterGroups.slice(0, 150), // Cap response to prevent Knowledge Graph canvas crash on massive datasets
      scheme_groups: schemeGroups,
      group_summary: groupSummary,
      totalVoters: voters.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get raw voters list
app.get('/api/voters', (req, res) => {
  try {
    const data = getVotersData();
    res.json({ voters: data.voters || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Load sample data (for quick demo)
app.get('/api/load-sample', async (req, res) => {
  try {
    const samplePath = path.join(__dirname, '..', 'data', 'sample_voters.csv');
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: 'Sample file not found' });
    }
    const content = fs.readFileSync(samplePath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });
    const voters = records.map((row, idx) => ({
      id: idx + 1,
      Name: row.Name || row.name || '',
      Age: parseInt(row.Age || row.age || 0) || 0,
      Gender: row.Gender || row.gender || '',
      BoothID: row.BoothID || row.boothid || row.boothId || '',
      Area: row.Area || row.area || '',
      Occupation: row.Occupation || row.occupation || '',
      Experience: row.Experience || row.experience || '',
    })).filter(v => v.Name && v.Age > 0);
    const data = getVotersData();
    data.voters = voters;
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/cluster`, { voters: data.voters }, { timeout: 10000 });
      data.clusters = aiResponse.data.clusters || [];
      data.recommendations = aiResponse.data.recommendations || [];
      data.voter_groups = aiResponse.data.voter_groups || [];
      data.scheme_groups = aiResponse.data.scheme_groups || [];
      data.group_summary = aiResponse.data.group_summary || [];
    } catch {
      const fallback = fallbackClassification(data.voters);
      data.clusters = fallback.clusters;
      data.recommendations = fallback.recommendations;
      data.voter_groups = fallback.voter_groups;
      data.scheme_groups = fallback.scheme_groups;
      data.group_summary = fallback.group_summary;
    }
    saveVotersData(data);
    res.json({ message: 'Sample data loaded', count: voters.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download sample CSV
app.get('/api/download-sample', (req, res) => {
  const samplePath = path.join(__dirname, '..', 'data', 'sample_voters.csv');
  if (!fs.existsSync(samplePath)) {
    return res.status(404).json({ error: 'Sample file not found' });
  }
  const content = fs.readFileSync(samplePath, 'utf8');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_voters.csv"');
  res.send(content);
});

const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');
if (!fs.existsSync(FEEDBACK_FILE)) fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([]));

app.get('/api/feedback', (req, res) => {
  try {
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', (req, res) => {
  try {
    const { msg, rating, booth, tag } = req.body;
    const item = {
      msg,
      rating: rating || 5,
      booth: booth || 'General',
      tag: tag || 'Citizen Report',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    data.unshift(item);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const CAMPAIGNS_FILE = path.join(__dirname, 'data', 'campaigns.json');
if (!fs.existsSync(CAMPAIGNS_FILE)) {
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([
    { name: 'PM-KISAN Awareness', sent: 1200, opened: 890, replied: 45, date: 'Mar 10, 2025' },
    { name: 'Skill India (Youth)', sent: 420, opened: 312, replied: 28, date: 'Mar 8, 2025' },
  ]));
}

app.get('/api/campaigns', (req, res) => {
  try {
    const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/campaigns', (req, res) => {
  try {
    const { name, segment, sent, type } = req.body;
    // Simulate some simple engagement metrics
    const opened = Math.floor(sent * (0.6 + Math.random() * 0.2)); // 60-80% open rate
    const replied = Math.floor(opened * (0.05 + Math.random() * 0.05)); // 5-10% reply rate
    
    const newCampaign = {
      name: name || `Campaign for ${segment}`,
      sent: sent || 0,
      opened,
      replied,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    const data = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf8'));
    data.unshift(newCampaign);
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, campaign: newCampaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authentication APIs

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_123';

// Booth Officer Signup
app.post('/api/auth/booth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const existing = await BoothOfficer.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const officer = new BoothOfficer({ email, password });
    await officer.save();
    
    const token = jwt.sign({ id: officer._id, role: 'officer' }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ success: true, token, email: officer.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Booth Officer Login
app.post('/api/auth/booth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const officer = await BoothOfficer.findOne({ email });
    if (!officer) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await officer.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: officer._id, role: 'officer' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, email: officer.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Booth Officer Forgot Password (Mock)
app.post('/api/auth/booth/forgot-password', async (req, res) => {
  // Mock feature: always succeed
  res.json({ success: true, message: 'Password reset link sent to your email' });
});

// Voter Signup
app.post('/api/auth/voter/signup', async (req, res) => {
  try {
    const { voterId, password } = req.body;
    if (!voterId || !password) return res.status(400).json({ error: 'Voter ID and password required' });
    if (voterId.length !== 10) return res.status(400).json({ error: 'Voter ID must be 10 characters' });
    
    const existing = await VoterAuth.findOne({ voterId: voterId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Voter ID already registered' });
    
    const voter = new VoterAuth({ voterId: voterId.toUpperCase(), password });
    await voter.save();
    
    const token = jwt.sign({ id: voter._id, role: 'voter', voterId: voter.voterId }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ success: true, token, voterId: voter.voterId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voter Login
app.post('/api/auth/voter/login', async (req, res) => {
  try {
    const { voterId, password } = req.body;
    const voter = await VoterAuth.findOne({ voterId: voterId.toUpperCase() });
    if (!voter) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await voter.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Fetch dynamic voter data
    const data = getVotersData();
    let voterGroups = data.voter_groups || [];
    if (!voterGroups.length && data.voters && data.voters.length > 0) {
      const fb = fallbackClassification(data.voters);
      voterGroups = fb.voter_groups;
    }
    
    // Attempt mapping by voterId hash or just pick random if mapping fails
    // Here we reliably return some consistent data based on voterId hash
    let hash = 0;
    for (let i = 0; i < voterId.length; i++) {
        hash = voterId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % (voterGroups.length || 1);
    const voterData = voterGroups.length ? voterGroups[idx] : null;

    const token = jwt.sign({ id: voter._id, role: 'voter', voterId: voter.voterId }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, voterId: voter.voterId, voterData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voter Forgot Password (Mock)
app.post('/api/auth/voter/forgot-password', async (req, res) => {
  res.json({ success: true, message: 'Password reset link sent to registered mobile number' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`DataPulse Backend running at http://localhost:${PORT}`);
});
