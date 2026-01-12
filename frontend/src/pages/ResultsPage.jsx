import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
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
        <div className="text-center text-sm sm:text-base">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="text-center text-sm sm:text-base text-red-600">Failed to load results</div>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 text-center transition-colors duration-300">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Test Completed! 🎉</h1>

        <div className={`text-4xl sm:text-5xl md:text-6xl font-bold ${getScoreColor()} mb-3 sm:mb-4`}>
          {result.score}/{result.totalAttempted}
        </div>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">Topic: <span className="font-semibold text-gray-800 dark:text-white">{result.topicName}</span></p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 my-6 sm:my-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Accuracy</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Attempted</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{result.totalAttempted}/{result.totalAttempted}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Time Spent</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.round(result.timeSpent / 60000)}m</p>
          </div>
        </div>

        {result.motivationalMessage && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 p-4 sm:p-6 rounded-lg mt-4 sm:mt-6 shadow-sm">
            <p className="text-amber-900 dark:text-amber-200 text-base sm:text-lg md:text-xl font-serif leading-relaxed italic">
              {result.motivationalMessage}
            </p>
          </div>
        )}
      </div>

      {/* Answer Review */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl overflow-hidden transition-colors duration-300">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Detailed Review</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {result.questions.map((question, index) => (
            <div key={question._id} className="border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-start justify-between touch-manipulation"
              >
                <div className="flex-1 pr-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                    <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${
                      question.isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {question.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Question {index + 1}</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">{question.question}</p>
                </div>
                <span className="text-gray-400 dark:text-gray-500 ml-2 text-lg sm:text-xl flex-shrink-0">
                  {expandedQuestion === index ? '▼' : '▶'}
                </span>
              </button>

              {expandedQuestion === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-gray-50 dark:bg-gray-700/50">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Answer:</p>
                      <p className={`p-2 sm:p-3 text-sm sm:text-base rounded ${
                        question.isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {question.userAnswer}
                      </p>
                    </div>

                    {!question.isCorrect && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Correct Answer:</p>
                        <p className="p-2 sm:p-3 text-sm sm:text-base rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {question.explanation && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Explanation:</p>
                        <div className="p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 leading-relaxed text-sm sm:text-base">
                          {question.explanation.split('\n').map((line, index) => (
                            <p key={index} className={line.trim() === '' ? 'h-2' : 'mb-2'}>
                              {line}
                            </p>
                          ))}
                        </div>
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
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center touch-manipulation"
        >
          Back to Dashboard
        </Link>
        <Link
          to="/test"
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center touch-manipulation"
        >
          Take Another Test
        </Link>
      </div>
    </div>
  );
};
