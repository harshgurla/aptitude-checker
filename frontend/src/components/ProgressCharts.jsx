import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { testService } from '../services/api';

export const ProgressCharts = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const { data } = await testService.getDashboard();
      
      // Process tests data for weekly and monthly charts
      const tests = data.tests || [];
      
      // Sort tests by date
      const sortedTests = [...tests].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Get weekly data (last 7 days)
      const weeklyChartData = getWeeklyData(sortedTests);
      
      // Get monthly data (last 30 days)
      const monthlyChartData = getMonthlyData(sortedTests);

      setWeeklyData(weeklyChartData);
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyData = (tests) => {
    const data = {};
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data[dateStr] = {
        date: dateStr,
        accuracy: 0,
        score: 0,
        tests: 0,
        avgScore: 0,
      };
    }

    // Fill in test data
    tests.forEach((test) => {
      const testDate = new Date(test.createdAt);
      const dateStr = testDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (data[dateStr]) {
        data[dateStr].tests += 1;
        data[dateStr].accuracy += parseFloat(test.accuracy) || 0;
        data[dateStr].score += test.score || 0;
      }
    });

    // Calculate averages
    return Object.values(data).map((item) => ({
      date: item.date,
      accuracy: item.tests > 0 ? (item.accuracy / item.tests).toFixed(1) : 0,
      score: item.tests > 0 ? (item.score / item.tests).toFixed(1) : 0,
      tests: item.tests,
    }));
  };

  const getMonthlyData = (tests) => {
    const data = {};
    const today = new Date();

    // Initialize last 30 days with weekly buckets
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Group by week
      const weekNum = Math.ceil((i + 1) / 7);
      const weekLabel = `Week ${5 - Math.floor(i / 7)}`;
      
      if (!data[weekLabel]) {
        data[weekLabel] = {
          week: weekLabel,
          accuracy: 0,
          score: 0,
          tests: 0,
          avgScore: 0,
        };
      }
    }

    // Fill in test data
    tests.forEach((test) => {
      const testDate = new Date(test.createdAt);
      const daysDiff = Math.floor((today - testDate) / (1000 * 60 * 60 * 24));

      if (daysDiff < 30) {
        const weekNum = 5 - Math.floor(daysDiff / 7);
        const weekLabel = `Week ${Math.max(1, weekNum)}`;

        if (data[weekLabel]) {
          data[weekLabel].tests += 1;
          data[weekLabel].accuracy += parseFloat(test.accuracy) || 0;
          data[weekLabel].score += test.score || 0;
        }
      }
    });

    // Calculate averages and filter empty weeks
    return Object.values(data)
      .map((item) => ({
        week: item.week,
        accuracy: item.tests > 0 ? (item.accuracy / item.tests).toFixed(1) : 0,
        score: item.tests > 0 ? (item.score / item.tests).toFixed(1) : 0,
        tests: item.tests,
      }))
      .filter((item) => item.tests > 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading progress data...</div>
      </div>
    );
  }

  const chartData = activeTab === 'weekly' ? weeklyData : monthlyData;
  const xAxisKey = activeTab === 'weekly' ? 'date' : 'week';

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">📊 Your Progress</h2>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-3 font-medium transition-all duration-300 ${
                activeTab === 'weekly'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-6 py-3 font-medium transition-all duration-300 ${
                activeTab === 'monthly'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Charts Container */}
        {chartData && chartData.length > 0 ? (
          <div className="space-y-8">
            {/* Accuracy Chart */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span> Accuracy Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={xAxisKey} stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Score Chart */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Average Score
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={xAxisKey} stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => `${value} points`}
                  />
                  <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Combined Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Tests</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {chartData.reduce((sum, item) => sum + item.tests, 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Avg Accuracy</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {chartData.length > 0
                    ? (chartData.reduce((sum, item) => sum + parseFloat(item.accuracy), 0) / chartData.length).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Avg Score</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {chartData.length > 0
                    ? (chartData.reduce((sum, item) => sum + parseFloat(item.score), 0) / chartData.length).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No test data available yet. Take some tests to see your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};
