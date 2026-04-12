const mongoose = require('mongoose')
const { MONGO_URI } = require('./env')

const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2 seconds

async function connectDatabase() {
  let attempt = 0

  while (attempt < RETRY_ATTEMPTS) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
      })

      console.log('✓ MongoDB connection established')
      return
    } catch (error) {
      attempt++

      if (attempt < RETRY_ATTEMPTS) {
        console.warn(
          `MongoDB connection failed (attempt ${attempt}/${RETRY_ATTEMPTS}). Retrying in ${RETRY_DELAY}ms...`,
          error.message,
        )
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      } else {
        throw new Error(`Failed to connect to MongoDB after ${RETRY_ATTEMPTS} attempts: ${error.message}`)
      }
    }
  }
}

function setupConnectionHandlers() {
  mongoose.connection.on('disconnected', () => {
    console.warn('! MongoDB disconnected. API will attempt automatic reconnection.')
  })

  mongoose.connection.on('error', (error) => {
    console.error('! MongoDB error:', error.message)
  })

  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected')
  })
}

module.exports = { connectDatabase, setupConnectionHandlers }
