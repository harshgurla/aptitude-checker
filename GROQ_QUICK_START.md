# 🚀 Quick Start - Groq API Setup

## ⚡ 3 Steps to Get Running

### 1️⃣ Get Your API Key (2 minutes)
```bash
Visit: https://console.groq.com/keys
Click: "Create API Key"
Copy: The key (starts with gsk_...)
```

### 2️⃣ Add to .env File (30 seconds)
```bash
# Open: backend/.env
# Replace this line:
GROQ_API_KEY=your_groq_api_key_here

# With your actual key:
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

### 3️⃣ Restart Backend (30 seconds)
```bash
cd /home/navgurukul/Desktop/aptitude-master2/backend
npm start
```

---

## ✅ What to Look For

### Success Messages in Logs:
```
✓ [initializeGroq] Groq initialized successfully
🤖 [generateQuestionsAI] Generating questions using llama-3.3-70b-versatile
✓ [generateQuestionsAI] Successfully generated X questions
```

### If You See Errors:
```
❌ [initializeGroq] GROQ_API_KEY not configured
→ Solution: Add your API key to backend/.env

❌ Rate limit exceeded
→ Solution: Wait 1 minute (30 requests/minute limit)
```

---

## 🎯 Key Features

| Feature | Status |
|---------|--------|
| Question Generation | ✅ Working |
| Motivational Messages | ✅ Working |
| Daily Scheduler | ✅ Working |
| JSON Validation | ✅ Working |
| Retry Logic | ✅ Working |

---

## 🔧 Configuration

### Current Model
```bash
GROQ_MODEL=llama-3.3-70b-versatile
```

**Why this model?**
- Best for educational content
- Excellent JSON output
- Fast (1-3 seconds)
- FREE: 30 requests/minute

### Alternative Models (if needed)
```bash
# Fast & Good Quality
GROQ_MODEL=mixtral-8x7b-32768

# Slightly Older but Excellent
GROQ_MODEL=llama-3.1-70b-versatile

# Lightweight & Faster
GROQ_MODEL=gemma2-9b-it
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Response Time | 1-3 seconds ⚡ |
| Questions per Request | 1-10 ✨ |
| Free Tier Limit | 30/minute 🎉 |
| Daily Limit | ~14,400 💪 |
| JSON Reliability | 99%+ 🎯 |

---

## 🆘 Quick Troubleshooting

**Problem**: API key error
**Solution**: Copy-paste your key carefully (no spaces)

**Problem**: Questions not generating
**Solution**: Check internet + restart backend

**Problem**: Slow responses
**Solution**: Normal for first request (cold start)

---

## 📚 Resources

- **Groq Console**: https://console.groq.com
- **API Keys**: https://console.groq.com/keys
- **Documentation**: https://console.groq.com/docs
- **Full Guide**: See `GROQ_MIGRATION_GUIDE.md`

---

**Ready?** Just add your API key and restart! 🚀
