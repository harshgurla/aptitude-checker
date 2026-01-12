import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection pool settings for 100+ users
      maxPoolSize: 50, // Maximum number of connections
      minPoolSize: 10, // Minimum number of connections to keep open
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
      // Performance optimizations
      maxIdleTimeMS: 60000, // Close connections after 60s of inactivity
      retryWrites: true,
      w: 'majority',
    });
    
    mongoose.set('strictQuery', false);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✓ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('✓ MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
