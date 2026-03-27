require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  console.log(`Testing SMTP connection for user: ${process.env.EMAIL_USER}`);
  try {
    await transporter.verify();
    console.log("SUCCESS: The SMTP credentials are completely valid.");
  } catch (error) {
    console.log("FAIL: SMTP failed with the following error:");
    console.log(error.message);
    if (error.message.includes("Application-specific password required") || error.message.includes("Username and Password not accepted")) {
      console.log("---");
      console.log("DIAGNOSIS: You are not using a valid Google App Password, or you made a typo.");
    }
  }
}

testEmail();
