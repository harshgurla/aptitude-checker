# Render Deployment Guide - Aptitude Master

Complete step-by-step guide to deploy Aptitude Master on Render (backend + frontend).

## Prerequisites
- GitHub account
- Render account (free at https://render.com)
- MongoDB Atlas account (free tier, https://www.mongodb.com/cloud/atlas)
- Your project pushed to GitHub

---

## PHASE 1: Prepare GitHub Repository

### Step 1: Initialize Git (if not already done)
```bash
cd /home/navgurukul/Desktop/aptitude-master2
git init
git add .
git commit -m "Initial commit - Aptitude Master ready for deployment"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `aptitude-master`
3. Do NOT initialize with README (we already have one)
4. Click "Create repository"

### Step 3: Push Code to GitHub
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/aptitude-master.git
git branch -M main
git push -u origin main
```

---

## PHASE 2: Setup MongoDB Atlas (Free Tier)

### Step 1: Create MongoDB Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Click "Create" → "Build a Database"

### Step 2: Create Database Cluster
1. Select **Shared** (Free tier)
2. Choose your preferred cloud provider (AWS recommended)
3. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Setup Database Access
1. Go to **Security** → **Database Access**
2. Click "Add New Database User"
3. **Username**: `aptitude_admin`
4. **Password**: Generate a strong password (copy it!)
5. **Permissions**: Read and write to any database
6. Click "Add User"

### Step 4: Setup Network Access
1. Go to **Security** → **Network Access**
2. Click "Add IP Address"
3. Click "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get MongoDB Connection String
1. Go to **Database** section
2. Click "Connect" button on your cluster
3. Click "Drivers" (not Compass)
4. Copy the connection string
5. It will look like: `mongodb+srv://aptitude_admin:<password>@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
6. Replace `<password>` with your actual password
7. **Save this - you'll need it for Render**

---

## PHASE 3: Deploy Backend on Render

### Step 1: Create New Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account (first time only)
4. Select the `aptitude-master` repository
5. Click "Connect"

### Step 2: Configure Backend Service
| Field | Value |
|-------|-------|
| **Name** | `aptitude-master-backend` |
| **Environment** | `Node` |
| **Region** | Select closest to you |
| **Branch** | `main` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |

### Step 3: Set Environment Variables
Click "Advanced" → "Add Environment Variable" for each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `[your-mongodb-uri]` |
| `JWT_SECRET` | `[use: openssl rand -base64 32]` |
| `JWT_EXPIRY` | `7d` |
| `GEMINI_API_KEY` | `[your-google-gemini-api-key]` |
| `GEMINI_MODEL` | `gemini-1.5-flash` |
| `CORS_ORIGIN` | `https://your-frontend-url.onrender.com` |

**Note**: Update `CORS_ORIGIN` with your actual frontend URL once you create it.

### Step 4: Deploy
1. Scroll down
2. Click "Create Web Service"
3. Wait for deployment (2-5 minutes)
4. Once deployed, you'll see a URL like: `https://aptitude-master-backend.onrender.com`
5. **Save this URL**

### Step 5: Seed Database
1. Once backend is deployed, go to your backend URL
2. Visit: `https://your-backend-url/api/seed`
3. You should see: `{"message":"Database seeded successfully"}`
4. This creates 31 topics and admin user

---

## PHASE 4: Deploy Frontend on Render

### Step 1: Create Static Site
1. Go to https://render.com
2. Click "New +" → "Static Site"
3. Select `aptitude-master` repository
4. Click "Connect"

### Step 2: Configure Frontend Service
| Field | Value |
|-------|-------|
| **Name** | `aptitude-master-frontend` |
| **Region** | Same as backend |
| **Branch** | `main` |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Publish Directory** | `frontend/dist` |

### Step 3: Set Environment Variable
Click "Advanced" → "Add Environment Variable":

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url` |

**Important**: Replace `your-backend-url` with the actual backend URL from Phase 3 Step 4 (e.g., `https://aptitude-master-backend.onrender.com`)

### Step 4: Deploy
1. Click "Create Static Site"
2. Wait for deployment (2-5 minutes)
3. Once complete, you'll get a URL like: `https://aptitude-master-frontend.onrender.com`

---

## PHASE 5: Update Backend Environment Variable

Now that frontend is deployed, update the backend's CORS origin:

1. Go back to Render dashboard
2. Select "aptitude-master-backend" service
3. Click "Environment"
4. Update `CORS_ORIGIN` to: `https://aptitude-master-frontend.onrender.com`
5. Click "Save"
6. This triggers automatic redeploy (~1 minute)

---

## PHASE 6: Testing & Verification

### Test Backend API
1. Visit: `https://your-backend-url/api/health` (if you have a health check endpoint)
2. Or try login: `POST https://your-backend-url/api/auth/login`

### Test Frontend
1. Visit: `https://your-frontend-url`
2. Test registration with a new account
3. Test login
4. Take a test
5. Check dashboard and leaderboard

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS Error** | Backend CORS_ORIGIN must match frontend URL exactly |
| **Database Connection Error** | Check MongoDB URI includes password and special chars are URL encoded |
| **"Cannot GET /" on Frontend** | Ensure `frontend/dist` is the publish directory |
| **Build fails** | Check `npm install` completes in both build commands |
| **Slow first load** | Render free tier is slower; upgrade to paid for faster performance |

---

## PHASE 7: (Optional) Setup Custom Domain

### Connect Custom Domain to Frontend
1. In Render, go to "aptitude-master-frontend"
2. Click "Settings" → "Custom Domain"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `aptitude.yoursite.com`)
5. Follow DNS instructions for your domain registrar
6. Add CNAME record pointing to Render domain

### Update Backend CORS for Custom Domain
1. Go to backend service environment variables
2. Update `CORS_ORIGIN` to your custom domain
3. Save and redeploy

---

## Deployment Checklist

✅ Code pushed to GitHub
✅ MongoDB Atlas cluster created with user access
✅ Backend deployed on Render with environment variables
✅ Database seeded successfully
✅ Frontend deployed on Render with API_URL variable
✅ Backend CORS_ORIGIN updated with frontend URL
✅ Frontend loads without errors
✅ Can register new account
✅ Can login with account
✅ Can take test
✅ Leaderboard displays correctly
✅ Dark mode works
✅ Stats update after test

---

## Production Environment Variables

### Backend (.env in production)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aptitude-test-db?retryWrites=true&w=majority
JWT_SECRET=[generate-with: openssl rand -base64 32]
JWT_EXPIRY=7d
GEMINI_API_KEY=[your-google-gemini-api-key]
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend (.env in production)
```
VITE_API_URL=https://aptitude-master-backend.onrender.com
```

---

## Monitoring & Support

### View Logs
- **Backend**: Render dashboard → Click service → "Logs" tab
- **Frontend**: Render dashboard → Click service → "Logs" tab

### Restart Service
- Render dashboard → Click service → "Settings" → "Restart"

### Upgrade Plans
- Free tier has limitations (15-min inactivity sleep)
- Upgrade to Starter ($7/month) for 24/7 uptime

---

## Success! 🎉

Your Aptitude Master is now live:
- **Frontend**: `https://aptitude-master-frontend.onrender.com`
- **Backend**: `https://aptitude-master-backend.onrender.com`

Share your deployed application with others!

---

## Troubleshooting Commands (Local)

If you need to test anything locally before deploying:

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run locally
cd ../backend && npm start
# In another terminal:
cd frontend && npm run dev

# Seed database
curl http://localhost:5000/api/seed
```

---

**Need Help?** Check logs in Render dashboard → each service → Logs tab
