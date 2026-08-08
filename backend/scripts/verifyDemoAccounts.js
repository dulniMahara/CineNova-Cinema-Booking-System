// Script to update verification status for predefined demo accounts ONLY
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyDemoAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const demoEmails = ['admin@cinema.com', 'customer@cinema.com'];

    const result = await User.updateMany(
      { email: { $in: demoEmails } },
      { $set: { isEmailVerified: true } }
    );

    console.log(`✓ Updated ${result.modifiedCount} demo account(s) to isEmailVerified: true.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verifyDemoAccounts();
