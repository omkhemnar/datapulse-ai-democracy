const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('TgUser', new mongoose.Schema({}, { strict: false, collection: 'users' }));
    const users = await User.find({});
    console.log('Total Users in DB:', users.length);
    console.log('Users with chat_id:', users.filter(u => u.chat_id).length);
    if (users.length > 0) {
      console.log('Sample User:', JSON.stringify(users[0], null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
