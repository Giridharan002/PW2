import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function findUserByEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({email: 'giri.2004k@gmail.com'});
    if (user) {
      console.log('✅ Found user with verified email:');
      console.log('   User ID:', user._id);
      console.log('   Email:', user.email);
    } else {
      console.log('❌ No user found with giri.2004k@gmail.com email');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

findUserByEmail();
