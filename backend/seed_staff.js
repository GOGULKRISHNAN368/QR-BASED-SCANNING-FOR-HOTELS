import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Staff } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const sampleStaff = [
  {
    name: "Vikram Sharma",
    role: "Executive Chef",
    imageUrl: "/images/chef.png",
  },
  {
    name: "Anjali Gupta",
    role: "Hotel Manager",
    imageUrl: "/images/manager.png",
  },
  {
    name: "Rahul Verma",
    role: "Head Waiter",
    imageUrl: "/images/waiter.png",
  }
];

async function seedStaff() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for staff seeding...");

    const count = await Staff.countDocuments();
    if (count > 0) {
      console.log("Staff already seeded.");
    } else {
      await Staff.insertMany(sampleStaff);
      console.log("Seeded 3 staff members!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding staff:", error);
    process.exit(1);
  }
}

seedStaff();
