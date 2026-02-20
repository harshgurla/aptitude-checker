import Groq from 'groq-sdk';

// Initialize Groq with lazy loading
let groq = null;

const initializeGroq = () => {
  if (groq) return groq; // Already initialized
  
  console.log('🔧 [initializeGroq] Checking Groq API key...');
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === '' || apiKey === 'your-groq-api-key-here' || apiKey === 'your-groq-api-key') {
    const error = 'GROQ_API_KEY not configured in environment variables';
    console.error('❌ [initializeGroq] ' + error);
    console.log('   Please set GROQ_API_KEY in your Render environment variables');
    console.log('   Get your FREE key from: https://console.groq.com/keys');
    throw new Error(error);
  }
  
  try {
    console.log('🔧 [initializeGroq] Creating Groq instance...');
    groq = new Groq({ apiKey });
    console.log('✓ [initializeGroq] Groq initialized successfully');
    return groq;
  } catch (error) {
    console.error('❌ [initializeGroq] Failed to initialize Groq:', error.message);
    throw new Error(`Groq initialization failed: ${error.message}`);
  }
};

export const generateQuestionsAI = async (topic, difficulty, count = 1, retries = 3) => {
  const groqClient = initializeGroq();
  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const difficultyLevel = {
    easy: 'Easy (suitable for beginners)',
    medium: 'Medium (moderate difficulty)',
    hard: 'Hard (challenging)',
  };

  const prompt = `You are an expert aptitude test question generator. Generate EXACTLY ${count} high-quality aptitude test question(s) for the topic "${topic}" at ${difficultyLevel[difficulty]} level.

CRITICAL: You MUST generate exactly ${count} question(s). No more, no less.

For each question, provide the following in JSON format:
{
  "questions": [
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
      "explanation": "Step-by-step explanation of the correct answer"
    }
  ]
}

Requirements:
- Generate EXACTLY ${count} unique questions
- Questions must be exam-level and completely unique from each other
- For quantitative problems, answers should be exact integers or fractions
- For multiple choice, provide exactly 4 options (A, B, C, D)
- Ensure difficulty matches the requested level: ${difficultyLevel[difficulty]}
- Make questions engaging and educational
- Return valid JSON with "questions" array containing exactly ${count} items
- NO markdown code blocks, ONLY pure JSON

EXPLANATION FORMAT - VERY IMPORTANT:
- Write explanations in a clear, step-by-step manner like a teacher explaining to a student
- Break down the solution into numbered steps or clear paragraphs
- Use proper line breaks (\\n\\n) between major steps for readability
- Start each step on a new line when appropriate
- For mathematical problems:
  * State what is given clearly at the beginning
  * Show each calculation step separately
  * Explain WHY you're doing each step, not just WHAT
  * Use clear mathematical notation
- Write naturally like a human teacher, not in cramped single-line format
- Make it easy to understand for students who might struggle with the topic

Example of GOOD explanation format:
"Let's solve this step by step:\\n\\nGiven: x + (1/x) = √3\\n\\nStep 1: Square both sides\\nWhen we square both sides, we get:\\n(x + 1/x)² = (√3)²\\n\\nStep 2: Expand the left side\\nUsing the formula (a + b)² = a² + 2ab + b²:\\nx² + 2(x)(1/x) + (1/x)² = 3\\nx² + 2 + 1/x² = 3\\n\\nStep 3: Simplify\\nSubtract 2 from both sides:\\nx² + 1/x² = 1\\n\\nStep 4: Find x⁴ - x² + 1\\nMultiplying the equation by x²:\\nx⁴ + 1 = x²\\nRearranging:\\nx⁴ - x² + 1 = 0\\n\\nTherefore, the answer is 0."

Remember: Generate EXACTLY ${count} questions in the "questions" array.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 [generateQuestionsAI] Generating ${count} ${difficulty} questions for "${topic}" using ${modelName} (Attempt ${attempt}/${retries})`);
      
      let completion;
      try {
        completion = await groqClient.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: "system",
              content: "You are an expert aptitude test question generator. Always respond with valid JSON only, no markdown or code blocks."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: "json_object" }
        });
      } catch (error) {
        console.error(`❌ [generateQuestionsAI] API call failed:`, error.message);
        throw new Error(`API call failed: ${error.message}`);
      }
      
      if (!completion || !completion.choices || completion.choices.length === 0) {
        throw new Error('No response received from Groq API');
      }
      
      let content;
      try {
        content = completion.choices[0].message.content.trim();
      } catch (error) {
        console.error(`❌ [generateQuestionsAI] Failed to extract text from response:`, error.message);
        throw new Error(`Failed to extract response text: ${error.message}`);
      }
      
      if (!content) {
        throw new Error('Empty response received from Groq API');
      }
      
      // Remove markdown code blocks if present (just in case)
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let questions;
      try {
        const parsed = JSON.parse(content);
        // Groq with json_object mode wraps the array in an object
        questions = parsed.questions || parsed;
      } catch (error) {
        console.error(`❌ [generateQuestionsAI] Failed to parse JSON response:`, error.message);
        console.error(`   Response preview: ${content.substring(0, 200)}`);
        throw new Error(`Invalid JSON in response: ${error.message}`);
      }
      
      const questionsArray = Array.isArray(questions) ? questions : [questions];
      
      if (questionsArray.length === 0) {
        throw new Error('No questions received from AI');
      }

      // Warn if count doesn't match requested
      if (questionsArray.length !== count) {
        console.warn(`⚠️ [generateQuestionsAI] Expected ${count} questions but received ${questionsArray.length}`);
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
    const groqClient = initializeGroq();
    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const accuracy = ((score / totalQuestions) * 100).toFixed(2);

    const prompt = `You are a motivational coach for students taking an aptitude test.
Generate a SHORT, encouraging message (2-3 sentences max) for a student with the following performance:
- Score: ${score}/${totalQuestions} (${accuracy}% accuracy)
- Current Streak: ${streak} day(s)

Make it personalized, positive, and action-oriented. If the score is low, be supportive and motivating.
Return only the message text, no additional formatting.`;

    const completion = await groqClient.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are a motivational coach. Keep messages short, positive, and encouraging."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });
    
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Motivational Message Generation Error:', error.message);
    return `Great effort! You scored ${score}/${totalQuestions}. Keep practicing daily to improve!`;
  }
};
