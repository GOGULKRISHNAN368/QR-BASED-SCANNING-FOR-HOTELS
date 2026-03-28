import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkStoreOrder() {
  try {
    const dbName = 'storeorder';
    const uri = `${MONGODB_URI.split('?')[0].replace(/\/[^/?]+$/, '')}/${dbName}?${MONGODB_URI.split('?')[1] || ''}`;
    const conn = await mongoose.connect(uri);
    console.log(`Connected to ${dbName}`);
    
    const db = conn.connection.db;
    const menus = await db.collection('menus').find().toArray();
    console.log(`Found ${menus.length} internal sample dishes in ${dbName}.menus`);
    menus.forEach(m => console.log(`- ${m.name}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStoreOrder();
