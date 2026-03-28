import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDetails() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log("Connected to Atlas");
    const dbs = await conn.connection.db.admin().listDatabases();
    console.log("Databases:", dbs.databases.map(db => db.name).join(', '));
    
    for (const dbName of ['menumagic', 'storeor']) {
      console.log(`\n--- DB: ${dbName} ---`);
      const db = conn.connection.useDb(dbName);
      const collections = await db.db.listCollections().toArray();
      console.log(`Collections:`, collections.map(c => c.name).join(', '));
      for (const c of collections) {
          const count = await db.collection(c.name).countDocuments();
          console.log(`- ${c.name}: ${count} documents`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDetails();
