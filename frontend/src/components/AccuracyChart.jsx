import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AccuracyChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-4 sm:p-6 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <p>No data available</p>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: `Day ${index + 1}`,
    accuracy: Math.round(item),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-4 sm:p-6 transition-colors duration-300">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Accuracy Trend</h3>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value) => `${value}%`}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', fontSize: '14px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3B82F6"
            dot={{ fill: '#3B82F6' }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
