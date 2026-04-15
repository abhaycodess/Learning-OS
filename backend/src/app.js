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
// Trust proxy for Render (critical for cookies, HTTPS, rate limiting)
app.set('trust proxy', 1);

app.use(helmet())


// Secure CORS for production, flexible for dev, and safe error handling
// Update this list for your deployed frontend domain in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // e.g., https://your-frontend.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('Blocked by CORS:', origin);
        callback(null, false); // safer, does not throw
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }))

// Log ALL incoming requests (including /api)
app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.url);
  next();
});


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





// Serve static frontend assets and React fallback ONLY if build exists
const path = require('path');
const fs = require('fs');
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  console.warn('⚠️ Frontend build not found. Skipping static serving.');
}

app.use(errorMiddleware);

module.exports = { app };
