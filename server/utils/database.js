import mongoose from 'mongoose';

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-generator';
      
      console.log('🔌 Connecting to MongoDB Atlas...');
      
      // Atlas-optimized connection options
      const options = {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 10000, // 10 seconds
        connectTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 10, // Maximum number of connections
        minPoolSize: 2, // Minimum number of connections
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
      };
      
      this.connection = await mongoose.connect(mongoURI, options);

      console.log('✅ MongoDB Atlas connected successfully');
      console.log('📍 Database:', this.connection.connection.db.databaseName);
      console.log('🌐 Host:', this.connection.connection.host);
      
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  getConnection() {
    return this.connection;
  }
}

// Export instance as default
const database = new Database();
export default database;
