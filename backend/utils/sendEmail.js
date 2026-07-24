const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
    };

    if (html) {
      mailOptions.html = html;
    } else {
      mailOptions.text = text;
    }

    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email Error:', error);
    throw error;
  }
};

module.exports = sendEmail;