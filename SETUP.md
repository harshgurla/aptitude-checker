# 🚀 Aptitude Test Platform - Setup & Deployment Guide

## Project Overview

A complete, production-ready AI-powered Daily Aptitude Test Platform with:
- ✅ Full-stack React + Node.js application
- ✅ MongoDB database with optimized schemas
- ✅ OpenAI integration for AI question generation
- ✅ Real-time leaderboard via Socket.IO
- ✅ Docker containerization for easy deployment
- ✅ Complete security with JWT + bcrypt

---

## 📦 Project Structure

```
aptitude-master2/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Database & constants
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth & error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── seeds/            # Initial data
│   │   └── server.js         # Entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API calls
│   │   ├── utils/            # Utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .gitignore
│
├── docker-compose.yml         # Multi-container setup
├── Dockerfile.backend         # Backend container
├── Dockerfile.frontend        # Frontend container
├── nginx.conf                 # Nginx configuration
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Option 1: Local Development (Recommended for Development)

#### 1. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
# Required:
# - MONGODB_URI=mongodb://localhost:27017/aptitude-test-db
# - JWT_SECRET=your-secret-key
# - OPENAI_API_KEY=your-openai-key

# Install dependencies
npm install

# Seed initial data (creates admin, students, topics, questions)
npm run seed

# Start development server
npm run dev
# Server will run on http://localhost:5000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Application will run on http://localhost:5173
```

#### 3. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

### Option 2: Docker Deployment (Production Ready)

#### Prerequisites
- Docker >= 20.10
- Docker Compose >= 1.29

#### 1. Setup Environment

```bash
# Copy backend env file
cp backend/.env.example .env

# Edit with your settings
nano .env
# Required:
# - JWT_SECRET=your-production-secret
# - OPENAI_API_KEY=your-openai-key
```

#### 2. Start Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Seed database
docker-compose exec backend npm run seed

# Stop services
docker-compose down
```

#### 3. Access Services
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: localhost:27017

#### 4. Verify Deployment

```bash
# Check backend
curl http://localhost:5000/api/health

# Check frontend is running
curl http://localhost:5173

# View running containers
docker-compose ps
```

---

## 🔐 Demo Credentials

After seeding the database:

### Student Account
```
Email: student1@aptitude.com
Password: student123
```

### Admin Account
```
Email: admin@aptitude.com
Password: admin123
```

---

## 📱 Features by User Role

### Student Dashboard
- ✅ Today's topic and test button
- ✅ Current and best streak tracking
- ✅ Accuracy trend charts
- ✅ Leaderboard ranking
- ✅ Recent test history
- ✅ Detailed test results with explanations

### Test Interface
- ✅ 60-minute countdown timer
- ✅ Question navigator with status indicators
- ✅ Mark for review functionality
- ✅ Next/Previous navigation
- ✅ Auto-submission on time expiry
- ✅ Immediate results after submission

### Admin Dashboard
- ✅ Student management (view, pause, resume, deactivate)
- ✅ Performance analytics
- ✅ Leaderboard management
- ✅ Topic scheduling
- ✅ Test history review
- ✅ System health overview

---

## 🔄 Daily Test Schedule

The system operates on a daily cycle:

### Midnight (00:00) UTC
1. **Topic Rotation**: Active topic changes to next in sequence
2. **Question Generation**: AI generates 20 new questions for the topic
3. **Leaderboard Update**: Ranks recalculated based on latest scores

### Throughout the Day
- **Test Availability**: One test available per student
- **Real-time Updates**: Leaderboard updates after each submission
- **Streak Tracking**: Maintained in real-time

### Timer Management
- **Start**: Begins when student clicks "Start Test"
- **Duration**: 60 minutes
- **Auto-submit**: At time expiry, answers submitted automatically

---

## 🤖 AI Integration

### OpenAI Configuration

The system uses OpenAI's GPT-3.5-Turbo for:

1. **Question Generation**
   ```
   Prompt: Generate exam-level aptitude questions for [topic] at [difficulty] level
   Response: JSON array of questions with options and correct answers
   ```

2. **Motivational Messages**
   ```
   Prompt: Generate encouraging message based on score, accuracy, and streak
   Response: Personalized motivation text
   ```

### Setting Up OpenAI

1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env` file:
   ```
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```
3. Verify configuration with health check endpoint

---

## 📊 Database Schema

### Key Collections

#### Users
- Authentication credentials
- Streak tracking
- Performance metrics
- Test pause status

#### Topics (31 total)
- Quantitative Aptitude (13 topics)
- Logical Reasoning (10 topics)
- Verbal Ability (8 topics)

#### Questions
- Topic references
- Difficulty levels
- AI-generated content
- Correctness verification

#### Tests
- Student submissions
- Answer tracking
- Score calculation
- Time tracking

#### Leaderboard
- Ranking algorithms
- Performance metrics
- Real-time updates

---

## 🔐 Security Implementation

### Authentication
- JWT tokens with configurable expiry
- Secure password hashing with bcryptjs
- Token refresh on login

### Authorization
- Role-based access control (RBAC)
- Student-specific endpoints
- Admin-protected routes

### Validation
- Server-side input validation
- Answer evaluation security
- Timer verification on backend

### Data Protection
- CORS enabled for frontend
- Helmet.js security headers
- Environment variable secrets
- No sensitive data in logs

---

## 📈 Scaling Considerations

### Current Setup
- Single MongoDB instance
- Single backend server
- In-memory Socket.IO

### For Production Scaling

1. **Database**
   - MongoDB replica set
   - Sharding for large datasets
   - Read replicas for analytics

2. **Backend**
   - Load balancing (Nginx)
   - Horizontal scaling
   - Session storage (Redis)

3. **Real-time**
   - Redis adapter for Socket.IO
   - Distributed message queue

4. **Caching**
   - Redis for question caching
   - Response caching
   - Leaderboard caching

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### OpenAI API Errors

```bash
# Verify API key
echo $OPENAI_API_KEY

# Check API status
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Port Already in Use

```bash
# Backend (5000)
lsof -i :5000
kill -9 <PID>

# Frontend (5173)
lsof -i :5173
kill -9 <PID>
```

### Docker Issues

```bash
# Remove all containers
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# Check logs
docker-compose logs <service-name>
```

---

## 📝 Environment Variables Reference

```env
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/aptitude-test-db

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Deployment Checklist

- [ ] All environment variables set in production
- [ ] JWT_SECRET changed from default
- [ ] OpenAI API key configured
- [ ] MongoDB backup strategy in place
- [ ] CORS origin updated for production domain
- [ ] SSL/TLS certificates configured
- [ ] Database user credentials created
- [ ] Monitoring and logging configured
- [ ] Rate limiting enabled
- [ ] Error tracking service configured

---

## 📞 Support & Resources

### Common Issues
1. **Tests not generating**: Check OpenAI API key and quota
2. **Leaderboard not updating**: Verify Socket.IO connection
3. **Database errors**: Ensure MongoDB is running and connected

### API Documentation
- Backend: `/api/` endpoints documented in code
- Request/response formats in controller comments
- Error codes and handling in middleware

### Development Tips
- Use VS Code for best IDE experience
- Install Postman for API testing
- Use MongoDB Compass for database inspection
- Chrome DevTools for frontend debugging

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🎯 Next Steps

1. **Start the application** using Option 1 or 2 above
2. **Create a student account** via registration
3. **Take your first test** from the dashboard
4. **Review results** to see AI-powered feedback
5. **Build your streak** by returning daily
6. **Climb the leaderboard** with consistent performance

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for students everywhere**

Last Updated: January 2026
Version: 1.0.0
