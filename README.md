# 🎯 Aptitude Test Platform - AI-Powered Daily Testing System

A production-ready, AI-powered daily aptitude test platform designed for students to improve their quantitative reasoning, logical analysis, and verbal skills through consistent daily practice.

## ✨ Features

### 🏆 Core Features
- **Daily Aptitude Tests**: One new topic every day with 20 AI-generated questions
- **3 Test Categories**: Quantitative Aptitude, Logical Reasoning, Verbal Ability
- **Difficulty Levels**: Easy (5 questions), Medium (10 questions), Hard (5 questions)
- **Strict Timer**: 60-minute countdown with auto-submission
- **Real-time Leaderboard**: Live rankings based on streaks, accuracy, and consistency

### 👥 User Roles
- **Students**: Take tests, track progress, compete on leaderboards
- **Admins**: Manage students, view analytics, control test schedules, reset leaderboards

### 📊 Analytics & Tracking
- **Streak System**: Track current and best streaks
- **Accuracy Metrics**: Real-time accuracy percentage and trends
- **Consistency Score**: Measure daily performance stability
- **Test History**: Complete record of all attempted tests
- **Performance Analytics**: Category-wise and difficulty-wise performance breakdown

### 🤖 AI Integration
- **Question Generation**: OpenAI-powered exam-level question creation
- **Motivational Messages**: Personalized encouragement after each test
- **Question Caching**: Optimized question storage to prevent repeats
- **Smart Evaluation**: Exact answer matching for mathematical problems

### ⚡ Technical Excellence
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission management
- **Socket.IO Real-time**: Live leaderboard updates
- **MongoDB Indexing**: Optimized database queries
- **Docker Ready**: Complete containerization for deployment
- **Scalable Architecture**: Production-ready infrastructure

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite) - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled jobs
- **OpenAI API** - LLM integration
- **Socket.IO** - WebSocket communication

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy

## 📋 Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin',
  isActive: Boolean,
  currentStreak: Number,
  bestStreak: Number,
  totalCorrect: Number,
  totalAttempts: Number,
  lastTestDate: Date,
  dailyScores: [{ date: Date, score: Number }]
}
```

### Topics
```javascript
{
  name: String (unique),
  category: 'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability',
  description: String,
  order: Number,
  isActive: Boolean,
  questionsGenerated: Number
}
```

### Questions
```javascript
{
  topic: ObjectId,
  category: String,
  difficulty: 'easy' | 'medium' | 'hard',
  question: String,
  options: [{ id: String, text: String }],
  correctAnswer: String,
  correctAnswerExplanation: String,
  questionSignature: String (unique),
  createdByAI: Boolean,
  usedInTests: [ObjectId]
}
```

### Tests
```javascript
{
  student: ObjectId,
  topic: ObjectId,
  topicName: String,
  questions: [ObjectId],
  startTime: Date,
  endTime: Date,
  scheduledEndTime: Date,
  status: 'started' | 'in-progress' | 'submitted' | 'auto-submitted',
  score: Number,
  totalCorrect: Number,
  totalAttempted: Number,
  accuracy: Number,
  submittedAnswers: [{ questionId, answer, isCorrect, markedForReview }],
  motivationalMessage: String
}
```

### Leaderboard
```javascript
{
  student: ObjectId,
  studentName: String,
  currentStreak: Number,
  bestStreak: Number,
  totalCorrectAnswers: Number,
  totalAttempts: Number,
  accuracy: Number,
  consistencyScore: Number,
  rank: Number
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB >= 5.0
- OpenAI API Key

### Local Development Setup

1. **Clone and Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run seed  # Seed initial data
npm run dev
```

2. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api

### Demo Credentials
```
Student Login:
Email: student1@aptitude.com
Password: student123

Admin Login:
Email: admin@aptitude.com
Password: admin123
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Create .env file with required variables
cp backend/.env.example .env

# Start all services
docker-compose up -d

# Seed database
docker-compose exec backend npm run seed
```

### Manual Docker Build
```bash
# Backend only
docker build -f Dockerfile.backend -t aptitude-backend .
docker run -p 5000:5000 --env-file .env aptitude-backend

# Frontend only
docker build -f Dockerfile.frontend -t aptitude-frontend .
docker run -p 5173:5173 aptitude-frontend
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update profile
```

### Tests
```
POST   /api/test/start             - Start today's test
POST   /api/test/submit            - Submit test answers
GET    /api/test/result/:testId    - Get test results
GET    /api/test/history           - Get test history
GET    /api/test/status/:testId    - Get current test status
```

### Dashboard
```
GET    /api/dashboard/today-topic  - Get today's topic
GET    /api/dashboard/leaderboard  - Get top 10 leaderboard
GET    /api/dashboard/my-rank      - Get user's rank
GET    /api/dashboard/all-topics   - Get all topics
GET    /api/dashboard/schedule     - Get schedule info
```

### Admin
```
GET    /api/admin/dashboard        - Admin overview
GET    /api/admin/students         - List all students
GET    /api/admin/student/:id      - Get student details
POST   /api/admin/student/:id/pause       - Pause student tests
POST   /api/admin/student/:id/resume      - Resume student tests
POST   /api/admin/student/:id/toggle      - Toggle student active
POST   /api/admin/leaderboard/reset       - Reset leaderboard
GET    /api/admin/analytics       - Get detailed analytics
```

## 🔐 Security Features

1. **JWT Tokens**: Secure, stateless authentication
2. **Password Hashing**: bcryptjs with salt rounds
3. **Server-side Validation**: All inputs validated and sanitized
4. **Role-Based Access**: Admin endpoints protected
5. **Timer Validation**: Server-side time verification
6. **Prevention of Cheating**: Single test per day, answer evaluation on backend
7. **CORS Protection**: Configured CORS headers
8. **Helmet.js**: Security headers middleware

## 📊 Daily Test Rules

- ✅ **One Topic Per Day**: Topic rotates daily at midnight
- ✅ **20 Questions Fixed**: Always 20 questions per test
- ✅ **Difficulty Split**: 5 Easy, 10 Medium, 5 Hard
- ✅ **60-Minute Limit**: Strict timer, auto-submission on expiry
- ✅ **No Repeats**: Question signatures prevent duplicates
- ✅ **Cycle System**: Topics cycle through all 31 categories
- ✅ **Instant Feedback**: Results shown immediately with explanations

## 🤖 AI Implementation

### Question Generation
The system uses OpenAI's GPT-3.5-Turbo to generate exam-quality questions:

```javascript
// Example generation
const questions = await generateQuestionsAI(topic, difficulty, count);
// Returns: Array of {question, options, correctAnswer, explanation}
```

### Answer Evaluation
Deterministic backend evaluation using exact string matching:
```javascript
const isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
```

### Motivational Messages
Context-aware encouragement based on performance:
```javascript
const message = await generateMotivationalMessage(score, total, streak);
```

## 📈 Performance Metrics

### Streak System
- **Current Streak**: Consecutive days of test attempts
- **Best Streak**: Maximum streak achieved
- **Broken Streak**: Resets to 1 if day missed

### Accuracy Metrics
- **Accuracy %**: (Correct / Attempted) × 100
- **Consistency Score**: Standard deviation-based metric (0-100)
- **Category Performance**: Separate tracking per topic

### Leaderboard Ranking
Priority: Streak → Total Correct → Accuracy → Consistency

## 🔄 Scheduled Jobs

Using **node-cron**, the system runs:

- **Midnight (00:00)**: Daily topic rotation
- **Midnight (00:00)**: AI question generation for new topic
- **Real-time**: Leaderboard rank updates after each test

## 📱 Responsive Design

- Mobile-first Tailwind CSS design
- Fully responsive across devices
- Touch-optimized inputs and buttons
- Progressive enhancement for older browsers

## 🛡️ Error Handling

Comprehensive error handling with:
- Try-catch blocks in all async operations
- Validation error messages
- User-friendly error displays
- Detailed server logging
- Graceful fallbacks

## 🚨 Known Limitations

1. OpenAI API dependency - fallback messages used if API unavailable
2. Real-time updates limited to Socket.IO - no persistence across disconnects
3. Local question generation only - no offline mode
4. Single database instance - no replication

## 🔮 Future Enhancements

- [ ] Offline mode with service workers
- [ ] Advanced analytics dashboard
- [ ] Question difficulty auto-adjustment
- [ ] Peer discussion forums
- [ ] Mobile app (React Native)
- [ ] Email notifications for streaks
- [ ] Spaced repetition for weak areas
- [ ] Video explanations for questions
- [ ] Study groups and collaborative learning
- [ ] Mock exam simulations

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aptitude-test-db
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=7d
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
CORS_ORIGIN=http://localhost:5173
```

## 📚 Project Structure

```
aptitude-master2/
├── backend/
│   ├── src/
│   │   ├── models/        (MongoDB schemas)
│   │   ├── controllers/   (Request handlers)
│   │   ├── routes/        (API endpoints)
│   │   ├── services/      (Business logic)
│   │   ├── middleware/    (Auth, error handling)
│   │   ├── config/        (Constants, database)
│   │   ├── utils/         (Helpers)
│   │   ├── seeds/         (Initial data)
│   │   └── server.js      (Entry point)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    (Reusable components)
│   │   ├── pages/         (Page components)
│   │   ├── services/      (API calls)
│   │   ├── context/       (Auth context)
│   │   ├── hooks/         (Custom hooks)
│   │   ├── utils/         (Utilities)
│   │   ├── App.jsx        (Main component)
│   │   ├── main.jsx       (Entry point)
│   │   └── index.css      (Global styles)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact the development team
- Check existing documentation

## 🎓 Learning Path

1. Start with login/registration
2. Take your first daily test
3. Review detailed results
4. Monitor your accuracy trend
5. Climb the leaderboard
6. Build your streak to 30+

## 🏁 Conclusion

The Aptitude Test Platform is a comprehensive, production-ready system designed to help students excel through consistent daily practice. With AI-powered question generation, real-time analytics, and competitive leaderboards, it creates an engaging and effective learning environment.

**Start your aptitude journey today!** 🚀

---

**Built with ❤️ by the Aptitude Team**

Last Updated: January 2026
