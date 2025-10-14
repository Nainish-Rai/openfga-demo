import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return mongoose.connection;
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/compliance";
  await mongoose.connect(uri, { dbName: undefined });
  isConnected = true;
  return mongoose.connection;
}

export function disconnectMongo() {
  if (!isConnected) return;
  isConnected = false;
  return mongoose.disconnect();
}
