const nodemailer = require('nodemailer');
const crypto = require("crypto")

const sendOTP = async (email) => {
  const generateOTP = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  };
  const otp = generateOTP()
  const otpExpires = new Date(Date.now()+2*60*1000)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "OTP",
    text: `This is your otp : ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("email send")
    return {otp,otpExpires}
  } catch (error) {
    console.log("error on sending email:", error)
  }
};

module.exports = sendOTP;
