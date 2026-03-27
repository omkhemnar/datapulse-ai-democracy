const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, default: 'Central' },
  state: { type: String, default: 'All' },
  description: { type: String, default: '' },
  benefits: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  documents: { type: [String], default: [] },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  link: { type: String, default: '' },
  category: { type: String, default: 'General' },
  tags: { type: [String], default: [] },
  cluster: {
    type: String,
    default: 'Dynamic'
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scheme', schemeSchema);
