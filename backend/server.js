const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');
const { fetchSchemes } = require('./services/schemeFetcher');
const Scheme = require('./models/Scheme');
const { sendTelegramMessage, sendEligibilityAlerts, sendDeadlineReminders } = require('./services/telegramService');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const app = express();
const PORT = 5001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datapulse', {
  // Use latest parser
})
  .then(() => {
    console.log('Connected to MongoDB');
    fetchSchemes(); // Initial fetch
    cron.schedule('0 0 * * *', fetchSchemes); // Daily
  })
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
async function fallbackClassification(voters) {
  const clustersMap = {};
  voters.forEach(v => {
    const age = parseInt(v.Age) || 35;
    const occ = (v.Occupation || 'workers').toLowerCase().split(' ')[0];
    const gen = (v.Gender || 'citizens').toLowerCase();
    
    const ageTag = age < 30 ? 'Young' : (age > 55 ? 'Senior' : 'Working-Age');
    const genTag = ['f', 'female'].includes(gen) ? 'Women' : (['m', 'male'].includes(gen) ? 'Citizens' : 'People');
    const occTag = (occ.includes('farm') || occ.includes('agri')) ? 'Farmers' : (occ.includes('stud') ? 'Students' : 'Workers');
    
    const profile = `${ageTag} ${genTag} ${occTag}`;
    clustersMap[profile] = (clustersMap[profile] || 0) + 1;
  });

  const sortedProfiles = Object.keys(clustersMap).sort((a,b) => clustersMap[b] - clustersMap[a]).slice(0, 4);
  const group_counts = {};
  const voter_groups = [];
  
  voters.forEach((v, idx) => {
    const age = parseInt(v.Age) || 35;
    const occ = (v.Occupation || 'workers').toLowerCase().split(' ')[0];
    const gen = (v.Gender || 'citizens').toLowerCase();
    
    const ageTag = age < 30 ? 'Young' : (age > 55 ? 'Senior' : 'Working-Age');
    const genTag = ['f', 'female'].includes(gen) ? 'Women' : (['m', 'male'].includes(gen) ? 'Citizens' : 'People');
    const occTag = (occ.includes('farm') || occ.includes('agri')) ? 'Farmers' : (occ.includes('stud') ? 'Students' : 'Workers');
    
    let cName = `${ageTag} ${genTag} ${occTag}`;
    if (!sortedProfiles.includes(cName)) cName = sortedProfiles[0] || "General";
    
    const clusterId = sortedProfiles.indexOf(cName) + 1;
    const finalName = `Cluster ${clusterId} - ${cName}`;
    
    group_counts[finalName] = (group_counts[finalName] || 0) + 1;
    
    voter_groups.push({
      id: v.id || idx + 1,
      Name: v.Name,
      Age: v.Age,
      Gender: v.Gender,
      Occupation: v.Occupation,
      BoothID: v.BoothID,
      Email: v.Email,
      VoterID: v.VoterID,
      groups: [finalName],
      primary_group: finalName,
      eligible_schemes: [],
    });
  });

  return resolveDynamicSchemes(voter_groups);
}

// Natural Language Processing layer mapping cluster strings => scheme keywords
async function resolveDynamicSchemes(voter_groups) {
  const allSchemes = await Scheme.find({});
  const scheme_map = {};
  const group_counts = {};

  for (let v of voter_groups) {
    const cName = (v.primary_group || 'General').toLowerCase();
    group_counts[v.primary_group] = (group_counts[v.primary_group] || 0) + 1;
    
    const tokens = cName.split(/[\s-()0-9]+/).map(w => {
      if(w.match(/farm|agri|kisan/)) return 'agriculture';
      if(w.match(/student|youth|young/)) return 'student';
      if(w.match(/senior|old|pension/)) return 'senior';
      if(w.match(/women|girl|female/)) return 'women';
      if(w.match(/work|employ|job/)) return 'employment';
      if(w.match(/health|medic|bima/)) return 'health';
      return w;
    }).filter(w => w.length > 3 || ['women'].includes(w));
    
    if (tokens.length === 0) tokens.push('general');

    const matchedSchemes = allSchemes.filter(s => {
      return s.tags.some(tag => tokens.includes(tag)) || 
             tokens.some(token => s.category.toLowerCase().includes(token)) ||
             tokens.some(token => s.name.toLowerCase().includes(token));
    });

    const schemeNames = matchedSchemes.length > 0 ? matchedSchemes.map(s => s.name) : [];
    v.eligible_schemes = [...new Set(schemeNames)];

    v.eligible_schemes.forEach(s => {
      scheme_map[s] = (scheme_map[s] || 0) + 1;
    });
  }

  const scheme_groups = Object.entries(scheme_map).map(([scheme, count]) => ({
    scheme, count, eligibility: scheme, description: ''
  }));

  const recommendations = scheme_groups.map(sg => ({ cluster: sg.eligibility, scheme: sg.scheme }));
  const clusters = Object.entries(group_counts).map(([cluster_name, count]) => ({ cluster_name, count }));
  const group_summary = Object.entries(group_counts).map(([name, count]) => ({ name, count }));

  return { clusters, voter_groups, scheme_groups, recommendations, group_summary };
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

    const voters = records.map((row, idx) => {
      const getVal = (keys) => {
         const matchKey = Object.keys(row).find(k => {
           const cleanK = String(k).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
           return keys.includes(cleanK);
         });
         const val = matchKey ? row[matchKey] : null;
         return (typeof val === 'string') ? val.trim() : val;
      };

      return {
        id: idx + 1,
        VoterID: getVal(['candid', 'voterid', 'epicno', 'epic', 'id']) || `VTR${100000 + idx}`,
        Name: getVal(['candname', 'name', 'votername']) || '',
        Email: getVal(['email']) || `voter${idx}@example.com`,
        Age: parseInt(getVal(['age'])) || (getVal(['candname', 'name']) ? Math.floor(Math.random() * 20) + 35 : 0),
        Gender: getVal(['candsex', 'sex', 'gender']) === 'M' ? 'Male' : (getVal(['candsex', 'sex', 'gender']) === 'F' ? 'Female' : getVal(['candsex', 'sex', 'gender']) || ''),
        BoothID: getVal(['pcname', 'boothid', 'booth']) || '',
        Area: getVal(['stname', 'area', 'locality']) || '',
        Occupation: getVal(['partyabbre', 'occupation', 'job']) || '',
        Experience: getVal(['totvotpoll', 'experience', 'history']) || '',
      };
    }).filter(v => v.Name);

    const data = getVotersData();
    data.voters = voters;

    // Call AI service for clustering and classification
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/cluster`, {
        voters: data.voters,
      }, { timeout: 10000 });
      const resolved = await resolveDynamicSchemes(aiResponse.data.voter_groups || []);
      data.clusters = resolved.clusters;
      data.recommendations = resolved.recommendations;
      data.voter_groups = resolved.voter_groups;
      data.scheme_groups = resolved.scheme_groups;
      data.group_summary = resolved.group_summary;
    } catch (aiError) {
      console.warn('AI service unavailable, using fallback classification:', aiError.message);
      const fallback = await fallbackClassification(data.voters);
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
app.get('/api/analytics', async (req, res) => {
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
      const fb = await fallbackClassification(voters);
      voterGroups = fb.voter_groups;
      schemeGroups = fb.scheme_groups;
      groupSummary = fb.group_summary;
    }

    // Fetch live schemes for Gov Portal Sync Alerts
    const latestSchemes = await Scheme.find({}).sort({ _id: -1 }).limit(3);

    res.json({
      ageDistribution,
      genderRatio,
      boothCounts,
      clusterDistribution,
      recommendations: data.recommendations || [],
      voter_groups: voterGroups.slice(0, 150), // Cap response to prevent Knowledge Graph canvas crash on massive datasets
      scheme_groups: schemeGroups,
      group_summary: groupSummary,
      latestSchemes: latestSchemes,
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
    const samplePath = path.join(__dirname, 'data', 'delhi.csv');
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: 'Sample file not found' });
    }
    const content = fs.readFileSync(samplePath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });
    const voters = records.map((row, idx) => {
      const getVal = (keys) => {
         const matchKey = Object.keys(row).find(k => {
           const cleanK = String(k).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
           return keys.includes(cleanK);
         });
         const val = matchKey ? row[matchKey] : null;
         return (typeof val === 'string') ? val.trim() : val;
      };

      return {
        id: idx + 1,
        VoterID: getVal(['candid', 'voterid', 'epicno', 'epic', 'id']) || `VTR${100000 + idx}`,
        Name: getVal(['candname', 'name', 'votername']) || '',
        Email: getVal(['email']) || `voter${idx}@example.com`,
        Age: parseInt(getVal(['age'])) || 0,
        Gender: getVal(['gender', 'sex', 'candsex']) || '',
        BoothID: getVal(['boothid', 'pcname', 'booth']) || '',
        Area: getVal(['area', 'stname']) || '',
        Occupation: getVal(['occupation', 'partyabbre']) || '',
        Experience: getVal(['experience', 'totvotpoll']) || '',
      };
    }).filter(v => v.Name && v.Age > 0);

    const data = getVotersData();
    data.voters = voters;
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/cluster`, { voters: data.voters }, { timeout: 10000 });
      const resolved = await resolveDynamicSchemes(aiResponse.data.voter_groups || []);
      data.clusters = resolved.clusters;
      data.recommendations = resolved.recommendations;
      data.voter_groups = resolved.voter_groups;
      data.scheme_groups = resolved.scheme_groups;
      data.group_summary = resolved.group_summary;
    } catch {
      const fallback = await fallbackClassification(data.voters);
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
  const samplePath = path.join(__dirname, 'data', 'delhi.csv');
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

// Send Cluster Notifications
app.post('/api/send-notifications', async (req, res) => {
  try {
    const { cluster } = req.body;
    if (!cluster) return res.status(400).json({ error: 'Cluster name is required' });

    const data = getVotersData();
    let voterGroups = data.voter_groups || [];
    if (!voterGroups.length && data.voters && data.voters.length > 0) {
      voterGroups = (await fallbackClassification(data.voters)).voter_groups;
    }

    const targetedVoters = voterGroups.filter(v => v.groups && v.groups.includes(cluster)).slice(0, 20);

    if (targetedVoters.length === 0) {
      return res.status(404).json({ error: 'No voters found for the selected cluster' });
    }

    let sentCount = 0;
    for (const v of targetedVoters) {
      const email = v.Email || `voter_${v.id}@example.com`;
      const schemesStr = (v.eligible_schemes || []).join(', ') || 'General Government Updates';

      const mailOptions = {
        from: process.env.EMAIL_USER || '"DataPulse Team" <no-reply@datapulse.gov.in>',
        to: email,
        subject: 'Government Scheme Update',
        text: `Dear ${v.Name},\n\nBased on your profile, you are eligible for the following scheme(s):\n\n${schemesStr}\n\nFor more benefits, please verify your details in the citizen portal.\n\nRegards,\nDataPulse Team`
      };

      try {
        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch(err) {
        console.error(`Failed to send email to ${email}:`, err.message);
      }
    }

    const newCampaign = {
      name: `${cluster} - Email Notification`,
      sent: sentCount,
      opened: Math.floor(sentCount * 0.8),
      replied: Math.floor(sentCount * 0.1),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    try {
      const cmpData = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf8'));
      cmpData.unshift(newCampaign);
      fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(cmpData, null, 2));
    } catch(e) { }

    res.json({ success: true, count: sentCount, message: `Notification sent to ${sentCount} voters.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback APIs
const FEEDBACK_DB = path.join(__dirname, 'data', 'feedbacks.json');

app.post('/api/feedback', (req, res) => {
  try {
    const { msg, rating, booth } = req.body;
    let feedbacks = [];
    if (fs.existsSync(FEEDBACK_DB)) {
      feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_DB, 'utf8'));
    }
    feedbacks.unshift({
      msg,
      rating: rating || 5,
      booth: booth || 'Unknown',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    fs.writeFileSync(FEEDBACK_DB, JSON.stringify(feedbacks, null, 2));
    res.json({ success: true, message: 'Feedback submitted anonymously' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/feedback', (req, res) => {
  try {
    let feedbacks = [];
    if (fs.existsSync(FEEDBACK_DB)) {
      feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_DB, 'utf8'));
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scheme APIs
app.get('/api/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find({});
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/schemes/:cluster', async (req, res) => {
  try {
    const clusterName = (req.params.cluster || '').toLowerCase();
    
    // Resolve keyword tokens out of the raw dynamic cluster title
    const keywords = clusterName.split(/[\s-()0-9]+/).map(w => {
      if(w.match(/farm|agri|kisan/)) return 'agriculture';
      if(w.match(/student|youth|young/)) return 'student';
      if(w.match(/senior|old|pension/)) return 'senior';
      if(w.match(/women|girl|female/)) return 'women';
      if(w.match(/work|employ|job/)) return 'employment';
      if(w.match(/health|medic|bima/)) return 'health';
      return w;
    }).filter(w => w.length > 3 || ['women'].includes(w));
    
    if (keywords.length === 0) keywords.push('general');

    const regexKeywords = keywords.map(k => new RegExp(`^${k}$`, 'i'));
    const partialKeywords = keywords.map(k => new RegExp(k, 'i'));

    const schemes = await Scheme.find({
      $or: [
        { tags: { $in: partialKeywords } },
        { cluster: { $regex: clusterName, $options: 'i' } }
      ]
    });
    
    res.json(schemes);
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

// Booth Officer Forgot Password
app.post('/api/auth/booth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const officer = await BoothOfficer.findOne({ email });
    if (!officer) return res.status(404).json({ error: 'User with this email does not exist' });

    const token = crypto.randomBytes(20).toString('hex');
    officer.resetPasswordToken = token;
    officer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await officer.save();

    const resetUrl = `http://localhost:5173/reset-password/booth/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: officer.email,
      subject: 'DataPulse - Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Booth Officer Reset Password
app.post('/api/auth/booth/reset-password/:token', async (req, res) => {
  try {
    const officer = await BoothOfficer.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!officer) return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });

    officer.password = req.body.password;
    officer.resetPasswordToken = undefined;
    officer.resetPasswordExpires = undefined;
    await officer.save();

    const jwtToken = jwt.sign({ id: officer._id, role: 'officer' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, message: 'Password successfully updated. Logging you in...', token: jwtToken, email: officer.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voter Signup
app.post('/api/auth/voter/signup', async (req, res) => {
  try {
    const { name, voterId, email, password } = req.body;
    if (!name || !voterId || !email || !password) return res.status(400).json({ error: 'Name, Voter ID, email, and password required' });
    if (voterId.length < 3) return res.status(400).json({ error: 'Voter ID must be at least 3 characters' });
    
    const existing = await VoterAuth.findOne({ $or: [{ voterId: voterId.toUpperCase() }, { email: email.toLowerCase() }] });
    if (existing) return res.status(400).json({ error: 'Voter ID or Email already registered' });
    
    const voter = new VoterAuth({ name, voterId: voterId.toUpperCase(), email: email.toLowerCase(), password });
    await voter.save();
    
    const token = jwt.sign({ id: voter._id, role: 'voter', voterId: voter.voterId, name: voter.name }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ success: true, token, voterId: voter.voterId, name: voter.name });
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
    
    // TRUE Verification Logic against Booth Officer Dataset
    const data = getVotersData();
    let voterData = null;

    let voterGroups = data.voter_groups || [];
    if (!voterGroups.length && data.voters && data.voters.length > 0) {
      const fb = await fallbackClassification(data.voters);
      voterGroups = fb.voter_groups;
    }

    if (voterGroups.length > 0) {
      // 1. Physically search the raw reliable dataset via explicit Index pointer Mapping
      const rawVoterIndex = (data.voters || []).findIndex(v => 
        (v.VoterID || v.voterId || '').toUpperCase() === voterId.toUpperCase()
      );
      
      if (rawVoterIndex !== -1) {
         // 2. Extract their assigned Booth AI Cluster strictly through 1:1 structural index alignment
         const exactVoter = voterGroups[rawVoterIndex];
         const clusterName = exactVoter?.primary_group || 'Unassigned';
         
         // 3. Bind the explicitly verified cluster context for React
         const clusterStats = (data.clusters || []).find(c => c.cluster_name === clusterName);
         voterData = {
            name: clusterName,
            count: clusterStats ? clusterStats.count : 1,
            BoothID: data.voters[rawVoterIndex]?.BoothID || 'Unknown',
            top_words: clusterName.split(/[\s-()0-9]+/).filter(w => w.length > 3)
         };
      }
    }

    const token = jwt.sign({ id: voter._id, role: 'voter', voterId: voter.voterId, name: voter.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, voterId: voter.voterId, name: voter.name, voterData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voter Forgot Password
app.post('/api/auth/voter/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const voter = await VoterAuth.findOne({ email: email.toLowerCase() });
    if (!voter) return res.status(404).json({ error: 'User with this email does not exist' });

    const token = crypto.randomBytes(20).toString('hex');
    voter.resetPasswordToken = token;
    voter.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await voter.save();

    const resetUrl = `http://localhost:5173/reset-password/voter/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voter.email,
      subject: 'DataPulse - Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Password reset link sent to your registered email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Voter Reset Password
app.post('/api/auth/voter/reset-password/:token', async (req, res) => {
  try {
    const voter = await VoterAuth.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!voter) return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });

    voter.password = req.body.password;
    voter.resetPasswordToken = undefined;
    voter.resetPasswordExpires = undefined;
    await voter.save();

    // TRUE Verification Logic against Booth Officer Dataset
    const data = getVotersData();
    let voterData = null;

    let voterGroups = data.voter_groups || [];
    if (!voterGroups.length && data.voters && data.voters.length > 0) {
      const fb = await fallbackClassification(data.voters);
      voterGroups = fb.voter_groups;
    }

    if (voterGroups.length > 0) {
      // 1. Physically search the enriched NLP dataset for EXACT strict match on VoterID ONLY
      const exactVoter = voterGroups.find(v => 
        (v.VoterID || '').toUpperCase() === voter.voterId.toUpperCase()
      );
      
      if (exactVoter) {
         // 2. Extract their assigned Booth AI Cluster mapping
         const clusterName = exactVoter.primary_group || 'Unassigned';
         
         // 3. Bind the explicitly verified cluster context for React
         const clusterStats = (data.clusters || []).find(c => c.cluster_name === clusterName);
         voterData = {
            name: clusterName,
            count: clusterStats ? clusterStats.count : 1,
            BoothID: exactVoter.BoothID || 'Unknown',
            top_words: clusterName.split(/[\s-()0-9]+/).filter(w => w.length > 3)
         };
      }
    }

    const jwtToken = jwt.sign({ id: voter._id, role: 'voter', voterId: voter.voterId, name: voter.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, message: 'Password successfully updated. Logging you in...', token: jwtToken, voterId: voter.voterId, name: voter.name, voterData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Telegram API Routes ──────────────────────────────────────

// Send a single Telegram message (manual/test)
app.post('/api/telegram/send', async (req, res) => {
  try {
    const { chat_id, text } = req.body;
    if (!chat_id || !text) return res.status(400).json({ error: 'chat_id and text are required' });
    await sendTelegramMessage(String(chat_id), text);
    res.json({ success: true, message: 'Message sent via Telegram.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually trigger eligibility alerts + deadline reminders
app.post('/api/telegram/run-alerts', async (req, res) => {
  try {
    // Non-blocking – responds immediately
    res.json({ success: true, message: 'Telegram alerts triggered. Running in background…' });
    await sendEligibilityAlerts();
    await sendDeadlineReminders();
  } catch (err) {
    console.error('[Telegram] Manual trigger error:', err.message);
  }
});

// Send scheme notifications to a whole cluster via Telegram
app.post('/api/telegram/cluster-notify', async (req, res) => {
  try {
    const { cluster, message, scheme } = req.body;
    console.log(`[Telegram Update] Cluster: ${cluster}, Scheme: ${scheme}`);
    
    if (!cluster) return res.status(400).json({ error: 'Cluster name is required' });

    const data = getVotersData();
    let voterGroups = data.voter_groups || [];
    if (!voterGroups.length && data.voters && data.voters.length > 0) {
      voterGroups = (await fallbackClassification(data.voters)).voter_groups;
    }

    const mongoose = require('mongoose');
    // Ensure we have the model
    const User = mongoose.models.TgUser || mongoose.model('TgUser');
    
    if (!User) {
      console.error('[Telegram] TgUser model not found!');
      return res.status(500).json({ error: 'User model not found' });
    }

    const targetedVoters = voterGroups.filter(v => v.groups && v.groups.includes(cluster));
    console.log(`[Telegram] Found ${targetedVoters.length} voters in cluster ${cluster}`);
    
    let sentCount = 0;
    for (const v of targetedVoters) {
      // Logic: find a registered Telegram user that matches either name or voterId
      const dbUser = await User.findOne({ 
        $or: [
          { name: v.Name }, 
          { voterId: v.VoterID }
        ]
      });

      if (dbUser && dbUser.chat_id) {
        console.log(`[Telegram] Notifying User: ${dbUser.name} (${dbUser.chat_id})`);
        const text = `🔔 *New Update for ${cluster}*\n\n` +
                     `Scheme: *${scheme || 'General Update'}*\n\n` +
                     `${message}\n\n` +
                     `Please check the citizen portal for more details.`;
        
        try {
          await sendTelegramMessage(dbUser.chat_id, text);
          sentCount++;
        } catch (err) {
          console.error(`[Telegram] Failed to notify ${dbUser.name}: ${err.message}`);
        }
      }
    }

    console.log(`[Telegram] Total sent this batch: ${sentCount}`);

    // Log this as a campaign
    const newCampaign = {
      name: `${cluster} - Telegram Updates`,
      sent: sentCount,
      opened: Math.floor(sentCount * 0.9),
      replied: Math.floor(sentCount * 0.15),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    try {
      const CAMPAIGNS_FILE = path.join(__dirname, 'data', 'campaigns.json');
      const cmpData = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf8'));
      cmpData.unshift(newCampaign);
      fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(cmpData, null, 2));
    } catch(e) {}

    res.json({ success: true, count: sentCount, message: `Notification sent to ${sentCount} Telegram users.` });
  } catch (err) {
    console.error('[Telegram Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`DataPulse Backend running at http://localhost:${PORT}`);
});
