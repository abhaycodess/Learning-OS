# 🚀 AI Study Coach - Quick Reference

## ⚡ 5-Minute Setup

### 1. Add API Key
Edit `backend/.env` and add ONE of:
```bash
# Option A (Recommended)
OPENAI_API_KEY=sk-proj-xxxx...

# Option B (Free tier available) 
GOOGLE_AI_API_KEY=AIza...
```

### 2. Restart Backend
```bash
cd backend
npm start
```

### 3. Access Features
- **Main Page**: Press `C` or click Brain icon
- **Task Breakdown**: Click ⚡ (Zap) on any task

---

## 🎯 Core Features at a Glance

| Feature | Location | Use Case | Time |
|---------|----------|----------|------|
| **Chat** | `/study-coach` → Chat tab | Ask questions | <2s |
| **Summarize** | `/study-coach` → Summarize tab | Condense notes | 1-3s |
| **Doubt Solver** | `/study-coach` → Ask tab | Get explanations | 1-4s |
| **Task Breakdown** | Tasks page → ⚡ button | Plan steps | 2-4s |

---

## 📍 Navigation

```
Sidebar (Brain icon) or Press C
         ↓
/study-coach
  ├─ Chat Tab      (conversation)
  ├─ Summarize Tab (notes)
  └─ Doubt Tab     (questions)

Tasks Page
  └─ ⚡ Button on any task (breakdown)
```

---

## 💬 Example Conversations

### Chat Tab
```
"Explain quantum entanglement in 2 minutes"
↓
🤖 Clear, concise explanation with example
```

### Summarize Tab
```
[Paste 500 lines of notes]
↓
Click "Summarize Notes"
↓
🤖 5-7 key bullet points
```

### Doubt Solver
```
Question: "Why does photosynthesis need light?"
Mode: Quick
↓
🤖 One-sentence answer

Question: "Why does photosynthesis need light?"
Mode: Deep
↓
🤖 Detailed explanation with mechanism
```

### Task Breakdown (from Tasks page)
```
Task: "Learn machine learning"
Click ⚡
↓
Modal opens with:
1. Set up Python environment (30 min)
2. Learn NumPy basics (2 hours)
3. Study linear algebra (3 hours)
... etc
```

---

## ⚙️ Architecture at a Glance

```
Frontend                Backend               AI Provider
--------                -------               -----------
StudyCoachPage    →    POST /api/ai/chat     →  OpenAI GPT-4
(Chat Tab)             ↓                         OR
                     Prompt Builder          Google Gemini
useAIChat Hook    →    ↓
(State Mgmt)         AI Client
                  →  API Call
AIChatPanel     ←    Response
(UI)             ←    Format & Return
```

---

## 🔧 File Locations

### Backend
```
backend/src/modules/ai/
├── services/
│   ├── aiClient.js       (API calls)
│   └── promptBuilder.js  (Prompt crafting)
├── controllers/
│   ├── chatController.js
│   ├── summarizeController.js
│   ├── doubtController.js
│   └── taskBreakdownController.js
└── ai.routes.js          (Endpoints)
```

### Frontend
```
frontend/src/modules/ai/
├── StudyCoachPage.jsx    (Main page)
├── service.js            (API layer)
├── components/
│   ├── AIChatPanel.jsx   (Chat UI)
├── hooks/
│   └── useAIChat.js      (State)
└── (TaskBreakdownModal.jsx in tasks/)
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No AI provider configured" | Add API key to .env and restart backend |
| "Failed to process chat" | Check API key validity, restart backend |
| Empty response | Try shorter input first |
| Slow response | Check internet, try Gemini instead of OpenAI |
| Button not showing | Refresh browser, check console for errors |

---

## 📊 API Response Examples

### POST /api/ai/chat
```json
{
  "userMessage": "What is photosynthesis?",
  "aiResponse": "Photosynthesis is the process...",
  "provider": "openai"
}
```

### POST /api/ai/summarize
```json
{
  "originalLength": 2847,
  "summary": "• Key point 1\n• Key point 2\n...",
  "provider": "google"
}
```

### POST /api/ai/doubt
```json
{
  "question": "Why is it important?",
  "mode": "deep",
  "explanation": "This is important because...",
  "provider": "openai"
}
```

### POST /api/ai/task-breakdown
```json
{
  "taskTitle": "Learn React",
  "breakdown": "1. Setup environment (1 hour)\n2. Learn JSX (2 hours)\n...",
  "provider": "google"
}
```

---

## 🎓 Best Practices

### For Students
- ❌ Copy all answers directly
- ✅ Use AI to understand, then solve yourself
- ❌ Ask vague questions
- ✅ Be specific ("Explain mitosis" vs "What is mitosis")
- ❌ Rely on Quick mode only
- ✅ Use Deep mode for complex topics

### For Developers
- ❌ Hardcode API keys
- ✅ Use environment variables
- ❌ Log sensitive data
- ✅ Log only non-sensitive metrics
- ❌ Ignore error messages
- ✅ Implement graceful fallbacks

---

## 📈 Feature Matrix

|Feature|Browser|Mobile|Desktop|Offline|
|---|---|---|---|---|
|Chat|✅|✅|✅|❌|
|Summarize|✅|✅|✅|❌|
|Doubt|✅|✅|✅|❌|
|Breakdown|✅|⚠️|✅|❌|

(⚠️ = Works but modal needs responsiveness optimization)

---

## 🔐 Security Checklist

- [ ] API key in .env (not in code)
- [ ] .env added to .gitignore
- [ ] No auth token logging
- [ ] Input validation active
- [ ] CORS properly configured
- [ ] Rate limiting considered

---

## 📞 Quick Help

**Q: Which AI provider should I use?**
A: OpenAI for best quality, Google for speed/cost. Both work equally well.

**Q: Can I switch providers?**
A: Yes! Just change the API key in .env and restart. Backend auto-detects.

**Q: Will API calls count against my usage?**
A: Yes. OpenAI charges ~$0.01-0.03 per prompt. Google offers free tier.

**Q: Can students interact with history?**
A: Yes, within the session. Refresh clears history (by design).

**Q: How long should I wait for response?**
A: Usually <2s. If >5s, check internet or try again.

---

## 🚀 Next Level

### To Add Your Own AI Feature
1. Copy `chatController.js` as template
2. Create new prompt in `promptBuilder.js`
3. Add route in `ai.routes.js`
4. Add frontend service function
5. Create UI component
6. Test with curl/Postman first

### To Monitor Usage
```javascript
// Add to any controller:
console.log(`[AI] ${type} request from ${userId}`)
console.log(`[AI] Used ${tokens} tokens, ${provider}`)
```

### To Add Rate Limiting
```javascript
// Use express-rate-limit:
npm install express-rate-limit
// Add middleware to routes
```

---

**Version**: 1.0
**Ready**: Production ✅
**Questions**: See AI_STUDY_COACH_GUIDE.md or APP_STATE_AND_FLOW.md
