const dotenv = require('dotenv')

dotenv.config()

// In production, FRONTEND_URL must be set to your deployed frontend domain (e.g., https://your-frontend.vercel.app)
module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learning_os',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
}
