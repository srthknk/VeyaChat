import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

const models = [User, Chat, Message];

const initializeDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'incognito_chat',
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`Connected to database: ${mongoose.connection.name}`);

  for (const model of models) {
    await model.createCollection();
    await model.syncIndexes();
    console.log(`Ready: ${model.collection.name}`);
  }

  await mongoose.disconnect();
  console.log('Database initialization complete.');
};

initializeDatabase().catch(async (error) => {
  console.error(`Database initialization failed: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});