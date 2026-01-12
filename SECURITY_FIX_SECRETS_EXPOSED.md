# 🔐 CRITICAL: Secret Keys Exposure Fix

## ⚠️ YOUR SECRETS HAVE BEEN EXPOSED ON GITHUB!

Your `.env` file has been committed to GitHub containing:
- MongoDB password
- JWT Secret
- Google Gemini API Key

## 🚨 IMMEDIATE ACTIONS REQUIRED:

### 1. **Rotate All Secrets** (DO THIS NOW!)

```bash
# MongoDB
- Change password for your MongoDB cluster
- Update connection string in Render

# JWT Secret
- Generate new secret: openssl rand -base64 32
- Update in Render environment variables

# Gemini API Key
- Go to https://makersuite.google.com/app/apikey
- Regenerate/delete the exposed key
- Create new key and update in Render
```

### 2. **Update Render Environment Variables**

Go to https://dashboard.render.com → Select Backend Service → Environment

Set these (with NEW values):
```
MONGODB_URI=[NEW connection string with new password]
JWT_SECRET=[NEW secret from openssl]
GEMINI_API_KEY=[NEW API key]
```

### 3. **Fix Local .env File**

Update `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:newpassword@cluster.mongodb.net/aptitude-test-db
JWT_SECRET=[new-secret-from-openssl]
GEMINI_API_KEY=[new-api-key]
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGIN=http://localhost:5173
```

### 4. **Verify .env is in .gitignore**

Check `.gitignore`:
```
# Should contain:
.env
.env.local
.env.*.local
```

If `.env` is NOT ignored, run:
```bash
git rm --cached backend/.env
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking (fix security)"
git push origin main
```

### 5. **How to Prevent This**

✅ ALWAYS use `.env.example` for templates:
```env
# backend/.env.example
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
```

✅ NEVER commit actual `.env` files
✅ NEVER put secrets in documentation
✅ Use `.gitignore` to exclude sensitive files

---

## 🔍 Files That Need Cleanup (Already done)

- ✅ RENDER_DEPLOYMENT_GUIDE.md - Secrets removed
- TODO: DEPLOYMENT_CHECKLIST.md - Check for secrets
- TODO: Other markdown files - Check for exposed keys

---

## ⏱️ Timeline to Complete

- [ ] 5 min: Change MongoDB password
- [ ] 5 min: Generate new JWT_SECRET
- [ ] 5 min: Regenerate Gemini API Key
- [ ] 5 min: Update Render environment variables
- [ ] 5 min: Test deployed website
- [ ] DONE: You're secure!

---

**Your website will continue working once you complete step 2!**
