const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  voterId: { 
    type: String, 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  relationship: { 
    type: String, 
    required: true,
    enum: ['Son', 'Daughter', 'Father', 'Mother', 'Spouse', 'Grandparent', 'Other']
  },
  age: { 
    type: Number, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true, 
    enum: ['Male', 'Female', 'Other'] 
  },
  education: { 
    type: String, 
    required: true 
  },
  occupation: { 
    type: String, 
    default: '' 
  },
  state: { 
    type: String, 
    required: true 
  },
  incomeCategory: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Medium', 'High', 'EWS', 'LIG', 'MIG', 'General'] 
  },
  disability: { 
    type: String, 
    required: true, 
    enum: ['Yes', 'No'] 
  },
  existingSchemeBeneficiary: { 
    type: String, 
    default: '' 
  },
  eligibleSchemes: {
    type: [String],
    default: []
  },
  remindersEnabled: { 
    type: Boolean, 
    default: true 
  },
  reminders: [{
    schemeName: { type: String, required: true },
    triggerAge: { type: Number, required: true },
    scheduledDate: { type: Date, required: true },
    sent: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
