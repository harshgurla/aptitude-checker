import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { updateLeaderboardRanks } from './src/services/leaderboardService.js';

// Load environment variables
dotenv.config();

const fixRanks = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    console.log('Updating all leaderboard ranks...');
    await updateLeaderboardRanks();
    console.log('✅ All ranks updated successfully!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing ranks:', error);
    process.exit(1);
  }
};

fixRanks();
