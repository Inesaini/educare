const nodemailer = require("nodemailer");
const { smtp } = require("../config");

const transporter = smtp.host
  ? nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    })
  : null;

// Without SMTP settings (local development) the email is printed in the
// console, so activation and reset links can still be followed.
const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log(`\n✉️  Email to ${to}: ${subject}\n${text}\n`);
    return;
  }
  try {
    await transporter.sendMail({ from: smtp.from, to, subject, text });
  } catch (err) {
    console.error(`Could not send email to ${to}:`, err.message);
  }
};

module.exports = { sendEmail };
