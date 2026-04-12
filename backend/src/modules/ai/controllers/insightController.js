const { generateInsights } = require('../services/insightEngine')

async function insightHandler(req, res) {
  const userId = req.user?._id || req.user?.id
  if (!userId) {
    return res.status(401).json({ message: 'User context missing from token' })
  }

  try {
    const insights = await generateInsights(userId)
    return res.json({ insights })
  } catch (error) {
    console.error('Insight handler error:', error.message)
    return res.status(500).json({
      message: 'Failed to generate insights',
      insights: [],
    })
  }
}

module.exports = {
  insightHandler,
}