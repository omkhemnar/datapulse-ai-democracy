/**
 * telegramService.js
 * ──────────────────────────────────────────────────────────────
 * Telegram notification module for DataPulse AI Democracy.
 *
 * Exports:
 *   checkEligibility(user, scheme)   → boolean
 *   sendTelegramMessage(chatId, text) → Promise
 *   sendEligibilityAlerts()          → Promise
 *   sendDeadlineReminders()          → Promise
 *
 * Cron: Both functions are scheduled daily at 08:00 AM IST.
 * Duplicate-prevention: a simple in-process Set tracks (chatId+schemeId)
 * combinations already notified today; it resets at midnight.
 */

const axios = require('axios');
const cron  = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();

// ─── Config ────────────────────────────────────────────────────
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8342840254:AAH_POhSrcELwZsrz2UXew0epA2p4j69b70';
const TELEGRAM_API   = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

// ─── Duplicate-prevention store ───────────────────────────────
// Key format: "<chatId>|<schemeId>|<YYYY-MM-DD>"
const sentToday = new Set();

// Reset the store at midnight every day
cron.schedule('0 0 * * *', () => {
  sentToday.clear();
  console.log('[Telegram] Duplicate-prevention store reset for new day.');
});

// ─── Mongoose Models (inline, lightweight) ────────────────────

// User schema – expects: name, age, gender, income, state, chat_id
const userSchema = new mongoose.Schema({
  name:    String,
  age:     Number,
  gender:  String,
  income:  Number,
  state:   String,
  chat_id: String,     // Telegram chat_id
}, { collection: 'users' });

// Scheme schema – expects: name, gender, max_income, state, deadline
const schemeSchema = new mongoose.Schema({
  name:       String,
  gender:     String,  // 'Male' | 'Female' | 'All'
  max_income: Number,
  state:      String,  // 'All' or specific state
  deadline:   Date,
}, { collection: 'schemes' });

// Avoid re-registering models when module is hot-reloaded
const User   = mongoose.models.TgUser   || mongoose.model('TgUser',   userSchema);
const Scheme = mongoose.models.TgScheme || mongoose.model('TgScheme', schemeSchema);

// ─── Core Functions ────────────────────────────────────────────

/**
 * checkEligibility(user, scheme)
 * Returns true if the user meets all scheme criteria.
 */
function checkEligibility(user, scheme) {
  // Gender check
  const schemeGender = (scheme.gender || 'All').toLowerCase();
  const userGender   = (user.gender   || '').toLowerCase();
  if (schemeGender !== 'all' && schemeGender !== userGender) return false;

  // Income check
  if (scheme.max_income != null && user.income > scheme.max_income) return false;

  // State check
  const schemeState = (scheme.state || 'All').toLowerCase();
  if (schemeState !== 'all' && schemeState !== (user.state || '').toLowerCase()) return false;

  return true;
}

/**
 * sendTelegramMessage(chatId, text)
 * Sends a text message to a user via the Telegram Bot API.
 */
async function sendTelegramMessage(chatId, text) {
  try {
    const response = await axios.post(TELEGRAM_API, {
      chat_id:    chatId,
      text:       text,
      parse_mode: 'Markdown',
    }, { timeout: 8000 });

    console.log(`[Telegram] ✅ Sent to ${chatId}`);
    return response.data;
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error(`[Telegram] ❌ Failed to send to ${chatId}:`, detail);
    throw err;
  }
}

/**
 * sendEligibilityAlerts()
 * Loops over every user × scheme pair, checks eligibility,
 * and sends a Telegram message if they haven't been notified today.
 */
async function sendEligibilityAlerts() {
  try {
    console.log('[Telegram] Running eligibility alerts…');

    const users   = await User.find({});
    const schemes = await Scheme.find({});

    if (!users.length)   return console.log('[Telegram] No users found.');
    if (!schemes.length) return console.log('[Telegram] No schemes found.');

    let totalSent = 0;

    for (const user of users) {
      if (!user.chat_id) continue; // skip users without Telegram

      for (const scheme of schemes) {
        if (!checkEligibility(user, scheme)) continue;

        const today  = new Date().toISOString().slice(0, 10);
        const dupKey = `${user.chat_id}|${scheme._id}|${today}`;

        if (sentToday.has(dupKey)) continue; // already notified

        const deadline = scheme.deadline
          ? new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'Check portal';

        const text =
          `✅ *You are eligible for ${scheme.name}*\n` +
          `📅 Deadline: ${deadline}\n` +
          `📢 Apply soon!`;

        try {
          await sendTelegramMessage(user.chat_id, text);
          sentToday.add(dupKey);
          totalSent++;
        } catch (_) {
          // already logged inside sendTelegramMessage
        }

        // Polite rate-limit: 30 msg/s is safe for Telegram
        await sleep(35);
      }
    }

    console.log(`[Telegram] Eligibility alerts done. Sent: ${totalSent}`);
  } catch (err) {
    console.error('[Telegram] sendEligibilityAlerts error:', err.message);
  }
}

/**
 * sendDeadlineReminders()
 * Sends reminder messages for schemes expiring in exactly 1 or 3 days.
 */
async function sendDeadlineReminders() {
  try {
    console.log('[Telegram] Running deadline reminders…');

    const users   = await User.find({});
    const schemes = await Scheme.find({ deadline: { $exists: true } });

    if (!users.length || !schemes.length) return;

    const now   = new Date();
    const DAY   = 24 * 60 * 60 * 1000;
    const ALERT_DAYS = [3, 1];

    let totalSent = 0;

    for (const scheme of schemes) {
      const deadline = new Date(scheme.deadline);
      const daysLeft = Math.round((deadline - now) / DAY);

      if (!ALERT_DAYS.includes(daysLeft)) continue;

      const deadlineStr = deadline.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      for (const user of users) {
        if (!user.chat_id) continue;
        if (!checkEligibility(user, scheme)) continue;

        const dupKey = `reminder|${user.chat_id}|${scheme._id}|D${daysLeft}`;
        if (sentToday.has(dupKey)) continue;

        const text =
          `⏰ *Reminder: ${scheme.name} deadline is near!*\n` +
          `📅 Last date: ${deadlineStr}\n` +
          `⚠️ Apply now!`;

        try {
          await sendTelegramMessage(user.chat_id, text);
          sentToday.add(dupKey);
          totalSent++;
        } catch (_) {}

        await sleep(35);
      }
    }

    console.log(`[Telegram] Deadline reminders done. Sent: ${totalSent}`);
  } catch (err) {
    console.error('[Telegram] sendDeadlineReminders error:', err.message);
  }
}

// ─── Daily Cron Scheduler (08:00 AM IST = 02:30 UTC) ──────────
cron.schedule('30 2 * * *', async () => {
  console.log('[Telegram] Daily cron triggered.');
  await sendEligibilityAlerts();
  await sendDeadlineReminders();
}, { timezone: 'UTC' });

// ─── Utility ───────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Exports ───────────────────────────────────────────────────
module.exports = {
  checkEligibility,
  sendTelegramMessage,
  sendEligibilityAlerts,
  sendDeadlineReminders,
};
