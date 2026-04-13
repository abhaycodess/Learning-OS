const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { taskRouter } = require('./modules/tasks/task.routes')
const { subjectRouter } = require('./modules/subjects/subject.routes')
const { sessionRouter } = require('./modules/sessions/session.routes')
const { analyticsRouter } = require('./modules/analytics/analytics.routes')
const { snapshotRouter } = require('./modules/snapshot/snapshot.routes')
const { authRouter } = require('./modules/auth/auth.routes')
const { router: behaviorRouter } = require('./modules/behavior/behavior.routes')
const { aiRouter } = require('./modules/ai/ai.routes')
const { requireAuth } = require('./shared/authMiddleware')
const { errorMiddleware } = require('./shared/errorMiddleware')
const { authLimiter, aiLimiter } = require('./shared/rateLimiters')

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: true, // Allow all origins for debugging
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/tasks', requireAuth, taskRouter)
app.use('/api/subjects', requireAuth, subjectRouter)
app.use('/api/sessions', requireAuth, sessionRouter)
app.use('/api/analytics', requireAuth, analyticsRouter)
app.use('/api/snapshot', requireAuth, snapshotRouter)
app.use('/api/behavior', requireAuth, behaviorRouter)
app.use('/api/ai', requireAuth, aiLimiter, aiRouter)


// Serve static frontend assets
const path = require('path');
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Debug log for all incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', req.url);
  next();
});

// Fallback: serve index.html for all non-API routes (React Router support)
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorMiddleware);

module.exports = { app };
