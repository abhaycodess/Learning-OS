const { rateLimit } = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Please try again later.' },
})

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please try again later.' },
})

module.exports = {
  authLimiter,
  aiLimiter,
}
