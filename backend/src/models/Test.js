import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    topicName: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['started', 'in-progress', 'submitted', 'auto-submitted'],
      default: 'started',
    },
    score: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    totalAttempted: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    submittedAnswers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean,
        markedForReview: Boolean,
      },
    ],
    timeSpent: {
      type: Number,
      default: 0,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    motivationalMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

testSchema.index({ student: 1, createdAt: -1 });
testSchema.index({ topic: 1 });
testSchema.index({ status: 1 });

export default mongoose.model('Test', testSchema);
