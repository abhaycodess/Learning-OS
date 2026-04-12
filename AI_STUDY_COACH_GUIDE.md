# AI Study Coach - Implementation Guide

## Quick Start

### 1. Setup Environment Variables

Add to your `.env` file (choose one provider):

```bash
# Option A: OpenAI (recommended for best quality)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx

# Option B: Google Gemini (free tier available)
GOOGLE_AI_API_KEY=AIza_xxxxxxxxxxxx
```

The backend auto-detects which provider is configured.

### 2. Start the Servers

```bash
# Terminal 1: Backend
cd backend
npm install  # if needed
npm start

# Terminal 2: Frontend
cd frontend
npm install  # if needed
npm run dev
```

### 3. Access AI Features

- **Main Page**: Navigate to `/study-coach` (Brain icon in sidebar, or press `C`)
- **Task Breakdown**: Click Zap icon on any task in Tasks page
- **Chat**: Start asking questions in the Chat tab

---

## Architecture Overview

### Backend Flow

```
POST /api/ai/chat
    ├─ Validate message
    ├─ buildPrompt({ type: 'chat', input: message, context })
    ├─ getAIClient().call(prompt)
    └─ Return { userMessage, aiResponse, provider }
```

### Frontend Flow

```
User clicks "Ask Study Coach"
    ├─ useAIChat hook manages state
    ├─ chatWithCoach(message, context) API call
    ├─ Add user message to history
    ├─ Show loading indicator
    ├─ Add AI response to history
    └─ Auto-scroll to latest message
```

---

## Feature Breakdown

### 1. Chat (Free-form Conversation)

**When to Use**: General questions, concept clarification, motivation

**Request Structure**:
```javascript
{
  message: "Explain photosynthesis in simple terms",
  subject: { title: "Biology", description: "..." },  // Optional
  task: { title: "Read Chapter 5", description: "..." },  // Optional
  userStats: {
    streak: 5,
    todayProgress: 67,
    weakAreas: ["Cellular biology"]  // Optional
  }
}
```

**Response**: Natural language explanation tailored to context

**Backend**: `chatController.js` → `buildChatPrompt()` → temperature 0.7

---

### 2. Summarize (Note Condensing)

**When to Use**: Extract key points from textbooks, lecture notes, articles

**Request Structure**:
```javascript
{
  notes: "Lorem ipsum dolor sit amet...", // The content to summarize
  subject: { title: "Economics" },  // Optional - adds subject context
}
```

**Response**: Bulleted list of key concepts

**Backend**: `summarizeController.js` → `buildSummarizePrompt()` → temperature 0.5

**Output Format**:
- Bullet points for concepts
- Grouped related ideas
- Max 10 points
- Bold important terms

---

### 3. Doubt Solver (Q&A with Depth)

**When to Use**: Answer specific questions, provide examples

**Request Structure**:
```javascript
{
  question: "What's the difference between mitosis and meiosis?",
  mode: "quick",  // or "deep"
  subject: { title: "Biology" }  // Optional
}
```

**Modes**:
- `quick` (2-3 sentences): Direct answer, no fluff
- `deep` (150-250 words): Comprehensive with examples

**Backend Settings**:
- Quick: temp 0.5, max_tokens 800
- Deep: temp 0.7, max_tokens 1500

---

### 4. Task Breakdown (Planning)

**When to Use**: Convert large tasks into actionable steps

**Request Structure**:
```javascript
{
  task: {
    title: "Build a React component library",
    description: "Create reusable UI components..."
  },
  subject: { title: "React Development" }  // Optional
}
```

**Response**: Numbered steps with:
- Step number and description
- Time estimate per step
- Required resources
- Success criteria
- Dependencies between steps

**Backend**: `taskBreakdownController.js` → temperature 0.6

---

## Adding New AI Features

### Template: New AI Mode

1. **Create Controller** (`backend/src/modules/ai/controllers/newController.js`):
```javascript
const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function newFeatureHandler(req, res) {
  const { input, context } = req.body
  
  try {
    const prompt = buildPrompt({
      type: 'new_type',
      input,
      context
    })
    
    const aiClient = getAIClient()
    const response = await aiClient.call({
      prompt,
      temperature: 0.6,
      maxTokens: 1500
    })
    
    res.json({ result: response.content })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { newFeatureHandler }
```

2. **Add Prompt Builder** (`backend/src/modules/ai/services/promptBuilder.js`):
```javascript
function buildNewTypePrompt(input, context = {}) {
  // Build your prompt here
  return `Your prompt here`
}

// In buildPrompt function, add:
case 'new_type':
  return buildNewTypePrompt(input, context)
```

3. **Add Route** (`backend/src/modules/ai/ai.routes.js`):
```javascript
router.post('/new-feature', asyncHandler(newFeatureHandler))
```

4. **Add Frontend Service** (`frontend/src/modules/ai/service.js`):
```javascript
export async function newFeature(input, context = {}) {
  return apiClient('/ai/new-feature', {
    method: 'POST',
    body: JSON.stringify({ input, ...context })
  })
}
```

---

## Context Injection Pattern

All AI calls support optional context injection:

```javascript
const context = {
  subject: {
    title: "Physics",
    description: "Mechanics and thermodynamics"
  },
  task: {
    title: "Complete problem set 3",
    description: "..."
  },
  userStats: {
    streak: 7,
    todayProgress: 45,
    weakAreas: ["Vector calculus", "Thermodynamics"]
  }
}
```

This gets automatically appended to prompts to make responses more relevant.

---

## Response Formatting

Responses are auto-formatted in the UI:

| Pattern | Result |
|---------|--------|
| `1. Item` | Numbered list with styling |
| `- Item` | Bullet point |
| `Header:` | Bold section heading |
| Regular text | Normal paragraph |

---

## Error Handling

### Backend
- Invalid API keys: Error during provider detection (startup fails)
- Network errors: Caught and returned as 500 with message
- Invalid input: 400 with validation error

### Frontend
- API failures: Toast notification "Failed to..." + logged
- Network timeouts: Graceful fallback message
- User input validation: Prevents empty submissions

---

## Performance Tuning

### Temperature Settings (Creativity vs Consistency)
- **0.3-0.5**: Deterministic (summaries, quizzes)
- **0.6-0.7**: Balanced (explanations, chat)
- **0.8+**: Creative (brainstorming, ideas)

### Token Limits (Cost & Speed)
- **500-800**: Quick responses (titles, brief answers)
- **1000-1500**: Standard responses (explanations)
- **2000+**: Long-form (full articles, detailed plans)

### Caching Opportunities
- Common questions (photosynthesis, quadratic formula)
- Subject summaries
- Frequently broken-down tasks

---

## Testing

### Manual Testing Checklist
- [ ] Chat with context (subject, task, stats)
- [ ] Chat without context
- [ ] Summarize various length notes
- [ ] Quick doubt explanation
- [ ] Deep doubt explanation
- [ ] Task breakdown with 5+ steps
- [ ] Error handling (empty input, API failure)
- [ ] Loading state visibility
- [ ] Message history persistence in session
- [ ] Keyboard shortcut (C key) works

### Edge Cases to Test
1. Very long input (>5000 chars)
2. No internet connectivity
3. Invalid API key
4. Concurrent requests
5. Task with no subject
6. Context with missing fields

---

## Security Considerations

1. **API Keys**: Never commit `.env` file
2. **Rate Limiting**: Add per-user limits for production
3. **Input Validation**: All inputs validated on backend
4. **Token Logging**: Don't log full prompts/responses in production
5. **CORS**: Already configured in Express app

---

## Monitoring & Observability

### Logging Points
- AI provider detection on startup
- Each API call (timestamp, type, status)
- Token usage (for cost tracking)
- Errors and fallbacks

Add logging:
```javascript
console.log(`[AI] Chat request from user ${userId}`)
console.log(`[AI] Response using ${provider}, tokens: ${usage}`)
```

---

## Provider Comparison

| Feature | OpenAI (GPT-4T) | Google (Gemini) |
|---------|----|---------|
| Quality | Excellent | Very Good |
| Speed | Fast | Very Fast |
| Cost | $0.01-0.03 per 1K tokens | $0.0001 free tier |
| Context Window | 128K tokens | 1M tokens |
| Best For | Production use | Cost-sensitive |

---

## Future Enhancements

1. **Streaming Responses**: Send tokens as they arrive (better UX for long responses)
2. **History Persistence**: Save conversations to DB
3. **Follow-up Questions**: Use conversation context in subsequent requests
4. **Study Plan Generation**: "Create a weekly schedule for this subject"
5. **Custom Personas**: Different AI tones (mentor, tutor, peer)
6. **Offline Support**: Cache common responses
7. **Voice I/O**: Speak questions, get audio responses

---

## Troubleshooting

### "No AI provider configured"
- Check `.env` file has either `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`
- Restart backend server

### "Failed to process chat"
- Check API key is valid
- Verify internet connection
- Check API provider's status page

### Slow responses
- Check token limits (`maxTokens` setting)
- Try lower temperature for faster response
- Check network latency to API provider

### Response formatting issues
- Ensure response includes `\n` for line breaks
- Check response doesn't exceed expected format
- Test with simple input first

---

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini Docs](https://ai.google.dev)
- [Learning OS Architecture](./APP_STATE_AND_FLOW.md)
