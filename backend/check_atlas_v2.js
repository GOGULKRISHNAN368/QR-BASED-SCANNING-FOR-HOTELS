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
    
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      
      console.log(`\n--- DB: ${dbName} ---`);
      // Re-connect to different db
      const dbConn = mongoose.createConnection(`${MONGODB_URI.split('?')[0].replace(/\/[^/?]+$/, '')}/${dbName}?${MONGODB_URI.split('?')[1] || ''}`);
      await dbConn.asPromise();
      const collections = await dbConn.db.listCollections().toArray();
      for (const col of collections) {
          const count = await dbConn.db.collection(col.name).countDocuments();
          console.log(`- ${col.name}: ${count} documents`);
      }
      await dbConn.close();
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDetails();
