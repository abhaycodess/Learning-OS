const mongoose = require('mongoose')

const conversationMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
)

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: {
      type: [conversationMessageSchema],
      default: [],
    },
    lastSummary: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: true,
    },
  },
)

conversationSchema.index({ userId: 1, updatedAt: -1 })
conversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

const Conversation = mongoose.model('Conversation', conversationSchema)

module.exports = { Conversation }