const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  // landingPage,
} = require("../controllers/authController");
const { userAuth } = require("../middlewares/authMiddleware");//this has to be added before all the api calls as it verfies if the user is vaild


router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
// router.get("/landing", userAuth, landingPage);

module.exports = router;
