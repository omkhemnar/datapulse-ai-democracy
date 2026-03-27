const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8342840254:AAH_POhSrcELwZsrz2UXew0epA2p4j69b70';
const CHAT_ID = process.argv[2]; // Pass your chat ID as an argument

if (!CHAT_ID) {
  console.log('\n❌ Usage: node test-tg.js <YOUR_CHAT_ID>');
  console.log('\n💡 How to find your Chat ID:');
  console.log('1. Open Telegram and search for "@userinfobot"');
  console.log('2. Send any message to it, and it will reply with your "Id"');
  console.log('3. Then run: node test-tg.js <that_id>\n');
  process.exit(1);
}

async function testBot() {
  console.log(`\n🚀 Testing Telegram Bot (Token: ${TOKEN.slice(0, 5)}...)`);
  console.log(`📬 Sending test message to: ${CHAT_ID}...\n`);

  try {
    const res = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: '🔔 *Hello!* This is a test from the DataPulse AI Democracy bot integration.\n\n✅ Your Telegram notifications are now working!',
      parse_mode: 'Markdown'
    });

    if (res.data.ok) {
      console.log('✅ Success! Check your Telegram.');
    } else {
      console.log('❌ Telegram Error:', res.data.description);
    }
  } catch (err) {
    console.error('❌ Request Failed:', err.response?.data?.description || err.message);
  }
}

testBot();
