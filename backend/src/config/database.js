import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from backend/.env');
  }

  try {
    mongoose.connection.on('error', (error) => {
      console.error(`MongoDB connection dropped: ${error.message}`);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected; Mongoose will retry the connection.');
    });

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'incognito_chat',
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    if (error.code === 'ENOTFOUND' || error.message.includes('querySrv')) {
      console.error('The MongoDB Atlas hostname in MONGODB_URI is invalid or unavailable. Copy a fresh connection string from Atlas.');
    }
    process.exit(1);
  }
};

export default connectDB;
