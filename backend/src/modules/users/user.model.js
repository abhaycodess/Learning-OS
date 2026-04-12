const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const GOAL_OPTIONS = ['crack-exam', 'improve-concepts', 'learn-skills', 'stay-consistent']
const STUDY_PREFERENCE_OPTIONS = ['videos', 'notes', 'practice', 'mixed']
const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced']
const PREFERRED_STUDY_TIME_OPTIONS = ['morning', 'afternoon', 'night']
const PAIN_POINT_OPTIONS = [
  'Procrastination',
  'Distractions',
  'Lack of clarity',
  'Inconsistency',
  'Exam anxiety',
]

const userProfileSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['school', 'college', ''],
      default: '',
    },
    goal: {
      type: [String],
      enum: GOAL_OPTIONS,
      default: [],
    },
    subjects: {
      type: [String],
      default: [],
    },
    studyPreference: {
      type: [String],
      enum: STUDY_PREFERENCE_OPTIONS,
      default: [],
    },
    level: {
      type: String,
      enum: LEVEL_OPTIONS,
      default: 'beginner',
    },
    dailyGoal: {
      type: String,
      default: '',
      trim: true,
    },
    preferredStudyTime: {
      type: String,
      enum: [...PREFERRED_STUDY_TIME_OPTIONS, ''],
      default: '',
    },
    painPoints: {
      type: [String],
      enum: PAIN_POINT_OPTIONS,
      default: [],
    },
    remindersEnabled: {
      type: Boolean,
      default: false,
    },
    streakEnabled: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    onboardingCompleted: {
      type: Boolean,
      default: true,
    },
    profile: {
      type: userProfileSchema,
      default: () => ({}),
    },
    behavior: {
      type: {
        dailyTargetMinutes: {
          type: Number,
          default: 60,
        },
        lastActiveDate: {
          type: String,
          default: null,
        },
        streakCount: {
          type: Number,
          default: 0,
        },
        lastStreakDate: {
          type: String,
          default: null,
        },
        missedDays: {
          type: Number,
          default: 0,
        },
        totalActiveDays: {
          type: Number,
          default: 0,
        },
        graceDayUsedWeek: {
          type: String,
          default: null,
        },
        graceDayLastUsedDate: {
          type: String,
          default: null,
        },
      },
      default: () => ({}),
    },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
