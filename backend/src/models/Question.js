import mongoose from 'mongoose';
import { DIFFICULTY } from '../config/constants.js';

const questionSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    category: {
      type: String,
      enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        id: String,
        text: String,
      },
    ],
    correctAnswer: {
      type: String, // Can be option ID, numeric value, or text
      required: true,
    },
    correctAnswerExplanation: {
      type: String,
      default: '',
    },
    questionSignature: {
      type: String,
      unique: true,
      sparse: true,
    },
    usedInTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
      },
    ],
    createdByAI: {
      type: Boolean,
      default: false,
    },
    aiPromptUsed: {
      type: String,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1, difficulty: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ questionSignature: 1 });
questionSchema.index({ usedInTests: 1 });

export default mongoose.model('Question', questionSchema);
