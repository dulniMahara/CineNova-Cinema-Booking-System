const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', {
    expiresIn: '30d',
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // User exists but email not verified, delete old record and create new one
        await User.findByIdAndDelete(userExists._id);
      }
    }

    // Create user with isEmailVerified = false
    const user = await User.create({ 
      name, 
      email, 
      password,
      isEmailVerified: false 
    });

    // Generate verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL pointing to frontend
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Send verification email
    const message = `
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
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff3d00 0%, #ff5722 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 18px 50px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(255, 61, 0, 0.4);
            transition: all 0.3s ease;
          }
          .link-container {
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #ff3d00;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .link-label {
            font-size: 14px;
            color: #cccccc;
            margin-bottom: 10px;
          }
          .link-text {
            font-size: 12px;
            color: #ff3d00;
            word-break: break-all;
            line-height: 1.6;
          }
          .expiry-notice {
            font-size: 14px;
            color: #ff6b6b;
            margin-top: 20px;
            font-weight: 600;
          }
          .warning {
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
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
            <h2 class="greeting">Welcome, ${name}!</h2>
            
            <p class="message">
              Thank you for registering with Cinema Booking System. To complete your registration and start booking your favorite movies, please verify your email address.
            </p>
            
            <div class="button-container">
              <a href="${verificationURL}" class="verify-button">
                ✓ Verify Email Address
              </a>
            </div>
            
            <div class="link-container">
              <div class="link-label">Or copy and paste this link in your browser:</div>
              <div class="link-text">${verificationURL}</div>
            </div>
            
            <p class="expiry-notice">⏰ This link will expire in 24 hours</p>
            
            <div class="warning">
              <div class="warning-text">
                If you didn't create an account with Cinema Booking System, you can safely ignore this email.
              </div>
            </div>
          </div>
          
          <div class="email-footer">
            <p class="footer-text">This is an automated message, please do not reply.</p>
            <p class="footer-text">© 2026 Cinema Booking System | All Rights Reserved</p>
            <div class="footer-brand">Cinema Booking</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Cinema Booking System',
      html: message
    });

    res.status(201).json({
      success: true,
      message: 'Verification email sent! Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with this token and check if not expired
    let user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    // If no user found with token, check if they might be already verified
    if (!user) {
      // Try to find if there's a recently created verified user (within last 5 minutes)
      // This handles duplicate requests after successful verification
      const recentUser = await User.findOne({
        isEmailVerified: true,
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
      }).sort({ createdAt: -1 });
      
      if (recentUser) {
        return res.status(200).json({
          success: true,
          message: 'Email already verified! You can now login.',
          token: generateToken(recentUser._id),
          user: {
            id: recentUser._id,
            name: recentUser.name,
            email: recentUser.email,
            role: recentUser.role,
          },
        });
      }
      
      return res.status(400).json({ 
        message: 'Verification link is invalid or has expired. Please request a new verification email.' 
      });
    }

    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL pointing to frontend
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Send verification email
    const message = `
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
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff3d00 0%, #ff5722 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 18px 50px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(255, 61, 0, 0.4);
          }
          .link-container {
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #ff3d00;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .link-label {
            font-size: 14px;
            color: #cccccc;
            margin-bottom: 10px;
          }
          .link-text {
            font-size: 12px;
            color: #ff3d00;
            word-break: break-all;
            line-height: 1.6;
          }
          .expiry-notice {
            font-size: 14px;
            color: #ff6b6b;
            margin-top: 20px;
            font-weight: 600;
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
              You requested a new verification email. Please verify your email address by clicking the button below to activate your account.
            </p>
            
            <div class="button-container">
              <a href="${verificationURL}" class="verify-button">
                ✓ Verify Email Address
              </a>
            </div>
            
            <div class="link-container">
              <div class="link-label">Or copy and paste this link in your browser:</div>
              <div class="link-text">${verificationURL}</div>
            </div>
            
            <p class="expiry-notice">⏰ This link will expire in 24 hours</p>
          </div>
          
          <div class="email-footer">
            <p class="footer-text">This is an automated message, please do not reply.</p>
            <p class="footer-text">© 2026 Cinema Booking System | All Rights Reserved</p>
            <div class="footer-brand">Cinema Booking</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Cinema Booking System',
      html: message
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your email.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};