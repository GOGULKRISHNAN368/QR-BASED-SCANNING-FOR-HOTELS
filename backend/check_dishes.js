import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Dish } from './models.js';

dotenv.config();

async function check() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const count = await Dish.countDocuments();
    console.log('Total dishes in MongoDB:', count);
    
    const dishes = await Dish.find();
    dishes.forEach(d => {
      console.log(`- ${d.name} (_id: ${d._id}, category: ${d.category})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error checking MongoDB:', err);
    process.exit(1);
  }
}

check();
