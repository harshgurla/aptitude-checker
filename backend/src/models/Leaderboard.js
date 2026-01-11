import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    consistencyScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    totalTestsTaken: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

leaderboardSchema.index({ currentStreak: -1, totalCorrectAnswers: -1, accuracy: -1, consistencyScore: -1 });
leaderboardSchema.index({ rank: 1 });
leaderboardSchema.index({ student: 1 });

export default mongoose.model('Leaderboard', leaderboardSchema);
