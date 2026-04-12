const mongoose = require('mongoose')

const notificationQueueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['REMINDER', 'MISSED_DAY', 'WEEKLY_SUMMARY'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Index for finding unsent notifications scheduled before now
notificationQueueSchema.index({ sent: 1, scheduledAt: 1 })

const NotificationQueue = mongoose.model('NotificationQueue', notificationQueueSchema)

module.exports = { NotificationQueue }
