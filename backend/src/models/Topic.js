import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    questionsGenerated: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

topicSchema.index({ name: 1 });
topicSchema.index({ category: 1, order: 1 });
topicSchema.index({ isActive: 1 });

export default mongoose.model('Topic', topicSchema);
