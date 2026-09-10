const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Ethereal test email account created:", testAccount.user);
  return transporter;
};

const sendMail = async (mailOptions) => {
  const t = await getTransporter();
  const info = await t.sendMail(mailOptions);
  console.log(
    "Email preview URL:",
    nodemailer.getTestMessageUrl(info)
  );
  return info;
};

module.exports = { sendMail };
