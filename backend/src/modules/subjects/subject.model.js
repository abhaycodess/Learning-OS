const mongoose = require('mongoose')

const subtopicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { _id: false },
)

const topicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    subtopics: [subtopicSchema],
  },
  { _id: false },
)

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    emoji: { type: String, default: '📘' },
    coverImage: { type: String, default: '' },
    topics: [topicSchema],
  },
  { timestamps: true },
)

// Compound unique index on userId + id to prevent cross-user collisions
subjectSchema.index({ userId: 1, id: 1 }, { unique: true })

const Subject = mongoose.model('Subject', subjectSchema)

module.exports = { Subject }
