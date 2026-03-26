import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Dish } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const sampleDishes = [
  {
    name: "Classic Butter Chicken",
    category: "Main Course",
    price: 320,
    available: true,
    offer: "Best Seller",
    offerPercent: 10,
    timeSlots: ["morning", "evening", "night"],
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Paneer Tikka Masala",
    category: "Main Course",
    price: 280,
    available: true,
    offer: "Popular",
    offerPercent: 5,
    timeSlots: ["morning", "evening", "night"],
    imageUrl: "https://images.unsplash.com/photo-1567184109411-b28f2703b142?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Hyderabadi Chicken Biryani",
    category: "Biryani & Rice",
    price: 350,
    available: true,
    offer: "Chef's Special",
    offerPercent: 15,
    timeSlots: ["evening", "night"],
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Garlic Naan",
    category: "Breads",
    price: 60,
    available: true,
    timeSlots: ["morning", "evening", "night"],
    imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Mango Lassi",
    category: "Beverages",
    price: 120,
    available: true,
    timeSlots: ["morning", "evening"],
    imageUrl: "https://images.unsplash.com/photo-1570197711485-3ec220f1797c?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Gulab Jamun",
    category: "Desserts",
    price: 90,
    available: true,
    offer: "Sweet Deal",
    offerPercent: 20,
    timeSlots: ["evening", "night"],
    imageUrl: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&q=80&w=800",
  }
];

async function seedData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error("MONGODB_URI not found in .env");

    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for seeding...");

    const existingCount = await Dish.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} dishes. Skipping seed.`);
    } else {
      await Dish.insertMany(sampleDishes);
      console.log("Seeded 6 sample dishes into Atlas!");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
