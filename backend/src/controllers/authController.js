import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { isValidEmail } from '../utils/helpers.js';
import Leaderboard from '../models/Leaderboard.js';
import { updateLeaderboardRanks } from '../services/leaderboardService.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
    });

    await user.save();

    // Create leaderboard entry with proper initial values
    await Leaderboard.create({
      student: user._id,
      studentName: user.name,
      currentStreak: 0,
      bestStreak: 0,
      totalCorrectAnswers: 0,
      totalAttempts: 0,
      accuracy: 0,
      consistencyScore: 0,
      totalTestsTaken: 0,
      rank: 99999, // Temporary - will be recalculated
    });

    // Recalculate ranks for all users (new user will get proper rank at bottom)
    await updateLeaderboardRanks();

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        totalCorrect: user.totalCorrect,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      totalCorrect: user.totalCorrect,
      totalAttempts: user.totalAttempts,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
