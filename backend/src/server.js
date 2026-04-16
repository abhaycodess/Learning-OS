const { app } = require('./app')
const { PORT } = require('./config/env')
const { connectDatabase, setupConnectionHandlers } = require('./config/db')

function assertRequiredEnv() {
  const required = ['JWT_SECRET', 'MONGO_URI']
  const missing = required.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

async function bootstrap() {
  try {
    assertRequiredEnv()

    // Setup connection event handlers before connecting
    setupConnectionHandlers()

    // Connect to database with retry logic
    await connectDatabase()

    // Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Learning OS API listening on port ${PORT}`)
    })

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down gracefully...')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

bootstrap()
