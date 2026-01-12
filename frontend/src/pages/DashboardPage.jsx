import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard, useLeaderboard } from '../hooks/useDashboardQueries';
import { Leaderboard } from '../components/Leaderboard';
import { AccuracyChart } from '../components/AccuracyChart';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  
  // React Query hooks - automatic caching and refetching
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard();

  const loading = dashboardLoading;
  const todayTopic = dashboardData?.todayTopic;
  const testHistory = dashboardData?.recentTests || [];
  const userRank = dashboardData?.userRank;
  const accuracyData = testHistory.map((t) => parseFloat(t.accuracy));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Welcome back, {user.name}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">Keep your streak alive and improve your aptitude daily</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl dark:shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-sm font-medium opacity-90">Current Streak</p>
          <p className="text-4xl font-bold mt-2">{user.currentStreak} 🔥</p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl dark:shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-sm font-medium opacity-90">Best Streak</p>
          <p className="text-4xl font-bold mt-2">{user.bestStreak}</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl dark:shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-sm font-medium opacity-90">Correct Answers</p>
          <p className="text-4xl font-bold mt-2">{user.totalCorrect}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl dark:shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-sm font-medium opacity-90">Your Rank</p>
          <p className="text-4xl font-bold mt-2">#{userRank || 'N/A'}</p>
        </div>
      </div>

      {/* Today's Test Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">📅 Today's Topic</h2>
            {todayTopic && (
              <div>
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">{todayTopic.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{todayTopic.description}</p>
                <Link
                  to="/test"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Test
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <AccuracyChart data={accuracyData} />
        </div>

        {/* Recent Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Tests</h3>
          {testHistory.length > 0 ? (
            <div className="space-y-3">
              {testHistory.map((test) => (
                <Link
                  key={test._id}
                  to={`/results/${test._id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  <p className="font-semibold text-gray-800 dark:text-white">{test.topicName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {test.totalCorrect}/{test.totalAttempted} • {test.accuracy}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No tests taken yet</p>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-8">
        <Leaderboard />
      </div>
    </div>
    </div>
  );
};
