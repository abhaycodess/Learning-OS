function errorMiddleware(error, req, res, next) {
  const status = error.status || 500

  if (status >= 500) {
    console.error('Unhandled server error:', error)
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const safeMessage = isProduction && status >= 500 ? 'Internal server error' : error.message || 'Internal server error'

  res.status(status).json({
    message: safeMessage,
  })
}

module.exports = { errorMiddleware }
