const mongoose = require('mongoose')

const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      // Format: YYYY-MM-DD
    },
    plannedMinutes: {
      type: Number,
      default: 0,
    },
    actualMinutes: {
      type: Number,
      default: 0,
    },
    sessionsCount: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
      // true if actualMinutes >= plannedMinutes
    },
    started: {
      type: Boolean,
      default: false,
      // true if at least one session was started today
    },
    verdict: {
      type: String,
      default: '',
      // Generated feedback text
    },
    graceDayUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Unique index on userId + dateKey
dailyLogSchema.index({ userId: 1, dateKey: 1 }, { unique: true })

const DailyLog = mongoose.model('DailyLog', dailyLogSchema)

module.exports = { DailyLog }
