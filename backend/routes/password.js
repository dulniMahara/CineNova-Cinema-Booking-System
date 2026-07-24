const express = require('express');
const {
  sendOTP,
  verifyOTP,
  resetPassword,
} = require('../controllers/passwordController');
const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;