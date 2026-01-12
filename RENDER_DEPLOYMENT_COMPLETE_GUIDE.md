# Render Deployment Configuration Guide

## Frontend (Static Site)

### Build Settings
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Auto-Deploy**: Yes

### Environment Variables
None required for frontend (API URL is configured via Vite)

### Important Files
- `frontend/public/_redirects` - Handles client-side routing
- `frontend/vercel.json` - Alternative platform support
- `frontend/render.yaml` - Render-specific configuration

## Backend (Web Service)

### Build Settings
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node 18+

### Required Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=7d
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGIN=your-frontend-url
```

### Getting API Keys

#### MongoDB Atlas (Free Tier)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (M0 Free tier)
4. Get connection string from "Connect" → "Connect your application"
5. Replace `<password>` with your database user password
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

#### Google Gemini API (Free Tier)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Free tier includes 60 requests per minute

## Deployment Steps

### 1. Deploy Backend First
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set Root Directory: `backend`
4. Add all environment variables
5. Deploy

### 2. Deploy Frontend
1. Create new Static Site on Render
2. Connect same GitHub repository
3. Set Build Command and Publish Directory
4. Add Environment Variable:
   - `VITE_API_URL=your-backend-url`
5. Deploy

### 3. Update CORS Origin
1. Go to backend service settings
2. Update `CORS_ORIGIN` environment variable with your frontend URL
3. Redeploy backend

## Performance Optimizations Applied

### Database
- ✅ Connection pooling (50 max, 10 min connections)
- ✅ Automatic reconnection
- ✅ 60s idle timeout
- ✅ Optimized query indexes

### API
- ✅ Rate limiting (100 req/15min general)
- ✅ Auth rate limiting (10 req/15min)
- ✅ AI generation rate limiting (5 req/hour)
- ✅ Response compression
- ✅ Request size limits (10MB)

### WebSocket
- ✅ Optimized transport settings
- ✅ Ping/pong keepalive (25s interval)
- ✅ Message compression
- ✅ 1MB buffer size limit

### Frontend
- ✅ React Query caching (5min stale time)
- ✅ Code splitting via React Router
- ✅ Optimized bundle size
- ✅ Error boundaries
- ✅ Asset caching

## Handling 100+ Concurrent Users

The application is optimized for:
- ✅ 100+ simultaneous active users
- ✅ 50 concurrent database connections
- ✅ WebSocket connections for real-time updates
- ✅ Efficient AI question generation with retry logic
- ✅ Rate limiting to prevent abuse

## Troubleshooting

### Issue: 404 on page refresh
**Solution**: Verify `_redirects` file exists in `frontend/public/` with content:
```
/*    /index.html   200
```

### Issue: API calls failing
**Solution**: 
1. Check `VITE_API_URL` in frontend deployment
2. Check `CORS_ORIGIN` in backend deployment
3. Verify backend is deployed and running

### Issue: AI generation failing
**Solution**:
1. Verify `GEMINI_API_KEY` is set correctly
2. Check Gemini API quota (60 req/min free tier)
3. Review backend logs for specific error messages

### Issue: MongoDB connection errors
**Solution**:
1. Whitelist Render IP addresses in MongoDB Atlas
2. Or use "Allow access from anywhere" (0.0.0.0/0) in Network Access
3. Verify connection string format

## Monitoring

### Check Backend Health
```
GET https://your-backend-url/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T..."
}
```

### Check Frontend
Visit your frontend URL - should load homepage

### Check WebSocket
Open browser console → Network → WS tab
Should show connected websocket

## Scaling Considerations

For more than 100 users:
1. Upgrade MongoDB cluster tier
2. Increase backend instance size
3. Add Redis for session management
4. Consider CDN for frontend assets
5. Implement database read replicas

## Security Features

- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ SQL injection protection (Mongoose)

## Cost Estimate (Free Tier)

- MongoDB Atlas: Free (M0 - 512MB)
- Render Backend: Free (750 hrs/month)
- Render Frontend: Free (100GB bandwidth)
- Google Gemini: Free (60 req/min)

**Total: $0/month** for up to ~100 students

## Need Help?

Check the logs:
- Render Dashboard → Your Service → Logs
- Browser Console → Network/Console tabs
- MongoDB Atlas → Metrics

Common error patterns and solutions are documented in DEPLOYMENT_CHECKLIST.md
