// Script to create an admin user
// Run this once: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@cinema.com' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@cinema.com',
      password: 'admin123', 
      role: 'admin',
      isEmailVerified: true, // Admin is auto-verified
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@cinema.com');
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
