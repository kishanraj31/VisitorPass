const { sendMail } = require("../config/mailer");

const sendEmail = async (to, subject, html) => {
  await sendMail({
    from: '"Visitor Pass System" <noreply@visitorpass.local>',
    to,
    subject,
    html,
  });
};

// Real SMS would require a paid provider such as Twilio (twilio npm package,
// account SID, auth token, and a verified sender number). For this local demo
// we simply log the message to the console.
const sendSms = (phone, message) => {
  console.log(`[MOCK SMS] To ${phone}: ${message}`);
};

module.exports = { sendEmail, sendSms };
