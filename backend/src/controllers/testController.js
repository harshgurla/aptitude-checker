import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import { DIFFICULTY_SPLIT, QUESTIONS_PER_TEST, TEST_DURATION } from '../config/constants.js';
import { generateMotivationalMessage } from '../services/aiService.js';
import { updateUserStats, updateStreak } from '../services/leaderboardService.js';

export const startTest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if tests are paused
    if (user.testsPausedUntil && new Date() < user.testsPausedUntil) {
      return res.status(403).json({ error: 'Tests are paused until ' + user.testsPausedUntil });
    }

    // Check if test already taken today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTest = await Test.findOne({
      student: userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingTest) {
      return res.status(400).json({
        error: 'Test already taken today',
        testId: existingTest._id,
        status: existingTest.status,
      });
    }

    // Get today's topic
    const topic = await Topic.findOne({ isActive: true });
    if (!topic) {
      return res.status(400).json({ error: 'No active topic for today' });
    }

    // Get questions for today's test
    const questions = await Question.find({
      topic: topic._id,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).select('_id question options difficulty');

    if (questions.length < QUESTIONS_PER_TEST) {
      return res.status(400).json({
        error: `Not enough questions. Available: ${questions.length}/${QUESTIONS_PER_TEST}`,
      });
    }

    // Shuffle and select 20 questions
    const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_TEST);

    // Create test
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + TEST_DURATION);

    const test = new Test({
      student: userId,
      topic: topic._id,
      topicName: topic.name,
      questions: shuffled.map((q) => q._id),
      startTime,
      scheduledEndTime: endTime,
      status: 'started',
    });

    await test.save();

    // Send test without answers
    const testQuestions = shuffled.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }));

    res.json({
      message: 'Test started',
      testId: test._id,
      topicName: topic.name,
      totalQuestions: testQuestions.length,
      timeLimit: TEST_DURATION / 60000, // in minutes
      startTime,
      scheduledEndTime: endTime,
      questions: testQuestions,
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
};

export const submitTest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { testId, answers } = req.body;

    if (!testId || !answers) {
      return res.status(400).json({ error: 'Test ID and answers are required' });
    }

    const test = await Test.findById(testId).populate('questions');

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.student.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (test.status === 'submitted' || test.status === 'auto-submitted') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    // Validate time
    const now = new Date();
    if (now > test.scheduledEndTime) {
      test.status = 'auto-submitted';
    } else {
      test.status = 'submitted';
    }

    test.endTime = now;
    test.timeSpent = now.getTime() - test.startTime.getTime();

    // Evaluate answers
    let totalCorrect = 0;
    let totalAttempted = 0;

    const submittedAnswers = [];

    for (const question of test.questions) {
      const answer = answers.find((a) => a.questionId === question._id.toString());

      if (answer && answer.answer !== undefined && answer.answer !== '') {
        totalAttempted++;
        const isCorrect = String(answer.answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
        if (isCorrect) {
          totalCorrect++;
        }

        submittedAnswers.push({
          questionId: question._id,
          answer: answer.answer,
          isCorrect,
          markedForReview: answer.markedForReview || false,
        });
      }
    }

    test.submittedAnswers = submittedAnswers;
    test.totalCorrect = totalCorrect;
    test.totalAttempted = totalAttempted;
    test.score = totalCorrect;
    test.accuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(2) : 0;

    // Generate motivational message
    const motivationalMessage = await generateMotivationalMessage(totalCorrect, test.questions.length, 1);
    test.motivationalMessage = motivationalMessage;

    await test.save();

    // Update user stats and streak
    await updateStreak(userId, test.endTime);
    const stats = await updateUserStats(userId);

    res.json({
      message: 'Test submitted successfully',
      testId: test._id,
      score: test.score,
      totalCorrect,
      totalAttempted,
      accuracy: test.accuracy,
      motivationalMessage,
      stats,
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
};

export const getTestResult = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.userId;

    const test = await Test.findById(testId).populate('questions');

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.student.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Map answers with questions
    const result = {
      testId: test._id,
      topicName: test.topicName,
      score: test.score,
      totalCorrect: test.totalCorrect,
      totalAttempted: test.totalAttempted,
      accuracy: test.accuracy,
      timeSpent: test.timeSpent,
      motivationalMessage: test.motivationalMessage,
      createdAt: test.createdAt,
      questions: test.questions.map((question) => {
        const submission = test.submittedAnswers.find((s) => s.questionId.toString() === question._id.toString());

        return {
          _id: question._id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.correctAnswerExplanation,
          userAnswer: submission?.answer || 'Not attempted',
          isCorrect: submission?.isCorrect || false,
        };
      }),
    };

    res.json(result);
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({ error: 'Failed to fetch test result' });
  }
};

export const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, skip = 0 } = req.query;

    const tests = await Test.find({
      student: userId,
      status: { $in: ['submitted', 'auto-submitted'] },
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('_id topicName score totalCorrect totalAttempted accuracy createdAt status');

    const total = await Test.countDocuments({
      student: userId,
      status: { $in: ['submitted', 'auto-submitted'] },
    });

    res.json({
      tests,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({ error: 'Failed to fetch test history' });
  }
};

export const getTestStatus = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.userId;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.student.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      testId: test._id,
      status: test.status,
      timeSpent: test.timeSpent,
      remainingTime: Math.max(0, test.scheduledEndTime.getTime() - new Date().getTime()),
      submitted: test.submittedAnswers.length,
      totalQuestions: test.questions.length,
    });
  } catch (error) {
    console.error('Get test status error:', error);
    res.status(500).json({ error: 'Failed to fetch test status' });
  }
};
