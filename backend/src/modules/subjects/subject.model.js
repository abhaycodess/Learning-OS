const mongoose = require('mongoose')

const topicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    subtopics: [{ type: String }],
  },
  { _id: false },
)

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    topics: [topicSchema],
  },
  { timestamps: true },
)

// Compound unique index on userId + id to prevent cross-user collisions
subjectSchema.index({ userId: 1, id: 1 }, { unique: true })

const Subject = mongoose.model('Subject', subjectSchema)

module.exports = { Subject }
