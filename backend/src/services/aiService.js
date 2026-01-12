import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini with lazy loading
let genAI = null;
let model = null;

const initializeGemini = () => {
  if (model) return model; // Already initialized
  
  console.log('🔧 [initializeGemini] Checking Gemini API key...');
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === '' || apiKey === 'your-gemini-api-key-here' || apiKey === 'your-gemini-api-key') {
    const error = 'GEMINI_API_KEY not configured in environment variables';
    console.error('❌ [initializeGemini] ' + error);
    console.log('   Please set GEMINI_API_KEY in your Render environment variables');
    console.log('   Get your FREE key from: https://makersuite.google.com/app/apikey');
    throw new Error(error);
  }
  
  try {
    console.log('🔧 [initializeGemini] Creating GoogleGenerativeAI instance...');
    genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    console.log(`🔧 [initializeGemini] Getting model: ${modelName}`);
    model = genAI.getGenerativeModel({ model: modelName });
    console.log('✓ [initializeGemini] Google Gemini initialized successfully');
    return model;
  } catch (error) {
    console.error('❌ [initializeGemini] Failed to initialize Gemini:', error.message);
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
      console.log(`🤖 [generateQuestionsAI] Generating ${count} ${difficulty} questions for "${topic}" (Attempt ${attempt}/${retries})`);
      
      let result;
      try {
        result = await aiModel.generateContent(prompt);
      } catch (error) {
        console.error(`❌ [generateQuestionsAI] API call failed:`, error.message);
        throw new Error(`API call failed: ${error.message}`);
      }
      
      if (!result || !result.response) {
        throw new Error('No response received from Gemini API');
      }
      
      let content;
      try {
        content = result.response.text().trim();
      } catch (error) {
        console.error(`❌ [generateQuestionsAI] Failed to extract text from response:`, error.message);
        throw new Error(`Failed to extract response text: ${error.message}`);
      }
      
      if (!content) {
        throw new Error('Empty response received from Gemini API');
      }
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let questions;
      try {
        questions = JSON.parse(content);
      } catch (error) {
        console.error(`❌ [generateQuestionsAI] Failed to parse JSON response:`, error.message);
        console.error(`   Response preview: ${content.substring(0, 200)}`);
        throw new Error(`Invalid JSON in response: ${error.message}`);
      }
      
      const questionsArray = Array.isArray(questions) ? questions : [questions];
      
      if (questionsArray.length === 0) {
        throw new Error('No questions received from AI');
      }
      
      // Validate question structure
      for (let i = 0; i < questionsArray.length; i++) {
        const q = questionsArray[i];
        if (!q.question) {
          throw new Error(`Question ${i + 1} missing 'question' field`);
        }
        if (!q.options) {
          throw new Error(`Question ${i + 1} missing 'options' field`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${i + 1} must have exactly 4 options`);
        }
        if (!q.correctAnswer) {
          throw new Error(`Question ${i + 1} missing 'correctAnswer' field`);
        }
      }
      
      console.log(`✓ [generateQuestionsAI] Successfully generated ${questionsArray.length} questions`);
      return questionsArray;
      
    } catch (error) {
      console.error(`❌ [generateQuestionsAI] Attempt ${attempt}/${retries} failed: ${error.message}`);
      
      if (attempt === retries) {
        throw new Error(`Failed to generate questions after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = 1000 * attempt;
      console.log(`   Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
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
