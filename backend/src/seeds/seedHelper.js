import User from '../models/User.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import Leaderboard from '../models/Leaderboard.js';
import { hashPassword } from '../utils/crypto.js';
import { TOPICS } from '../config/constants.js';

// Safe seeding helper: only seeds when database is empty
export const seedIfEmpty = async () => {
  const userCount = await User.countDocuments();
  const topicCount = await Topic.countDocuments();

  if (userCount > 0 || topicCount > 0) {
    return {
      seeded: false,
      message: 'Seeding skipped: database already contains data',
      stats: { userCount, topicCount },
    };
  }

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = new User({
    name: 'Admin User',
    email: 'admin@aptitude.com',
    password: adminPassword,
    role: 'admin',
  });
  await admin.save();

  let topicOrder = 1;
  const topicsData = [];

  // Quantitative Aptitude
  for (const name of TOPICS.QUANTITATIVE) {
    const topic = new Topic({
      name,
      category: 'Quantitative Aptitude',
      description: `Topic: ${name}`,
      order: topicOrder++,
    });
    await topic.save();
    topicsData.push(topic);
  }

  // Logical Reasoning
  for (const name of TOPICS.LOGICAL) {
    const topic = new Topic({
      name,
      category: 'Logical Reasoning',
      description: `Topic: ${name}`,
      order: topicOrder++,
    });
    await topic.save();
    topicsData.push(topic);
  }

  // Verbal Ability
  for (const name of TOPICS.VERBAL) {
    const topic = new Topic({
      name,
      category: 'Verbal Ability',
      description: `Topic: ${name}`,
      order: topicOrder++,
    });
    await topic.save();
    topicsData.push(topic);
  }

  // Set first topic active
  await Topic.updateOne({ _id: topicsData[0]._id }, { isActive: true });

  // Sample questions for first topic
  const activeTopic = topicsData[0];
  const sampleQuestions = [
    {
      topic: activeTopic._id,
      category: activeTopic.category,
      difficulty: 'easy',
      question: 'What is 2 + 2?',
      options: [
        { id: 'A', text: '3' },
        { id: 'B', text: '4' },
        { id: 'C', text: '5' },
        { id: 'D', text: '6' },
      ],
      correctAnswer: 'B',
      correctAnswerExplanation: '2 + 2 = 4',
    },
    {
      topic: activeTopic._id,
      category: activeTopic.category,
      difficulty: 'easy',
      question: 'What is 10 × 5?',
      options: [
        { id: 'A', text: '40' },
        { id: 'B', text: '50' },
        { id: 'C', text: '60' },
        { id: 'D', text: '70' },
      ],
      correctAnswer: 'B',
      correctAnswerExplanation: '10 × 5 = 50',
    },
    {
      topic: activeTopic._id,
      category: activeTopic.category,
      difficulty: 'medium',
      question: 'What is the value of 15% of 200?',
      options: [
        { id: 'A', text: '20' },
        { id: 'B', text: '25' },
        { id: 'C', text: '30' },
        { id: 'D', text: '35' },
      ],
      correctAnswer: 'C',
      correctAnswerExplanation: '15% of 200 = 0.15 × 200 = 30',
    },
    {
      topic: activeTopic._id,
      category: activeTopic.category,
      difficulty: 'medium',
      question: 'What is 3² + 4²?',
      options: [
        { id: 'A', text: '20' },
        { id: 'B', text: '24' },
        { id: 'C', text: '25' },
        { id: 'D', text: '30' },
      ],
      correctAnswer: 'C',
      correctAnswerExplanation: '3² + 4² = 9 + 16 = 25',
    },
    {
      topic: activeTopic._id,
      category: activeTopic.category,
      difficulty: 'hard',
      question: 'If a number is multiplied by 5 and then 3 is subtracted, the result is 47. What is the number?',
      options: [
        { id: 'A', text: '8' },
        { id: 'B', text: '10' },
        { id: 'C', text: '12' },
        { id: 'D', text: '14' },
      ],
      correctAnswer: 'B',
      correctAnswerExplanation: 'Let x be the number. 5x - 3 = 47 → 5x = 50 → x = 10',
    },
  ];

  for (const q of sampleQuestions) {
    await Question.create(q);
  }

  // Initialize empty leaderboard collection
  await Leaderboard.createCollection();

  return {
    seeded: true,
    message: 'Database seeded successfully',
    stats: {
      usersCreated: 1,
      topicsCreated: topicsData.length,
      sampleQuestionsCreated: sampleQuestions.length,
    },
  };
};
