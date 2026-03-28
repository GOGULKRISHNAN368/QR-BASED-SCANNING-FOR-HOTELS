import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log("Connecting to NEW cluster...");
    if (!MONGODB_URI) throw new Error("No MONGODB_URI in ENV");
    
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("SUCCESS! Connected to the NEW Atlas cluster.");
    process.exit(0);
  } catch (err) {
    console.error("FAILED! Error:", err.message);
    process.exit(1);
  }
}

testConnection();
