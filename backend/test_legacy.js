import mongoose from 'mongoose';

const LEGACY_URI = "mongodb://ssbhuvaneshwarkumar_db_user:b4KRH12IlCPK2xdy@ac-everwfz-shard-00-00.l32rr3n.mongodb.net:27017,ac-everwfz-shard-00-01.l32rr3n.mongodb.net:27017,ac-everwfz-shard-00-02.l32rr3n.mongodb.net:27017/?ssl=true&replicaSet=atlas-7r41bt-shard-0&authSource=admin";

async function testLegacy() {
  try {
    console.log("Attempting Legacy Connection (Direct Shards)...");
    await mongoose.connect(LEGACY_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("SUCCESS! Legacy connection worked.");
    process.exit(0);
  } catch (err) {
    console.error("FAILED! Legacy error:", err.message);
    process.exit(1);
  }
}

testLegacy();
