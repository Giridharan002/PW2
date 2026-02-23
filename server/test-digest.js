import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function getTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne();
    if (user) {
      console.log('Found user ID:', user._id);
      console.log('User email:', user.email);
    } else {
      console.log('No users found in database');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

getTestUser();
