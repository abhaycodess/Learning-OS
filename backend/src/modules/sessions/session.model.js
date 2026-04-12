const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    taskId: { type: String, required: true },
    subjectId: { type: String, required: true },
    taskTitle: { type: String, default: '' },
    taskType: { type: String, default: 'Study' },
    taskCompleted: { type: Boolean, default: false },
    subjectName: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'quick-focus'], default: 'manual' },
    plannedDurationSec: { type: Number, default: 1500 },
    lapCount: { type: Number, default: 0 },
    laps: [
      {
        _id: false,
        lapIndex: { type: Number, required: true },
        lapSec: { type: Number, required: true },
        deltaSec: { type: Number, required: true },
        recordedAt: { type: Date, required: true },
      },
    ],
    durationSec: { type: Number, required: true },
    dateKey: { type: String, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    summary: { type: String, default: '' },
    reflection: {
      _id: false,
      focusScore: { type: Number, min: 1, max: 5 },
      completionNote: { type: String, default: '' },
      distractions: [{ type: String }],
      completedAt: { type: Date },
    },
  },
  { timestamps: true },
)

// Compound unique index on userId + id to prevent cross-user collisions
sessionSchema.index({ userId: 1, id: 1 }, { unique: true })

const Session = mongoose.model('Session', sessionSchema)

module.exports = { Session }
