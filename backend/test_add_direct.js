import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Dish } from './models.js';

dotenv.config();

console.log('Connecting to Atlas...');
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected.');
    const newDish = new Dish({
      name: 'Test Dish ' + Date.now(),
      category: 'Main Course',
      price: 99,
      available: true,
      timeSlots: ['morning']
    });
    
    console.log('Saving dish...');
    const saved = await newDish.save();
    console.log('✅ Saved with ID:', saved._id);
    
    const count = await Dish.countDocuments();
    console.log('Total dishes in DB now:', count);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
