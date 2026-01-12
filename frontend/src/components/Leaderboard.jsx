import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { useSocket } from '../hooks/useSocket';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchLeaderboard();

    if (socket) {
      socket.emit('join-leaderboard');
      socket.on('leaderboard-updated', (data) => {
        setLeaderboard(data);
      });
    }
  }, [socket]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await dashboardService.getLeaderboard();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-sm sm:text-base text-gray-700 dark:text-gray-300">Loading leaderboard...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl transition-colors duration-300">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">🏆 Top Performers</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Rank</th>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Name</th>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Streak</th>
              <th className="hidden sm:table-cell px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Correct</th>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((item, index) => (
              <tr key={item._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center font-bold text-base sm:text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 truncate max-w-[120px] sm:max-w-none">{item.studentName}</td>
                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                  <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {item.currentStreak} 🔥
                  </span>
                </td>
                <td className="hidden sm:table-cell px-4 md:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300">{item.totalCorrectAnswers}</td>
                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                  <div className="flex items-center">
                    <div className="w-12 sm:w-20 md:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mr-1 sm:mr-2">
                      <div
                        className="bg-green-500 dark:bg-green-400 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${Number(item.accuracy) || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{(Number(item.accuracy) || 0).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
