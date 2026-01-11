import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Don't render homepage if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Daily Aptitude Tests
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Become Unstoppable
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Take one aptitude test every day and build your strength. Powered by AI-generated questions and backed by real science.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Get Started →
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold rounded-xl border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 text-center transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Daily Questions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              New AI-generated questions every day across Quantitative, Logical, and Verbal sections
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 text-center transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Real Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress with detailed analytics, accuracy trends, and consistency scoring
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 text-center transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Live Leaderboard</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Compete with peers in real-time. Climb the leaderboard based on streaks and accuracy
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-12 mb-20 transition-colors duration-300">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">1000+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Daily Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">500K+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Questions Generated</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">98%</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">User Satisfaction</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to Excel?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Start your free account today and take your first test</p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
          >
            Sign Up Now →
          </Link>
        </div>
      </div>
    </div>
  );
};
