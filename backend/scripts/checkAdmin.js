require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI );
    console.log('Connected to MongoDB\n');

    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('No admin users found in database');
    } else {
      console.log(`Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();
