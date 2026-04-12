const mongoose = require('mongoose')

const insightItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    actionLabel: { type: String, default: 'Apply now', trim: true },
  },
  { _id: false },
)

const insightCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    insights: {
      type: [insightItemSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false },
)

const InsightCache = mongoose.model('InsightCache', insightCacheSchema)

module.exports = { InsightCache }