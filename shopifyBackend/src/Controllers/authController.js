const User = require("../models/user");
const transporter = require("../config/mail");
const jwt = require("jsonwebtoken");

const otpStore = {}; // In-memory store

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  await transporter.sendMail({
    from: '"Shopify" <noreply@myapp.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  });

  res.json({ message: "OTP sent to your email!" });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  if (otpStore[email] !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  let user = await User.findOne({ emailid: email });
  if (!user) {
    user = new User({ emailid: email });
    await user.save();
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  res.json({ message: "OTP verified, user authenticated!" });
};

exports.landingPage = (req, res) => {
  res.json({ message: `Welcome, ${req.user.emailid}!` });
};
