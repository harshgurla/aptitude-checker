import React, { useState, useEffect } from 'react';
import { testService, dashboardService } from '../services/api';
import { Timer } from '../components/Timer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const TestPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [todayTopic, setTodayTopic] = useState(null);

  useEffect(() => {
    fetchTodayTopic();
  }, []);

  const fetchTodayTopic = async () => {
    try {
      const { data } = await dashboardService.getTodayTopic();
      setTodayTopic(data.topic);
    } catch (err) {
      setError('Failed to load today topic');
    }
  };

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const { data } = await testService.startTest();
      setTest(data);
      setAnswers({});
      setCurrentQuestion(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleMarkForReview = () => {
    const questionId = test.questions[currentQuestion]._id;
    const newMarked = new Set(marked);
    if (newMarked.has(questionId)) {
      newMarked.delete(questionId);
    } else {
      newMarked.add(questionId);
    }
    setMarked(newMarked);
  };

  const handleSubmitTest = async () => {
    // Check if all questions are answered
    const totalQuestions = test.questions.length;
    const answeredQuestions = Object.keys(answers).filter(key => answers[key] !== '').length;
    
    if (answeredQuestions < totalQuestions) {
      alert(`Please answer all questions before submitting!\n\nAnswered: ${answeredQuestions}/${totalQuestions}`);
      return;
    }

    if (!window.confirm('Are you sure you want to submit? You cannot make changes after this.')) {
      return;
    }

    setLoading(true);
    try {
      const submissionAnswers = test.questions.map((q) => ({
        questionId: q._id,
        answer: answers[q._id] || '',
        markedForReview: marked.has(q._id),
      }));

      const { data } = await testService.submitTest(test.testId, submissionAnswers);
      
      // Refresh user data to update streaks and stats immediately
      await refreshUser();
      
      navigate(`/results/${test.testId}`, { state: data });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    alert('Time is up! Auto-submitting your test...');
    handleSubmitTest();
  };

  if (!todayTopic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12 text-sm sm:text-base text-gray-700 dark:text-gray-300">Loading today's topic...</div>
      </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-white">Today's Aptitude Test</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">Topic: <span className="font-semibold text-blue-600 dark:text-blue-400">{todayTopic.name}</span></p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">20 Questions • 60 Minutes</p>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation"
            >
              Back
            </button>
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 touch-manipulation"
            >
              {loading ? 'Starting...' : 'Start Test'}
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const isAnswered = answers[question._id] !== undefined && answers[question._id] !== '';
  const isMarked = marked.has(question._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/50 sticky top-0 sm:top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">{test.topicName}</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Question {currentQuestion + 1} of {test.totalQuestions}</p>
            </div>
            <Timer endTime={new Date(test.scheduledEndTime)} onTimeUp={handleTimeUp} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 mb-8">
          {/* Question Navigator - Mobile: Collapsible, Desktop: Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-3 sm:p-4 lg:sticky lg:top-32 transition-colors duration-300">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white mb-3 sm:mb-4">Questions</h3>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 max-h-60 sm:max-h-80 overflow-y-auto">
                {test.questions.map((q, idx) => (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all duration-300 touch-manipulation min-h-[44px] ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : answers[q._id]
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : marked.has(q._id)
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded"></div>
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl dark:shadow-2xl p-4 sm:p-6 md:p-8 transition-colors duration-300">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Question {currentQuestion + 1}</p>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">{question.question}</h2>

              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {question.options.map((option) => (
                  <label key={option.id} className="flex items-start sm:items-center p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 touch-manipulation min-h-[44px]">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option.id}
                      checked={answers[question._id] === option.id}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 sm:mt-0 flex-shrink-0"
                    />
                    <span className="ml-3 sm:ml-4 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">{option.id}. {option.text}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={handleMarkForReview}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation ${
                    isMarked
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isMarked ? '✓ Marked' : 'Mark for Review'}
                </button>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="order-1 px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 touch-manipulation text-sm sm:text-base"
                >
                  ← Previous
                </button>

                {currentQuestion === test.totalQuestions - 1 ? (
                  <button
                    onClick={handleSubmitTest}
                    disabled={loading || Object.keys(answers).filter(key => answers[key] !== '').length < test.totalQuestions}
                    className="order-2 sm:order-3 px-6 sm:px-8 py-2.5 sm:py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
                    title={Object.keys(answers).filter(key => answers[key] !== '').length < test.totalQuestions ? `Answer all questions to submit (${Object.keys(answers).filter(key => answers[key] !== '').length}/${test.totalQuestions})` : 'Submit Test'}
                  >
                    {loading ? 'Submitting...' : 'Submit Test'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(test.totalQuestions - 1, currentQuestion + 1))}
                    className="order-2 sm:order-3 px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation text-sm sm:text-base"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
