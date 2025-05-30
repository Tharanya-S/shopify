const express = require("express");
const { connectDB } = require("./config/database");
const transporter = require("./config/mail");
const User = require("./models/user");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
const otpStore = {};

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp; // Store OTP in memory

    await transporter.sendMail({
      from: '"Shopify" <noreply@myapp.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    });

    res.json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP or save user" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  const validOtp = otpStore[email];
  if (validOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    let user = await User.findOne({ emailid: email });
    if (!user) {
      user = new User({ emailid: email });
      await user.save();
      console.log("User created after OTP:", user);
    } else {
      console.log("User already exists:", user);
    }

    const token = jwt.sign(
      { email: user.emailid, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    delete otpStore[email]; // Remove OTP after success

    res.json({ message: "OTP verified, user created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

connectDB()
  .then(() => {
    console.log("DB connected");
    app.listen(7777, () => {
      console.log("Server running successfully on Port : 7777");
    });
  })
  .catch(() => {
    console.log("DB not connected");
  });
