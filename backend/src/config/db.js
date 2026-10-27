const mongoose = require('mongoose');
const config = require('./index');

let mongod = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Could not connect to external MongoDB at ${config.mongodbUri}: ${error.message}`);
    if (error.message.includes('SSL routines') || error.message.includes('whitelist') || error.name === 'MongooseServerSelectionError') {
      console.warn('NOTICE: To connect to MongoDB Atlas, add your current public IP (or 0.0.0.0/0) to MongoDB Atlas > Network Access > IP Access List.');
    }
    console.log('Starting embedded MongoDB instance via mongodb-memory-server for local dev/testing...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Embedded MongoDB connected successfully at ${uri}`);
      return conn;
    } catch (memError) {
      console.error('Failed to start embedded MongoDB:', memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

