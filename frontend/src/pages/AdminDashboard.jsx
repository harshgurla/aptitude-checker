import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

export const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [topicInfo, setTopicInfo] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdminData();
    fetchTopicInfo();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [dashRes, studentsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllStudents(0, 20),
      ]);

      setDashboard(dashRes.data);
      setStudents(studentsRes.data.students);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicInfo = async () => {
    try {
      const res = await adminService.getTodayTopicInfo();
      setTopicInfo(res.data);
    } catch (error) {
      console.error('Error fetching topic info:', error);
    }
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await adminService.generateQuestions();
      setMessage({ type: 'success', text: `✓ ${res.data.message}. Generated ${res.data.questionsGenerated} questions for ${res.data.topic}` });
      await fetchTopicInfo();
    } catch (error) {
      setMessage({ type: 'error', text: `✗ Failed to generate questions: ${error.response?.data?.error || error.message}` });
    } finally {
      setGenerating(false);
    }
  };

  const handleRotateTopic = async () => {
    setMessage({ type: '', text: '' });
    try {
      const res = await adminService.rotateTopic();
      setMessage({ type: 'success', text: `✓ ${res.data.message}. New topic: ${res.data.currentTopic.name}` });
      await Promise.all([fetchAdminData(), fetchTopicInfo()]);
    } catch (error) {
      setMessage({ type: 'error', text: `✗ Failed to rotate topic: ${error.response?.data?.error || error.message}` });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">👨‍💼 Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{dashboard?.summary.totalStudents}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Total Tests</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{dashboard?.summary.totalTests}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">Topics</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{dashboard?.summary.totalTopics}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm font-medium">Today's Topic</p>
          <p className="text-lg font-bold text-orange-600 mt-2">{dashboard?.summary.activeTopic}</p>
        </div>
      </div>

      {/* Question Generation Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Question Management</h2>
        
        {message.text && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {topicInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Topic</p>
                <p className="text-lg font-semibold text-gray-800">{topicInfo.topic.name}</p>
                <p className="text-xs text-gray-500">{topicInfo.topic.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions Today</p>
                <p className="text-2xl font-bold text-blue-600">{topicInfo.questionsForToday}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions Generated</p>
                <p className="text-2xl font-bold text-green-600">{topicInfo.topic.questionsGenerated}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleGenerateQuestions}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {generating ? '⏳ Generating...' : '🤖 Generate Today\'s Questions'}
          </button>
          <button
            onClick={handleRotateTopic}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            🔄 Rotate to Next Topic
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
          <p className="font-semibold">💡 Note:</p>
          <p>Question generation uses Google Gemini API (FREE tier).</p>
          <p>Get your FREE API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google AI Studio</a></p>
          <p>Questions are automatically generated daily at midnight.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Students
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Streak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Correct</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.topPerformers.map((performer) => (
                  <tr key={performer._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{performer.studentName}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                        {performer.currentStreak} 🔥
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{performer.totalCorrectAnswers}</td>
                    <td className="px-6 py-4 text-gray-700">{performer.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-gray-700">{student.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          student.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/admin/student/${student._id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
