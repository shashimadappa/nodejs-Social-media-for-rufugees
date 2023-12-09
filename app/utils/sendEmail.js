// sendEmail.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Office 365 server
  port: 587, // secure SMTP
  secure: false,
  auth: {
    user: "awonconnect@aworldofneighbours.org",
    pass: "HelloWorld@123",
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    // Send the email
    const info = await transporter.sendMail({
      from: "awonconnect@aworldofneighbours.org", // Sender email address
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// module.exports = transporter;
module.exports = sendEmail;

// Email: awonconnect@aworldofneighbours.org
// Password: HelloWorld@123
