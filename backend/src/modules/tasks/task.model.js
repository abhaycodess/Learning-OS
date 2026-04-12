const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['Study', 'Revision', 'Test'],
      default: 'Study',
    },
    subjectId: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Compound unique index on userId + id to prevent cross-user collisions
taskSchema.index({ userId: 1, id: 1 }, { unique: true })

const Task = mongoose.model('Task', taskSchema)

module.exports = { Task }
