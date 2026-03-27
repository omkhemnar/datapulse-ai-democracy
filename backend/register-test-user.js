const mongoose = require('mongoose');
require('dotenv').config();

const CHAT_ID = process.argv[2];
const VOTER_NAME = process.argv[3] || 'Gauri Lanke'; 

if (!CHAT_ID) {
  console.log('\n❌ Usage: node register-test-user.js <YOUR_CHAT_ID> ["Voter Name"]');
  console.log('\n💡 Example: node register-test-user.js 5500655114 "Gauri Lanke"\n');
  process.exit(1);
}

async function registerUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.models.TgUser || mongoose.model('TgUser', new mongoose.Schema({
      name: String,
      chat_id: String,
      voterId: String
    }, { collection: 'users' }));

    const newUser = new User({
      name: VOTER_NAME,
      chat_id: CHAT_ID
    });

    await newUser.save();
    console.log(`\n✅ Success! Registered "${VOTER_NAME}" with Chat ID ${CHAT_ID} in the database.`);
    console.log(`Now, when you send a "Telegram Update" to the cluster containing ${VOTER_NAME}, you will receive it!\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error registering user:', err.message);
    process.exit(1);
  }
}

registerUser();
