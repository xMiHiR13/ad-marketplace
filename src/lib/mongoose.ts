// src/lib/mongoose.ts

import mongoose from "mongoose";

let cached = (global as any).mongoose || {
  conn: null,
  promise: null,
};

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI!;
    const DATABASE_NAME = process.env.DATABASE_NAME!;
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
      bufferCommands: true,
    });
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;

  return cached.conn;
}
