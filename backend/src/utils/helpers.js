export const generateQuestionSignature = (question, category, difficulty) => {
  const hash = require('crypto').createHash('sha256');
  hash.update(`${question}${category}${difficulty}`);
  return hash.digest('hex');
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const calculateAccuracy = (correct, total) => {
  if (total === 0) return 0;
  return ((correct / total) * 100).toFixed(2);
};

export const calculateConsistencyScore = (dailyScores) => {
  if (dailyScores.length === 0) return 0;
  const avg = dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length;
  const variance = dailyScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / dailyScores.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (stdDev * 10));
  return Math.min(100, consistency).toFixed(2);
};
