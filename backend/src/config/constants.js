export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

export const TOPICS = {
  QUANTITATIVE: [
    'Number System',
    'Percentages',
    'Profit & Loss',
    'Simple & Compound Interest',
    'Ratio & Proportion',
    'Time & Work',
    'Time, Speed & Distance',
    'Averages',
    'Mixtures & Alligations',
    'Algebra',
    'Geometry & Mensuration',
    'Permutation & Combination',
    'Probability',
  ],
  LOGICAL: [
    'Blood Relations',
    'Direction Sense',
    'Seating Arrangement',
    'Puzzles',
    'Syllogism',
    'Statements & Conclusions',
    'Coding–Decoding',
    'Series',
    'Venn Diagrams',
    'Data Sufficiency',
  ],
  VERBAL: [
    'Reading Comprehension',
    'Synonyms & Antonyms',
    'Error Detection',
    'Sentence Improvement',
    'Fill in the Blanks',
    'Para Jumbles',
    'Idioms & Phrases',
    'Vocabulary',
  ],
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const DIFFICULTY_SPLIT = {
  [DIFFICULTY.EASY]: 5,
  [DIFFICULTY.MEDIUM]: 10,
  [DIFFICULTY.HARD]: 5,
};

export const DIFFICULTY_POINTS = {
  [DIFFICULTY.EASY]: 1,
  [DIFFICULTY.MEDIUM]: 2,
  [DIFFICULTY.HARD]: 3,
};

export const TEST_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds
export const QUESTIONS_PER_TEST = 20;

export const SCORING = {
  CORRECT: 1,
  WRONG: 0,
  UNATTEMPTED: 0,
};
