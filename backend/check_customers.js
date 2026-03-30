import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menumagic';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const count = await Customer.countDocuments();
    console.log('Total Customers:', count);
    
    const customersWithPhone = await Customer.find({ phone: { $exists: true, $ne: "" } });
    console.log('Customers with phone:', customersWithPhone.length);
    
    if (customersWithPhone.length > 0) {
      console.log('Sample customer:', customersWithPhone[0]);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
