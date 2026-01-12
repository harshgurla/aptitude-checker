import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { testService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const ResultsPage = () => {
  const { testId } = useParams();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [testId]);

  const fetchResult = async () => {
    try {
      const { data } = await testService.getTestResult(testId);
      setResult(data);
      // Refresh user data to update streaks and stats
      await refreshUser();
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center text-red-600">Failed to load results</div>
      </div>
    );
  }

  const accuracy = parseFloat(result.accuracy);
  const getScoreColor = () => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-blue-600';
    if (accuracy >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Score Card */}
      <div className="bg-white rounded-lg shadow p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Test Completed! 🎉</h1>

        <div className={`text-6xl font-bold ${getScoreColor()} mb-4`}>
          {result.score}/{result.totalAttempted}
        </div>

        <p className="text-gray-600 mb-2">Topic: <span className="font-semibold">{result.topicName}</span></p>

        <div className="grid grid-cols-3 gap-4 my-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Accuracy</p>
            <p className="text-3xl font-bold text-blue-600">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Attempted</p>
            <p className="text-3xl font-bold text-green-600">{result.totalAttempted}/{result.totalAttempted}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Time Spent</p>
            <p className="text-3xl font-bold text-purple-600">{Math.round(result.timeSpent / 60000)}m</p>
          </div>
        </div>

        {result.motivationalMessage && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg mt-6 shadow-sm">
            <p className="text-amber-900 text-xl font-serif leading-relaxed italic">
              {result.motivationalMessage}
            </p>
          </div>
        )}
      </div>

      {/* Answer Review */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Detailed Review</h2>
        </div>

        <div className="divide-y">
          {result.questions.map((question, index) => (
            <div key={question._id} className="border-b">
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                className="w-full p-6 text-left hover:bg-gray-50 transition flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      question.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                    <span className="text-gray-600 text-sm">Question {index + 1}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{question.question}</p>
                </div>
                <span className="text-gray-400 ml-4">
                  {expandedQuestion === index ? '▼' : '▶'}
                </span>
              </button>

              {expandedQuestion === index && (
                <div className="px-6 pb-6 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                      <p className={`p-3 rounded ${
                        question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {question.userAnswer}
                      </p>
                    </div>

                    {!question.isCorrect && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Correct Answer:</p>
                        <p className="p-3 rounded bg-green-100 text-green-800">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {question.explanation && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Explanation:</p>
                        <p className="p-3 rounded bg-blue-50 text-blue-900">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <a
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </a>
        <a
          href="/test"
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
        >
          Take Another Test
        </a>
      </div>
    </div>
  );
};
