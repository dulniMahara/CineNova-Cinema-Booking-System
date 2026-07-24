const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email first
    await OTP.deleteMany({ email });

    // Create new OTP
    const otpRecord = await OTP.create({ email, otp });
    
    // Verify OTP was saved
    if (!otpRecord) {
      throw new Error('Failed to save OTP to database');
    }
    
    console.log('OTP saved successfully:', { email, otpId: otpRecord._id });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #141436;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5f 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #141436 0%, #1a1a3e 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 2px solid rgba(255, 61, 0, 0.3);
          }
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin: 0;
            background: linear-gradient(135deg, #fff 0%, #ff3d00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .email-body {
            padding: 50px 40px;
            color: #ffffff;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #ffffff;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #cccccc;
            margin-bottom: 30px;
          }
          .otp-container {
            background: rgba(255, 61, 0, 0.1);
            border: 2px solid rgba(255, 61, 0, 0.5);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 14px;
            color: #cccccc;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            font-size: 30px;
            font-weight: 800;
            color: #ff3d00;
            letter-spacing: 8px;
            margin: 10px 0;
            text-shadow: 0 2px 10px rgba(255, 61, 0, 0.3);
          }
          .expiry-notice {
            font-size: 14px;
            color: #ff6b6b;
            margin-top: 15px;
            font-weight: 600;
          }
          .warning {
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #ff3d00;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .warning-title {
            font-size: 16px;
            font-weight: 700;
            color: #ff3d00;
            margin-bottom: 10px;
          }
          .warning-text {
            font-size: 14px;
            color: #cccccc;
            line-height: 1.6;
          }
          .email-footer {
            background: linear-gradient(135deg, #0f0f2e 0%, #141436 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          .footer-text {
            font-size: 14px;
            color: #888888;
            margin: 5px 0;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #ff3d00;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1 class="logo">🎬 Cinema Booking</h1>
          </div>
          
          <div class="email-body">
            <h2 class="greeting">Hello, ${user.name}!</h2>
            
            <p class="message">
              We received a request to reset your password. Use the One-Time Password (OTP) below to complete your password reset.
            </p>
            
            <div class="otp-container">
              <div class="otp-label">Your OTP Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-notice">⏰ Valid for 10 minutes</div>
            </div>
            
            <p class="message">
              Simply enter this code to reset your password. If you didn't request this, you can safely ignore this email.
            </p>
            
            <div class="warning">
              <div class="warning-title">🔒 Security Notice</div>
              <div class="warning-text">
                Never share your OTP with anyone. Our team will never ask you for this code via phone, email, or any other means. If you didn't request this password reset, please contact our support team immediately.
              </div>
            </div>
          </div>
          
          <div class="email-footer">
            <p class="footer-text">This is an automated message, please do not reply.</p>
            <p class="footer-text">© 2025 Cinema Booking System | All Rights Reserved</p>
            <div class="footer-brand">Cinema Booking</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      email,
      '🔐 Password Reset OTP - Cinema Booking',
      `Your OTP for password reset is: ${otp}\nValid for 10 minutes.`,
      htmlTemplate
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('Verifying OTP for email:', email);
    
    const otpRecord = await OTP.findOne({ email, otp });
    
    if (!otpRecord) {
      // Debug: Check if OTP exists for this email
      const allOtpsForEmail = await OTP.find({ email });
      console.log('Available OTPs for email:', allOtpsForEmail);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log('OTP verified successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};