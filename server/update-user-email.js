import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateUserEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findByIdAndUpdate('6880c1941263ed7d73e7dc4e', {email: 'giri.2004k@gmail.com'}, {new: true});
    console.log('✅ Updated user email to:', user.email);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateUserEmail();
