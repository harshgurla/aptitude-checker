import User from '../models/User.js';
import Test from '../models/Test.js';
import Leaderboard from '../models/Leaderboard.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import { updateLeaderboardRanks } from '../services/leaderboardService.js';
import { generateTodayQuestions, rotateDailyTopic, getTodayTopic } from '../services/schedulerService.js';

export const getAllStudents = async (req, res) => {
  try {
    const { skip = 0, limit = 20 } = req.query;

    const students = await User.find({ role: 'student' })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments({ role: 'student' });

    res.json({
      students,
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const tests = await Test.find({ student: studentId })
      .sort({ createdAt: -1 })
      .select('_id topicName score totalCorrect accuracy createdAt status');

    const stats = await Leaderboard.findOne({ student: studentId });

    res.json({
      student,
      tests,
      stats,
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
};

export const pauseStudentTests = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { durationDays = 7 } = req.body;

    const until = new Date();
    until.setDate(until.getDate() + durationDays);

    const student = await User.findByIdAndUpdate(
      studentId,
      { testsPausedUntil: until },
      { new: true }
    );

    res.json({
      message: `Student tests paused until ${until}`,
      student,
    });
  } catch (error) {
    console.error('Error pausing student tests:', error);
    res.status(500).json({ error: 'Failed to pause student tests' });
  }
};

export const resumeStudentTests = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findByIdAndUpdate(
      studentId,
      { testsPausedUntil: null },
      { new: true }
    );

    res.json({
      message: 'Student tests resumed',
      student,
    });
  } catch (error) {
    console.error('Error resuming student tests:', error);
    res.status(500).json({ error: 'Failed to resume student tests' });
  }
};

export const toggleStudentActive = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({
      message: `Student ${student.isActive ? 'activated' : 'deactivated'}`,
      student,
    });
  } catch (error) {
    console.error('Error toggling student active status:', error);
    res.status(500).json({ error: 'Failed to toggle student status' });
  }
};

export const resetLeaderboard = async (req, res) => {
  try {
    const confirm = req.body.confirm;

    if (confirm !== true) {
      return res.status(400).json({ error: 'Confirmation required' });
    }

    // Reset all user stats
    await User.updateMany(
      { role: 'student' },
      {
        currentStreak: 0,
        bestStreak: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        lastTestDate: null,
      }
    );

    // Reset leaderboard
    await Leaderboard.deleteMany({});

    res.json({
      message: 'Leaderboard reset successfully',
    });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    res.status(500).json({ error: 'Failed to reset leaderboard' });
  }
};

// Fix leaderboard ranks (one-time fix for existing users)
export const fixLeaderboardRanks = async (req, res) => {
  try {
    await updateLeaderboardRanks();
    
    res.json({
      message: 'Leaderboard ranks updated successfully',
    });
  } catch (error) {
    console.error('Error fixing leaderboard ranks:', error);
    res.status(500).json({ error: 'Failed to fix leaderboard ranks' });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTests = await Test.countDocuments();
    const totalTopics = await Topic.countDocuments();

    const activeTopic = await Topic.findOne({ isActive: true });

    // Get top performers - only users who have taken at least 1 test
    const topPerformers = await Leaderboard.find({ totalTestsTaken: { $gt: 0 } })
      .sort({ rank: 1 })
      .limit(5)
      .select('studentName currentStreak totalCorrectAnswers accuracy rank');

    res.json({
      summary: {
        totalStudents,
        totalTests,
        totalTopics,
        activeTopic: activeTopic?.name || 'None',
      },
      topPerformers,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

export const getDetailedAnalytics = async (req, res) => {
  try {
    const { studentId } = req.query;

    let query = { status: { $in: ['submitted', 'auto-submitted'] } };

    if (studentId) {
      query.student = studentId;
    }

    const tests = await Test.find(query).sort({ createdAt: -1 });

    const analytics = {
      totalTests: tests.length,
      averageAccuracy: 0,
      categoryPerformance: {},
      difficultyPerformance: {},
      dailyProgress: {},
    };

    let totalAccuracy = 0;

    tests.forEach((test) => {
      // Category performance
      const category = test.topicName;
      if (!analytics.categoryPerformance[category]) {
        analytics.categoryPerformance[category] = {
          tests: 0,
          avgScore: 0,
          avgAccuracy: 0,
        };
      }
      analytics.categoryPerformance[category].tests++;
      analytics.categoryPerformance[category].avgScore += test.score;
      analytics.categoryPerformance[category].avgAccuracy += parseFloat(test.accuracy);

      totalAccuracy += parseFloat(test.accuracy);

      // Daily progress
      const date = test.createdAt.toISOString().split('T')[0];
      if (!analytics.dailyProgress[date]) {
        analytics.dailyProgress[date] = [];
      }
      analytics.dailyProgress[date].push(test.score);
    });

    analytics.averageAccuracy = (totalAccuracy / (tests.length || 1)).toFixed(2);

    // Calculate category averages
    Object.keys(analytics.categoryPerformance).forEach((key) => {
      const cat = analytics.categoryPerformance[key];
      cat.avgScore = (cat.avgScore / cat.tests).toFixed(2);
      cat.avgAccuracy = (cat.avgAccuracy / cat.tests).toFixed(2);
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Generate today's questions manually (once per 24 hours)
export const generateQuestionsManually = async (req, res) => {
  try {
    console.log('📌 [generateQuestionsManually] Starting question generation request...');
    
    // Check if questions were already generated today
    let todayTopic;
    try {
      todayTopic = await getTodayTopic();
    } catch (error) {
      console.error('❌ [generateQuestionsManually] Error fetching today topic:', error.message);
      return res.status(500).json({ 
        error: 'Failed to fetch active topic',
        details: error.message,
        questionsGenerated: 0
      });
    }
    
    if (!todayTopic) {
      console.warn('⚠️ [generateQuestionsManually] No active topic found');
      return res.status(400).json({ 
        error: 'No active topic found. Please activate a topic first.',
        questionsGenerated: 0
      });
    }
    
    console.log(`✓ [generateQuestionsManually] Active topic: ${todayTopic.name}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let existingQuestionsCount = 0;
    try {
      existingQuestionsCount = await Question.countDocuments({
        topic: todayTopic._id,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });
    } catch (error) {
      console.error('❌ [generateQuestionsManually] Error counting existing questions:', error.message);
      return res.status(500).json({
        error: 'Failed to check existing questions',
        details: error.message,
        questionsGenerated: 0
      });
    }
    
    console.log(`📊 [generateQuestionsManually] Existing questions today: ${existingQuestionsCount}`);
    
    // Enforce 24-hour cooldown: only allow generation once per day
    if (existingQuestionsCount > 0) {
      const nextMidnight = new Date(tomorrow);
      console.log(`⏳ [generateQuestionsManually] Questions already generated. Next available: ${nextMidnight.toISOString()}`);
      return res.status(400).json({ 
        error: 'Questions already generated for today',
        message: `Questions for "${todayTopic.name}" have already been generated today. You can generate new questions after midnight.`,
        questionsGenerated: existingQuestionsCount,
        nextGenerationTime: nextMidnight,
        canGenerateToday: false
      });
    }
    
    // Generate questions
    console.log('🤖 [generateQuestionsManually] Calling generateTodayQuestions()...');
    let result;
    try {
      result = await generateTodayQuestions();
    } catch (error) {
      console.error('❌ [generateQuestionsManually] Error in generateTodayQuestions:', error.message, error.stack);
      return res.status(500).json({ 
        error: 'Question generation failed',
        message: error.message,
        questionsGenerated: 0,
        details: error.message
      });
    }
    
    if (!result || !result.success) {
      console.warn('⚠️ [generateQuestionsManually] Generation returned failure status');
      return res.status(400).json({ 
        message: result?.message || 'Generation failed',
        questionsGenerated: 0,
        error: result?.message || 'Failed to generate questions'
      });
    }
    
    let questionsCount = 0;
    try {
      questionsCount = await Question.countDocuments({ 
        topic: todayTopic._id,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });
    } catch (error) {
      console.error('❌ [generateQuestionsManually] Error counting generated questions:', error.message);
      questionsCount = result.questionsGenerated || 0;
    }
    
    console.log(`✅ [generateQuestionsManually] Success! Generated ${questionsCount} questions`);
    
    res.json({
      message: result.message || 'Questions generated successfully',
      topic: todayTopic.name,
      questionsGenerated: questionsCount,
      canGenerateToday: false,
      nextGenerationTime: tomorrow
    });
  } catch (error) {
    console.error('❌ [generateQuestionsManually] Unexpected error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Unexpected error during question generation',
      message: error.message,
      details: error.message,
      questionsGenerated: 0
    });
  }
};

// Rotate daily topic manually
export const rotateTopic = async (req, res) => {
  try {
    await rotateDailyTopic();
    const newTopic = await getTodayTopic();
    
    res.json({
      message: 'Topic rotated successfully',
      currentTopic: newTopic,
    });
  } catch (error) {
    console.error('Error rotating topic:', error);
    res.status(500).json({ error: 'Failed to rotate topic' });
  }
};

// Get today's topic and question count
export const getTodayTopicInfo = async (req, res) => {
  try {
    const todayTopic = await getTodayTopic();
    
    if (!todayTopic) {
      return res.status(404).json({ error: 'No active topic found' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const questionsCount = await Question.countDocuments({
      topic: todayTopic._id,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    
    // Check if questions were already generated today (24-hour cooldown)
    const canGenerateToday = questionsCount === 0;
    
    // Calculate time until midnight (next generation time)
    const now = new Date();
    const nextMidnight = new Date(tomorrow);
    const timeUntilNextGeneration = nextMidnight - now;
    
    res.json({
      topic: todayTopic,
      questionsForToday: questionsCount,
      canGenerateToday,
      timeUntilNextGeneration,
      nextGenerationTime: nextMidnight,
    });
  } catch (error) {
    console.error('Error fetching today topic info:', error);
    res.status(500).json({ error: 'Failed to fetch topic info' });
  }
};
