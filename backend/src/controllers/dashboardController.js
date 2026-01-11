import Topic from '../models/Topic.js';
import { getTodayTopic, getScheduleStatus } from '../services/schedulerService.js';
import { getLeaderboard, getUserRank } from '../services/leaderboardService.js';

export const getTodayTopicAndStatus = async (req, res) => {
  try {
    const topic = await getTodayTopic();

    if (!topic) {
      return res.status(400).json({ error: 'No active topic' });
    }

    res.json({
      topic: {
        _id: topic._id,
        name: topic.name,
        category: topic.category,
        description: topic.description,
      },
    });
  } catch (error) {
    console.error('Error fetching today topic:', error);
    res.status(500).json({ error: 'Failed to fetch today topic' });
  }
};

export const getLeaderboardTop10 = async (req, res) => {
  try {
    const leaderboard = await getLeaderboard(10);

    res.json({
      leaderboard,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const getUserLeaderboardRank = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rank = await getUserRank(userId);

    res.json({
      userId,
      rank: rank || null,
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 });

    const grouped = {
      'Quantitative Aptitude': [],
      'Logical Reasoning': [],
      'Verbal Ability': [],
    };

    topics.forEach((topic) => {
      grouped[topic.category].push({
        _id: topic._id,
        name: topic.name,
        isActive: topic.isActive,
        questionsGenerated: topic.questionsGenerated,
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export const getScheduleInfo = async (req, res) => {
  try {
    const schedule = await getScheduleStatus();

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};
