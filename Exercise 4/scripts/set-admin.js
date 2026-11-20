import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run set-admin -- user@example.com');
  process.exit(1);
}

try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from .env.');

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'admin' } },
    { new: true, runValidators: true }
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`${user.email} is now an admin.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
