import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Daily Aptitude Tests
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
              Become Unstoppable
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Take one aptitude test every day and build your strength. Powered by AI-generated questions and backed by real science.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-xl text-center touch-manipulation"
            >
              Get Started →
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold rounded-xl border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-xl text-center touch-manipulation"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎯</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Daily Questions</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              New AI-generated questions every day across Quantitative, Logical, and Verbal sections
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Real Analytics</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Track your progress with detailed analytics, accuracy trends, and consistency scoring
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105 sm:col-span-2 md:col-span-1">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🏆</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Live Leaderboard</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Compete with peers in real-time. Climb the leaderboard based on streaks and accuracy
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-8 sm:p-10 md:p-12 mb-12 sm:mb-16 md:mb-20 mx-4 transition-colors duration-300">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">1000+</p>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Daily Students</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">500K+</p>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Questions Generated</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">98%</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">User Satisfaction</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {/* CTA */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Ready to Excel?</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">Start your free account today and take your first test</p>
          <Link
            to="/register"
            className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-xl text-center touch-manipulation"
          >
            Sign Up Now →
          </Link>
        </div>
      </div>
    </div>
  );
};
