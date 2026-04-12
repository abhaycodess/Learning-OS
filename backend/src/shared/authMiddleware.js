const jwt = require('jsonwebtoken')
const User = require('../modules/users/user.model')

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).lean()

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    req.user = user
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = { requireAuth }