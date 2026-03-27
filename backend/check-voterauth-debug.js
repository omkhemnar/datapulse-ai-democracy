const mongoose = require('mongoose');
require('dotenv').config();

async function checkVoterAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const docs = await mongoose.connection.db.collection('voterauth').find({}).toArray();
    console.log('VoterAuth Samples:', JSON.stringify(docs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkVoterAuth();
