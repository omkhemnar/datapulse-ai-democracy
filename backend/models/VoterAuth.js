const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VoterAuthSchema = new mongoose.Schema({
  voterId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 10,
    maxlength: 10
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Hash password before saving
VoterAuthSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
VoterAuthSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('VoterAuth', VoterAuthSchema);
