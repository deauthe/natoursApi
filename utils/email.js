const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  //1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2)define the email options
  const mailOptions = {
    from: 'jonas Schmedtmann <namskaar.io>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  //3)atually send the mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
