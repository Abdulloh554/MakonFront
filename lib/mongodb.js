import mongoose from 'mongoose'
import dns from 'dns'

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4'])

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makon'

let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
