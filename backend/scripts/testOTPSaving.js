require('dotenv').config();
const mongoose = require('mongoose');
const OTP = require('../models/OTP');

async function testOTPSaving() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Test email
    const testEmail = 'test@example.com';
    const testOTP = '123456';

    // Clean up any existing OTPs
    await OTP.deleteMany({ email: testEmail });
    console.log('🧹 Cleaned up existing OTPs');

    // Create new OTP
    console.log('\nCreating OTP...');
    const otpRecord = await OTP.create({ 
      email: testEmail, 
      otp: testOTP 
    });
    
    console.log('OTP created successfully:', {
      id: otpRecord._id,
      email: otpRecord.email,
      otp: otpRecord.otp,
      createdAt: otpRecord.createdAt
    });

    // Verify OTP was saved
    console.log('\nVerifying OTP in database...');
    const foundOTP = await OTP.findOne({ email: testEmail, otp: testOTP });
    
    if (foundOTP) {
      console.log('OTP found in database:', {
        id: foundOTP._id,
        email: foundOTP.email,
        otp: foundOTP.otp,
        createdAt: foundOTP.createdAt
      });
    } else {
      console.log('OTP NOT found in database!');
    }

    // List all OTPs
    console.log('\nAll OTPs in database:');
    const allOTPs = await OTP.find({});
    console.log(`Total OTPs: ${allOTPs.length}`);
    allOTPs.forEach((otp, index) => {
      console.log(`${index + 1}. Email: ${otp.email}, OTP: ${otp.otp}, Created: ${otp.createdAt}`);
    });

    // Clean up test data
    console.log('\nCleaning up test data...');
    await OTP.deleteMany({ email: testEmail });
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

testOTPSaving();
