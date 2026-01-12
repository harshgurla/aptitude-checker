import cron from 'node-cron';
import Topic from '../models/Topic.js';
import { generateQuestionsAI } from './aiService.js';
import { TOPICS, DIFFICULTY_SPLIT, QUESTIONS_PER_TEST } from '../config/constants.js';
import Question from '../models/Question.js';
import crypto from 'crypto';

let currentDayTopicIndex = 0;
let allTopics = [];

export const initializeScheduler = async () => {
  try {
    // Fetch all topics (not filtered by isActive)
    allTopics = await Topic.find({}).sort({ order: 1 });

    if (allTopics.length === 0) {
      console.warn('No topics found. Scheduler not initialized.');
      return;
    }

    // Find current active topic or set first one as active
    let activeTopic = await Topic.findOne({ isActive: true });
    if (!activeTopic) {
      // Set first topic as active
      activeTopic = allTopics[0];
      await Topic.updateMany({}, { isActive: false });
      await Topic.findByIdAndUpdate(activeTopic._id, { isActive: true });
      console.log(`✓ Set initial active topic: ${activeTopic.name}`);
    }

    // Find current topic index
    currentDayTopicIndex = allTopics.findIndex(t => t._id.toString() === activeTopic._id.toString());
    if (currentDayTopicIndex === -1) currentDayTopicIndex = 0;

    // Check if we need to generate questions for today
    const questionsCount = await Question.countDocuments({});
    if (questionsCount === 0) {
      console.log('No questions found. Generating initial questions...');
      await generateTodayQuestions();
    }

    // Schedule daily task at midnight
    cron.schedule('0 0 * * *', async () => {
      await rotateDailyTopic();
      await generateTodayQuestions();
    });

    console.log('✓ Daily topic scheduler initialized');
    console.log(`✓ Current active topic: ${activeTopic.name} (${currentDayTopicIndex + 1}/${allTopics.length})`);
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
};

export const rotateDailyTopic = async () => {
  try {
    if (allTopics.length === 0) {
      allTopics = await Topic.find({}).sort({ order: 1 });
    }

    // Move to next topic
    currentDayTopicIndex = (currentDayTopicIndex + 1) % allTopics.length;
    const topic = allTopics[currentDayTopicIndex];

    // Mark only this topic as active for the day
    await Topic.updateMany({}, { isActive: false });
    await Topic.findByIdAndUpdate(topic._id, { isActive: true });

    console.log(`✓ Daily topic rotated to: ${topic.name} (${currentDayTopicIndex + 1}/${allTopics.length})`);
  } catch (error) {
    console.error('Error rotating daily topic:', error);
  }
};

export const generateTodayQuestions = async () => {
  try {
    const activeTopics = await Topic.find({ isActive: true });

    if (activeTopics.length === 0) {
      console.error('❌ No active topic set for question generation. Please activate a topic first.');
      return { success: false, message: 'No active topic', questionsGenerated: 0 };
    }

    const topic = activeTopics[0];

    // Check if questions already generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingQuestions = await Question.find({
      topic: topic._id,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).countDocuments();

    if (existingQuestions >= QUESTIONS_PER_TEST) {
      console.log(`✓ Questions already generated for ${topic.name} today (${existingQuestions} questions)`);
      return { success: true, message: `Questions already exist for ${topic.name}`, questionsGenerated: existingQuestions };
    }

    // Generate questions for each difficulty level
    console.log(`🚀 Starting question generation for ${topic.name}...`);
    let totalGenerated = 0;

    for (const [difficulty, count] of Object.entries(DIFFICULTY_SPLIT)) {
      const existingCount = await Question.find({
        topic: topic._id,
        difficulty,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      }).countDocuments();

      const questionsToGenerate = count - existingCount;

      if (questionsToGenerate > 0) {
        try {
          console.log(`📝 Generating ${questionsToGenerate} ${difficulty} questions...`);
          const generatedQuestions = await generateQuestionsAI(topic.name, difficulty, questionsToGenerate);

          for (const q of generatedQuestions) {
            const signature = crypto.createHash('sha256').update(`${q.question}${topic.name}${difficulty}`).digest('hex');

            await Question.create({
              topic: topic._id,
              category: q.category,
              difficulty,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              correctAnswerExplanation: q.explanation,
              questionSignature: signature,
              createdByAI: true,
              aiPromptUsed: topic.name,
            });
            totalGenerated++;
          }
          
          console.log(`✓ Generated ${questionsToGenerate} ${difficulty} questions`);
        } catch (error) {
          console.error(`❌ Failed to generate ${difficulty} questions:`, error.message);
          // Continue with other difficulty levels even if one fails
        }
      }
    }

    if (totalGenerated === 0) {
      throw new Error('Failed to generate any questions');
    }

    topic.questionsGenerated = totalGenerated;
    await topic.save();

    console.log(`✅ Successfully generated ${totalGenerated} questions for ${topic.name}`);
    return { success: true, message: `Generated ${totalGenerated} questions for ${topic.name}`, questionsGenerated: totalGenerated };
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    throw error; // Re-throw so the controller knows generation failed
  }
};

export const getTodayTopic = async () => {
  try {
    const topic = await Topic.findOne({ isActive: true });
    return topic;
  } catch (error) {
    console.error('Error fetching today topic:', error);
    throw error;
  }
};

export const getScheduleStatus = async () => {
  try {
    const activeTopic = await Topic.findOne({ isActive: true });
    const allTopicsCount = await Topic.countDocuments({ isActive: true });

    return {
      currentTopic: activeTopic,
      totalActiveTopics: allTopicsCount,
      nextTopicIndex: currentDayTopicIndex,
    };
  } catch (error) {
    console.error('Error fetching schedule status:', error);
    throw error;
  }
};
