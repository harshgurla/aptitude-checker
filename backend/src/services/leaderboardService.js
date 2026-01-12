import User from '../models/User.js';
import Test from '../models/Test.js';
import Leaderboard from '../models/Leaderboard.js';
import { calculateAccuracy, calculateConsistencyScore } from '../utils/helpers.js';
import { SCORING } from '../config/constants.js';

export const updateUserStats = async (userId) => {
  try {
    const tests = await Test.find({
      student: userId,
      status: { $in: ['submitted', 'auto-submitted'] },
    });

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Calculate stats
    let totalCorrect = 0;
    let totalAttempted = 0;
    const dailyScores = [];

    for (const test of tests) {
      dailyScores.push(test.totalCorrect || 0);
      totalCorrect += test.totalCorrect || 0;
      totalAttempted += test.totalAttempted || 0;
    }

    const accuracy = calculateAccuracy(totalCorrect, totalAttempted);
    const consistencyScore = calculateConsistencyScore(dailyScores);

    // Update user
    user.totalCorrect = totalCorrect;
    user.totalAttempts = totalAttempted;
    await user.save();

    // Update leaderboard
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { student: userId },
      {
        studentName: user.name,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        totalCorrectAnswers: totalCorrect,
        totalAttempts: totalAttempted,
        accuracy: parseFloat(accuracy),
        consistencyScore: parseFloat(consistencyScore),
        totalTestsTaken: tests.length,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    await updateLeaderboardRanks();

    return {
      accuracy,
      consistencyScore,
      totalCorrect,
      totalAttempted,
    };
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const updateLeaderboardRanks = async () => {
  try {
    // Get all users - separate those with tests from those without
    const allUsers = await Leaderboard.find().exec();
    
    // Separate users into two groups
    const usersWithTests = allUsers.filter(user => user.totalTestsTaken > 0);
    const usersWithoutTests = allUsers.filter(user => user.totalTestsTaken === 0);
    
    // Sort users WITH tests by performance (best to worst)
    usersWithTests.sort((a, b) => {
      // Primary: currentStreak (higher is better)
      if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
      
      // Secondary: totalCorrectAnswers (higher is better)
      if (b.totalCorrectAnswers !== a.totalCorrectAnswers) return b.totalCorrectAnswers - a.totalCorrectAnswers;
      
      // Tertiary: accuracy (higher is better)
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      
      // Quaternary: consistencyScore (higher is better)
      if (b.consistencyScore !== a.consistencyScore) return b.consistencyScore - a.consistencyScore;
      
      // Final: _id for consistent ordering
      return a._id.toString().localeCompare(b._id.toString());
    });
    
    // Combine: users with tests first, then users without tests
    const sorted = [...usersWithTests, ...usersWithoutTests];
    
    // Update ranks
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].rank = i + 1;
      await sorted[i].save();
    }

    return sorted;
  } catch (error) {
    console.error('Error updating leaderboard ranks:', error);
    throw error;
  }
};

export const updateStreak = async (userId, testDate) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date(testDate);
    today.setHours(0, 0, 0, 0);

    const lastTest = user.lastTestDate ? new Date(user.lastTestDate) : null;
    if (lastTest) {
      lastTest.setHours(0, 0, 0, 0);
    }

    // If last test was today, don't change streak
    if (lastTest && lastTest.getTime() === today.getTime()) {
      return user.currentStreak;
    }

    // Check if last test was yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastTest && lastTest.getTime() === yesterday.getTime()) {
      user.currentStreak += 1;
    } else if (!lastTest || lastTest.getTime() < yesterday.getTime()) {
      // Streak broken
      user.currentStreak = 1;
    }

    // Update best streak
    if (user.currentStreak > user.bestStreak) {
      user.bestStreak = user.currentStreak;
    }

    user.lastTestDate = testDate;
    await user.save();

    return user.currentStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

export const getLeaderboard = async (limit = 10) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ rank: 1 })
      .limit(limit)
      .select('-__v')
      .lean();

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const getUserRank = async (userId) => {
  try {
    const leaderboard = await Leaderboard.findOne({ student: userId }).lean();
    return leaderboard?.rank || null;
  } catch (error) {
    console.error('Error fetching user rank:', error);
    throw error;
  }
};
