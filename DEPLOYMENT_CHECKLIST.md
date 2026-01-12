# 🚀 Deployment Checklist

## ⚠️ Critical Issues to Fix Before Deployment

### 1. **Environment Variables** ✅ REQUIRED

#### Backend (.env)
- [ ] Change `JWT_SECRET` to a strong random string (use: `openssl rand -base64 32`)
- [ ] Update `MONGODB_URI` to production MongoDB connection string
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your production frontend URL
- [ ] Keep `GEMINI_API_KEY` (already configured)
- [ ] Update `PORT` if needed (default: 5000)

#### Frontend (.env)
- [ ] Create `.env.production` file
- [ ] Set `VITE_API_URL` to your production backend URL
- [ ] Set `VITE_SOCKET_URL` to your production backend URL

### 2. **Security Issues** 🔒 CRITICAL

```bash
# Backend - Generate secure JWT secret
openssl rand -base64 32
```

**Current Issues:**
- ❌ JWT_SECRET is weak: `your-super-secret-jwt-key-change-in-production`
- ❌ Admin password is simple: `admin123`

**Fix:**
```javascript
// After deployment, change admin password via database or create a new admin
```

### 3. **Hardcoded URLs** 🌐 FIXED

✅ Fixed:
- `AuthContext.jsx` - Now uses `VITE_API_URL`
- `vite.config.js` - Now uses `VITE_API_URL`
- `useSocket.js` - Already uses `VITE_SOCKET_URL`

### 4. **Database Setup** 💾

```bash
# Run seeds on production (ONLY ONCE)
npm run seed
```

**Warning:** This will:
- Create admin user
- Create 31 topics
- Generate sample questions
- Clear existing data

### 5. **Build Configuration** 📦

#### Frontend Build
```bash
cd frontend
npm run build
# Generates 'dist' folder for deployment
```

#### Backend
```bash
cd backend
npm start  # Production mode
```

### 6. **CORS Configuration** 🌍

Update `backend/.env`:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

Update `backend/src/server.js` if multiple origins needed:
```javascript
cors({
  origin: [
    process.env.CORS_ORIGIN,
    'https://additional-domain.com'
  ],
  credentials: true,
})
```

### 7. **Rate Limiting** ⏱️ RECOMMENDED

Add rate limiting to prevent abuse:
```bash
cd backend
npm install express-rate-limit
```

### 8. **Logging** 📝 RECOMMENDED

Current: Using `morgan` in dev mode

For production:
```javascript
// server.js
app.use(morgan('combined')); // More detailed logs
```

### 9. **Error Handling** ⚠️ GOOD

✅ Already configured:
- Global error handler
- 404 handler
- Try-catch blocks

### 10. **Package Dependencies** 📦

```bash
# Check for vulnerabilities
npm audit

# Fix if needed
npm audit fix
```

---

## 🎯 Deployment Steps

### Option 1: Deploy to Render/Railway/Heroku

1. **Create accounts** on deployment platform
2. **Backend Deployment:**
   - Connect GitHub repo
   - Set environment variables
   - Select `backend` folder as root
   - Build command: `npm install`
   - Start command: `npm start`

3. **Frontend Deployment:**
   - Connect GitHub repo
   - Set environment variables (VITE_API_URL)
   - Select `frontend` folder as root
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Database:**
   - Use MongoDB Atlas (free tier)
   - Get connection string
   - Add to backend env vars

### Option 2: Deploy to VPS (DigitalOcean/AWS)

```bash
# Install Node.js, MongoDB, Nginx
# Clone repository
git clone <your-repo>

# Backend
cd backend
npm install
npm run seed  # First time only
pm2 start src/server.js --name aptitude-backend

# Frontend
cd frontend
npm install
npm run build
# Serve 'dist' folder with Nginx

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/aptitude
```

### Option 3: Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

---

## 🔍 Pre-Deployment Testing

```bash
# 1. Test backend API
cd backend
npm start
curl http://localhost:5000/api/health

# 2. Test frontend build
cd frontend
npm run build
npm run preview

# 3. Test with production env vars
# Create .env.production files first
NODE_ENV=production npm start
```

---

## 📊 Post-Deployment Verification

- [ ] Backend API responding: `https://your-api.com/api/health`
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Question generation works (admin)
- [ ] Test submission works
- [ ] Leaderboard updates in real-time
- [ ] Dark mode toggle works
- [ ] Mobile responsiveness

---

## 🐛 Common Deployment Issues

### Issue: CORS errors
**Solution:** Update `CORS_ORIGIN` in backend .env

### Issue: API calls fail
**Solution:** Check `VITE_API_URL` in frontend .env

### Issue: WebSocket not connecting
**Solution:** Check `VITE_SOCKET_URL` and ensure WebSocket port is open

### Issue: MongoDB connection fails
**Solution:** Check MongoDB URI, whitelist IP in MongoDB Atlas

### Issue: Build fails
**Solution:** Run `npm install` and check Node version (requires Node 18+)

---

## 🔐 Environment Variable Template

### Backend Production `.env`
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aptitude-test-db
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRY=7d
GEMINI_API_KEY=[your-google-gemini-api-key]
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Production `.env.production`
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

---

## ✅ Final Checklist

- [ ] All environment variables updated
- [ ] JWT secret changed
- [ ] MongoDB connection tested
- [ ] CORS configured correctly
- [ ] Build tested locally
- [ ] No hardcoded URLs remaining
- [ ] Database seeded on production
- [ ] Admin credentials changed/secured
- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] Backup strategy in place

---

## 📞 Support

If you encounter issues during deployment, check:
1. Server logs
2. Browser console
3. Network tab in DevTools
4. Environment variables are set correctly

Good luck with your deployment! 🚀
