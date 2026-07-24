// Quick script to check a specific user's verification status
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const emailToCheck = process.argv[2];

if (!emailToCheck) {
  console.log('Usage: node scripts/checkUserStatus.js <email>');
  console.log('Example: node scripts/checkUserStatus.js test@example.com');
  process.exit(1);
}

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email: emailToCheck });
    
    if (!user) {
      console.log(`No user found with email: ${emailToCheck}`);
      process.exit(0);
    }
    
    console.log('\nUser Status:\n');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`isEmailVerified: ${user.isEmailVerified} ✓`);
    console.log(`Has verification token: ${!!user.emailVerificationToken}`);
    console.log(`Token expires: ${user.emailVerificationExpires || 'N/A'}`);
    console.log(`Created at: ${user.createdAt}`);
    
    console.log('\nLogin Status:');
    if (user.isEmailVerified) {
      console.log('This user CAN login');
    } else {
      console.log('This user CANNOT login (email not verified)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
