const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey123', {
    expiresIn: '30d',
  });
};

const buildCineNovaVerificationEmailHTML = (name, verificationURL) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your CineNova Account</title>
</head>
<body style="margin:0;padding:0;background-color:#070B0A;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#F5F7F6;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#070B0A;padding:40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;background-color:#102A22;border:1px solid #2F6F5A;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#070B0A;padding:32px 30px;text-align:center;border-bottom:1px solid #2F6F5A;">
              <div style="font-size:28px;font-weight:900;letter-spacing:2px;color:#F5F7F6;text-transform:uppercase;">
                CineNova
              </div>
              <div style="font-size:12px;letter-spacing:1px;color:#C9A95B;margin-top:6px;font-weight:600;">
                Your cinematic experience starts here.
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:40px 32px;text-align:left;">
              <h2 style="margin:0 0 16px 0;color:#F5F7F6;font-size:22px;font-weight:700;">
                Verify Your Email
              </h2>
              <p style="margin:0 0 16px 0;color:#F5F7F6;font-size:15px;line-height:1.6;font-weight:600;">
                Welcome, ${name || 'Valued Member'}!
              </p>
              <p style="margin:0 0 24px 0;color:#9CAAA4;font-size:15px;line-height:1.6;">
                Thanks for creating your CineNova account.<br/><br/>
                Please verify your email address to activate your account and continue booking your favourite movies.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationURL}" target="_blank" style="display:inline-block;background-color:#1F7A5A;color:#F5F7F6;padding:16px 36px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link Box -->
              <div style="background-color:#070B0A;border:1px solid #2F6F5A;border-radius:8px;padding:16px;margin-top:24px;">
                <p style="margin:0 0 8px 0;color:#9CAAA4;font-size:13px;font-weight:600;">
                  Button not working?<br/>
                  Copy and paste the verification link into your browser:
                </p>
                <p style="margin:0;font-size:12px;word-break:break-all;line-height:1.5;">
                  <a href="${verificationURL}" style="color:#C9A95B;text-decoration:underline;">${verificationURL}</a>
                </p>
              </div>

              <!-- Expiry Notice -->
              <p style="margin:24px 0 0 0;color:#C9A95B;font-size:13px;font-weight:600;">
                This verification link expires in 24 hours.
              </p>
              <p style="margin:12px 0 0 0;color:#9CAAA4;font-size:13px;line-height:1.5;">
                If you did not create a CineNova account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#070B0A;padding:24px 30px;text-align:center;border-top:1px solid #2F6F5A;">
              <p style="margin:0 0 6px 0;color:#9CAAA4;font-size:12px;">
                This is an automated message.<br/>
                Please do not reply.
              </p>
              <p style="margin:0;color:#9CAAA4;font-size:12px;font-weight:600;">
                © 2026 CineNova. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
    const message = buildCineNovaVerificationEmailHTML(user.name, verificationURL);

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - CineNova',
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
      token: generateToken(user._id, user.role),
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
    const message = buildCineNovaVerificationEmailHTML(user.name, verificationURL);

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - CineNova',
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