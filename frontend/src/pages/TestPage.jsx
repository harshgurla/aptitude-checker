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
        <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 text-gray-700 dark:text-gray-300">Loading today's topic...</div>
      </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Today's Aptitude Test</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Topic: <span className="font-semibold text-blue-600 dark:text-blue-400">{todayTopic.name}</span></p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">20 Questions • 60 Minutes</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back
            </button>
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
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
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/50 sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{test.topicName}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Question {currentQuestion + 1} of {test.totalQuestions}</p>
          </div>
          <Timer endTime={new Date(test.scheduledEndTime)} onTimeUp={handleTimeUp} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Question Navigator */}
          <div className="col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-4 sticky top-32 transition-colors duration-300">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Questions</h3>
              <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                {test.questions.map((q, idx) => (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all duration-300 ${
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

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 transition-colors duration-300">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Question {currentQuestion + 1}</p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{question.question}</h2>

              <div className="space-y-3 mb-8">
                {question.options.map((option) => (
                  <label key={option.id} className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option.id}
                      checked={answers[question._id] === option.id}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-4 font-medium text-gray-700 dark:text-gray-300">{option.id}. {option.text}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleMarkForReview}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isMarked
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isMarked ? '✓ Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  ← Previous
                </button>

                {currentQuestion === test.totalQuestions - 1 ? (
                  <button
                    onClick={handleSubmitTest}
                    disabled={loading || Object.keys(answers).filter(key => answers[key] !== '').length < test.totalQuestions}
                    className="px-8 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    title={Object.keys(answers).filter(key => answers[key] !== '').length < test.totalQuestions ? `Answer all questions to submit (${Object.keys(answers).filter(key => answers[key] !== '').length}/${test.totalQuestions})` : 'Submit Test'}
                  >
                    {loading ? 'Submitting...' : 'Submit Test'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(test.totalQuestions - 1, currentQuestion + 1))}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
