// Script to verify all existing users in database
// Run this once after implementing email verification: node scripts/verifyExistingUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users where isEmailVerified doesn't exist or is false
    const unverifiedUsers = await User.find({
      $or: [
        { isEmailVerified: { $exists: false } },
        { isEmailVerified: false }
      ]
    });

    if (unverifiedUsers.length === 0) {
      console.log('No users need verification update.');
      process.exit(0);
    }

    console.log(`Found ${unverifiedUsers.length} users to verify.`);
    console.log('Verifying existing users...');

    // Update all unverified users to verified
    const result = await User.updateMany(
      {
        $or: [
          { isEmailVerified: { $exists: false } },
          { isEmailVerified: false }
        ]
      },
      {
        $set: { isEmailVerified: true }
      }
    );

    console.log(`✓ Successfully verified ${result.modifiedCount} users.`);
    console.log('\nNOTE: This was a one-time migration for existing users.');
    console.log('New users will need to verify their email during registration.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verifyExistingUsers();
