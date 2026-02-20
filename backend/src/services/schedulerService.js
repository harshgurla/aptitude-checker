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
    console.log('🚀 [generateTodayQuestions] Starting question generation...');
    
    let activeTopics;
    try {
      activeTopics = await Topic.find({ isActive: true });
    } catch (error) {
      console.error('❌ [generateTodayQuestions] Error finding active topics:', error.message);
      throw new Error(`Failed to fetch active topics: ${error.message}`);
    }

    if (activeTopics.length === 0) {
      console.error('❌ [generateTodayQuestions] No active topic set for question generation');
      return { success: false, message: 'No active topic', questionsGenerated: 0 };
    }

    const topic = activeTopics[0];
    console.log(`✓ [generateTodayQuestions] Active topic: ${topic.name}`);

    // Check if questions already generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let existingQuestions;
    try {
      existingQuestions = await Question.find({
        topic: topic._id,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      }).countDocuments();
    } catch (error) {
      console.error('❌ [generateTodayQuestions] Error counting existing questions:', error.message);
      throw new Error(`Failed to count existing questions: ${error.message}`);
    }

    if (existingQuestions >= QUESTIONS_PER_TEST) {
      console.log(`✓ [generateTodayQuestions] Questions already generated for ${topic.name} today (${existingQuestions} questions)`);
      return { success: true, message: `Questions already exist for ${topic.name}`, questionsGenerated: existingQuestions };
    }

    // Generate questions for each difficulty level
    console.log(`📝 [generateTodayQuestions] Generating questions for ${topic.name}...`);
    let totalGenerated = 0;

    for (const [difficulty, count] of Object.entries(DIFFICULTY_SPLIT)) {
      try {
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
          let savedCount = 0;
          let attempts = 0;
          const maxAttempts = 5; // Try up to 5 times to get the right number of questions

          // Keep trying until we have exactly the right number of questions for this difficulty
          while (savedCount < questionsToGenerate && attempts < maxAttempts) {
            attempts++;
            const remainingNeeded = questionsToGenerate - savedCount;
            
            try {
              console.log(`📝 [generateTodayQuestions] Attempt ${attempts}: Generating ${remainingNeeded} ${difficulty} questions...`);
              // Request extra questions to account for potential duplicates/failures (1.5x)
              const requestCount = Math.ceil(remainingNeeded * 1.5);
              const generatedQuestions = await generateQuestionsAI(topic.name, difficulty, requestCount);

              if (!Array.isArray(generatedQuestions)) {
                console.error(`❌ [generateTodayQuestions] Invalid response from AI: not an array`);
                continue;
              }

              console.log(`✓ [generateTodayQuestions] AI returned ${generatedQuestions.length} questions`);

              for (const q of generatedQuestions) {
                // Stop if we've saved enough questions for this difficulty
                if (savedCount >= questionsToGenerate) {
                  break;
                }

                try {
                  if (!q.question || !q.options || !q.correctAnswer) {
                    console.warn(`⚠️ [generateTodayQuestions] Skipping invalid question: missing required fields`);
                    continue;
                  }

                  const signature = crypto.createHash('sha256').update(`${q.question}${topic.name}${difficulty}`).digest('hex');

                  await Question.create({
                    topic: topic._id,
                    category: q.category || 'Quantitative Aptitude',
                    difficulty,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    correctAnswerExplanation: q.explanation || '',
                    questionSignature: signature,
                    createdByAI: true,
                    aiPromptUsed: topic.name,
                  });
                  savedCount++;
                  totalGenerated++;
                  console.log(`✓ [generateTodayQuestions] Saved ${difficulty} question ${savedCount}/${questionsToGenerate}`);
                } catch (error) {
                  if (error.code === 11000) {
                    console.warn(`⚠️ [generateTodayQuestions] Duplicate question detected, skipping...`);
                  } else {
                    console.error(`⚠️ [generateTodayQuestions] Failed to save question:`, error.message);
                  }
                  // Continue with next question
                }
              }
              
              console.log(`✓ [generateTodayQuestions] Progress: ${savedCount}/${questionsToGenerate} ${difficulty} questions saved (Attempt ${attempts})`);
            } catch (error) {
              console.error(`❌ [generateTodayQuestions] Attempt ${attempts} failed to generate ${difficulty} questions:`, error.message);
              // Continue to next attempt
            }
          }

          if (savedCount < questionsToGenerate) {
            console.error(`⚠️ [generateTodayQuestions] Only saved ${savedCount}/${questionsToGenerate} ${difficulty} questions after ${maxAttempts} attempts`);
          } else {
            console.log(`✅ [generateTodayQuestions] Successfully saved all ${questionsToGenerate} ${difficulty} questions!`);
          }
        }
      } catch (error) {
        console.error(`❌ [generateTodayQuestions] Error processing ${difficulty} difficulty:`, error.message);
        // Continue with other difficulty levels
      }
    }

    if (totalGenerated === 0) {
      console.error('❌ [generateTodayQuestions] Failed to generate any questions');
      throw new Error('Failed to generate any questions');
    }

    // Verify we have exactly QUESTIONS_PER_TEST questions
    const finalCount = await Question.find({
      topic: topic._id,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).countDocuments();

    if (finalCount < QUESTIONS_PER_TEST) {
      console.warn(`⚠️ [generateTodayQuestions] Only generated ${finalCount}/${QUESTIONS_PER_TEST} questions. May need manual intervention.`);
    } else {
      console.log(`✅ [generateTodayQuestions] Verified: ${finalCount} questions in database`);
    }

    try {
      topic.questionsGenerated = finalCount;
      await topic.save();
    } catch (error) {
      console.error('⚠️ [generateTodayQuestions] Failed to save topic:', error.message);
      // Continue anyway - we generated questions even if we can't update the topic
    }

    console.log(`✅ [generateTodayQuestions] Successfully generated ${totalGenerated} questions for ${topic.name} (Total in DB: ${finalCount})`);
    return { success: true, message: `Generated ${finalCount} questions for ${topic.name}`, questionsGenerated: finalCount };
  } catch (error) {
    console.error('❌ [generateTodayQuestions] Error generating questions:', error.message, error.stack);
    return { success: false, message: `Error: ${error.message}`, questionsGenerated: 0 };
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
