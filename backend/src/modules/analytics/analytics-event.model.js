const mongoose = require('mongoose')

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventType: {
      type: String,
      enum: ['nudge_impression', 'nudge_dismiss', 'nudge_cta_click'],
      required: true,
      index: true,
    },
    experimentKey: { type: String, default: 'nudge_copy_v1', index: true },
    variant: { type: String, enum: ['A', 'B'], required: true, index: true },
    nudgeKey: { type: String, required: true },
    context: { type: String, default: 'dashboard' },
    severity: { type: String, default: 'soft' },
    occurredAt: { type: Date, default: Date.now, index: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
)

analyticsEventSchema.index({ userId: 1, experimentKey: 1, variant: 1, occurredAt: -1 })

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema)

module.exports = { AnalyticsEvent }
