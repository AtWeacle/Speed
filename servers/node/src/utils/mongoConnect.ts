import mongoose from 'mongoose'


const { MONGODB_URI } = process.env

interface MongooseGlobal extends NodeJS.Global {
  mongoose: {
    connection: mongoose.Connection | null
    promise: Promise<typeof mongoose> | null
  }
}

declare const global: MongooseGlobal

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { connection: null, promise: null }
}

export default async function mongoConnect(): Promise<mongoose.Connection | null> {
  if (cached.connection) {
    return cached.connection
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env')
    }

    const opts = {
      bufferCommands: false,
    }

    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts)
    } catch (error) {
      console.error('Error connecting to MongoDB: ', error)
      return null
    }
  }

  try {
    const mongooseConnected = await cached.promise
    cached.connection = mongooseConnected.connection
    return cached.connection

  } catch (error) {
    console.error('Error connecting to MongoDB: ', error)
    return null
  }
}

export async function mongoDisconnect(): Promise<void> {
  if (cached?.connection?.close) {
    await cached.connection.close()
    cached.connection = null
    cached.promise = null
  }
}

