import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini with lazy loading
let genAI = null;
let model = null;

const initializeGemini = () => {
  if (model) return model; // Already initialized
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '' || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    throw new Error('GEMINI_API_KEY not configured in .env file. Get your FREE key from: https://makersuite.google.com/app/apikey');
  }
  
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });
    console.log('✓ Google Gemini initialized successfully');
    return model;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
    throw new Error(`Gemini initialization failed: ${error.message}`);
  }
};

export const generateQuestionsAI = async (topic, difficulty, count = 1, retries = 3) => {
  const aiModel = initializeGemini();

  const difficultyLevel = {
    easy: 'Easy (suitable for beginners)',
    medium: 'Medium (moderate difficulty)',
    hard: 'Hard (challenging)',
  };

  const prompt = `You are an expert aptitude test question generator. Generate exactly ${count} high-quality aptitude test question(s) for the topic "${topic}" at ${difficultyLevel[difficulty]} level.

For each question, provide the following in JSON format:
{
  "question": "The question text here",
  "category": "Quantitative Aptitude|Logical Reasoning|Verbal Ability",
  "options": [
    {"id": "A", "text": "Option A text"},
    {"id": "B", "text": "Option B text"},
    {"id": "C", "text": "Option C text"},
    {"id": "D", "text": "Option D text"}
  ],
  "correctAnswer": "A|B|C|D",
  "explanation": "Brief explanation of the correct answer"
}

Requirements:
- Questions must be exam-level and unique
- For quantitative problems, answers should be exact integers or fractions
- For multiple choice, provide exactly 4 options
- Ensure difficulty matches the requested level
- Make questions engaging and educational
- Return ONLY valid JSON array format, no markdown, no code blocks

Example format for multiple questions:
[
  {"question": "...", "category": "...", "options": [...], "correctAnswer": "A", "explanation": "..."},
  {"question": "...", "category": "...", "options": [...], "correctAnswer": "B", "explanation": "..."}
]`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 Generating ${count} ${difficulty} questions for "${topic}" (Attempt ${attempt}/${retries})`);
      
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      let content = response.text().trim();
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const questions = JSON.parse(content);
      const questionsArray = Array.isArray(questions) ? questions : [questions];
      
      // Validate question structure
      for (const q of questionsArray) {
        if (!q.question || !q.options || q.options.length !== 4 || !q.correctAnswer) {
          throw new Error('Invalid question format received from AI');
        }
      }
      
      console.log(`✓ Successfully generated ${questionsArray.length} questions`);
      return questionsArray;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to generate questions after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const generateMotivationalMessage = async (score, totalQuestions, streak) => {
  try {
    const aiModel = initializeGemini();
    const accuracy = ((score / totalQuestions) * 100).toFixed(2);

    const prompt = `You are a motivational coach for students taking an aptitude test.
Generate a SHORT, encouraging message (2-3 sentences max) for a student with the following performance:
- Score: ${score}/${totalQuestions} (${accuracy}% accuracy)
- Current Streak: ${streak} day(s)

Make it personalized, positive, and action-oriented. If the score is low, be supportive and motivating.
Return only the message text, no additional formatting.`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Motivational Message Generation Error:', error.message);
    return `Great effort! You scored ${score}/${totalQuestions}. Keep practicing daily to improve!`;
  }
};
