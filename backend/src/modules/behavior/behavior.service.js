const User = require('../users/user.model')
const { DailyLog } = require('./dailylog.model')
const { NotificationQueue } = require('./notification.model')

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10)
}

function getYesterdayDateKey() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().slice(0, 10)
}

function toDateFromKey(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`)
}

function getWeekKeyFromDateKey(dateKey) {
  const baseDate = toDateFromKey(dateKey)
  const utcDay = baseDate.getUTCDay() || 7
  baseDate.setUTCDate(baseDate.getUTCDate() + 4 - utcDay)
  const yearStart = new Date(Date.UTC(baseDate.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((baseDate - yearStart) / 86400000) + 1) / 7)
  return `${baseDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function dayDiff(fromDateKey, toDateKey) {
  const from = toDateFromKey(fromDateKey)
  const to = toDateFromKey(toDateKey)
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

function hasGraceDayAvailable(user, dateKey) {
  const weekKey = getWeekKeyFromDateKey(dateKey)
  return user.behavior?.graceDayUsedWeek !== weekKey
}

async function setDailyContract(userId, dailyTargetMinutes) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        'behavior.dailyTargetMinutes': dailyTargetMinutes,
      },
    },
    { new: true },
  )
  return user
}

async function logSessionImpact(userId, durationSec) {
  const dateKey = getTodayDateKey()
  const durationMinutes = Math.round(durationSec / 60)

  let dailyLog = await DailyLog.findOne({ userId, dateKey })

  if (!dailyLog) {
    dailyLog = new DailyLog({
      userId,
      dateKey,
      plannedMinutes: 0,
      actualMinutes: durationMinutes,
      sessionsCount: 1,
      started: true,
      completed: false,
      verdict: '',
      graceDayUsed: false,
    })
  } else {
    dailyLog.actualMinutes += durationMinutes
    dailyLog.sessionsCount += 1
    dailyLog.started = true
    dailyLog.graceDayUsed = false
  }

  await dailyLog.save()
  return dailyLog
}

async function evaluateDailyLog(userId, dateKey = null) {
  const resolvedDateKey = dateKey || getTodayDateKey()

  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  let dailyLog = await DailyLog.findOne({ userId, dateKey: resolvedDateKey })

  if (!dailyLog) {
    dailyLog = new DailyLog({
      userId,
      dateKey: resolvedDateKey,
      plannedMinutes: user.behavior?.dailyTargetMinutes || 60,
      actualMinutes: 0,
      sessionsCount: 0,
      started: false,
      completed: false,
      verdict: "You didn't show up today.",
      graceDayUsed: false,
    })
  } else {
    dailyLog.plannedMinutes = user.behavior?.dailyTargetMinutes || 60

    if (dailyLog.actualMinutes >= dailyLog.plannedMinutes) {
      dailyLog.completed = true
      dailyLog.verdict = 'You did what you said. Good.'
      dailyLog.graceDayUsed = false
    } else if (dailyLog.sessionsCount === 0) {
      dailyLog.completed = false
      dailyLog.verdict = "You didn't show up today."
    } else {
      dailyLog.completed = false
      dailyLog.verdict = `You planned ${dailyLog.plannedMinutes}. You did ${dailyLog.actualMinutes}. Keep going tomorrow.`
      dailyLog.graceDayUsed = false
    }
  }

  const updates = {
    $set: {},
  }

  if (dailyLog.started) {
    const previousStreakDate = user.behavior?.lastStreakDate

    if (!previousStreakDate) {
      updates.$set['behavior.streakCount'] = 1
    } else {
      const streakDiff = dayDiff(previousStreakDate, resolvedDateKey)
      if (streakDiff === 1) {
        updates.$set['behavior.streakCount'] = (user.behavior?.streakCount || 0) + 1
      } else if (streakDiff > 1) {
        updates.$set['behavior.streakCount'] = 1
      }
    }

    updates.$set['behavior.lastStreakDate'] = resolvedDateKey
    updates.$set['behavior.lastActiveDate'] = resolvedDateKey

    if (user.behavior?.lastActiveDate !== resolvedDateKey) {
      updates.$inc = updates.$inc || {}
      updates.$inc['behavior.totalActiveDays'] = 1
    }

    dailyLog.graceDayUsed = false
  } else {
    const graceAvailable = hasGraceDayAvailable(user, resolvedDateKey)

    if (graceAvailable) {
      const weekKey = getWeekKeyFromDateKey(resolvedDateKey)
      updates.$set['behavior.graceDayUsedWeek'] = weekKey
      updates.$set['behavior.graceDayLastUsedDate'] = resolvedDateKey
      dailyLog.graceDayUsed = true
      dailyLog.verdict = 'You used your grace day. Stay consistent.'
    } else {
      updates.$inc = updates.$inc || {}
      updates.$inc['behavior.missedDays'] = 1
      updates.$set['behavior.streakCount'] = 0
      dailyLog.graceDayUsed = false
    }
  }

  await dailyLog.save()

  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true })
  await queueNotifications(userId, dailyLog, updatedUser)

  return {
    dailyLog,
    user: updatedUser,
  }
}

async function queueNotifications(userId, dailyLog, user) {
  const currentTime = new Date()

  if (!dailyLog.started && !dailyLog.graceDayUsed && dailyLog.verdict === "You didn't show up today.") {
    const existingNotif = await NotificationQueue.findOne({
      userId,
      type: 'MISSED_DAY',
      dateKey: dailyLog.dateKey,
    })

    if (!existingNotif) {
      await NotificationQueue.create({
        userId,
        type: 'MISSED_DAY',
        message: `You skipped ${dailyLog.dateKey}. Let's get back on track today.`,
        scheduledAt: currentTime,
        sent: false,
      })
    }
  }

  const eveningTime = new Date()
  eveningTime.setHours(18, 0, 0, 0)

  if (currentTime < eveningTime && !dailyLog.started) {
    const existingReminder = await NotificationQueue.findOne({
      userId,
      type: 'REMINDER',
      createdAt: {
        $gte: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000),
      },
    })

    if (!existingReminder) {
      await NotificationQueue.create({
        userId,
        type: 'REMINDER',
        message: `You have ${user.behavior?.dailyTargetMinutes || 60} minutes to study today. Start now and build your streak.`,
        scheduledAt: eveningTime,
        sent: false,
      })
    }
  }
}

async function getTodayBehaviorStatus(userId) {
  const dateKey = getTodayDateKey()
  const user = await User.findById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  let dailyLog = await DailyLog.findOne({ userId, dateKey })

  if (!dailyLog) {
    dailyLog = {
      userId,
      dateKey,
      plannedMinutes: user.behavior?.dailyTargetMinutes || 60,
      actualMinutes: 0,
      sessionsCount: 0,
      completed: false,
      started: false,
      verdict: '',
      graceDayUsed: false,
    }
  }

  let status = 'not-started'
  if (dailyLog.started && !dailyLog.completed) {
    status = 'in-progress'
  } else if (dailyLog.completed) {
    status = 'completed'
  }

  const yesterdayKey = getYesterdayDateKey()
  const yesterdayLog = await DailyLog.findOne({
    userId,
    dateKey: yesterdayKey,
  })

  const missedYesterday = Boolean(yesterdayLog && !yesterdayLog.started && !yesterdayLog.graceDayUsed)
  const graceDayUsedYesterday = Boolean(yesterdayLog?.graceDayUsed)

  return {
    dailyLog,
    behavior: user.behavior,
    status,
    missedYesterday,
    graceDayUsedYesterday,
    graceDayAvailable: hasGraceDayAvailable(user, dateKey),
    targetMinutes: user.behavior?.dailyTargetMinutes || 60,
    streakCount: user.behavior?.streakCount || 0,
  }
}

async function getStreakStatus(userId) {
  const user = await User.findById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  return {
    streakCount: user.behavior?.streakCount || 0,
    lastStreakDate: user.behavior?.lastStreakDate || null,
    lastActiveDate: user.behavior?.lastActiveDate || null,
    missedDays: user.behavior?.missedDays || 0,
    totalActiveDays: user.behavior?.totalActiveDays || 0,
    graceDayUsedWeek: user.behavior?.graceDayUsedWeek || null,
    graceDayLastUsedDate: user.behavior?.graceDayLastUsedDate || null,
  }
}

async function getDailySummary(userId, dateKey = null) {
  const resolvedDateKey = dateKey || getYesterdayDateKey()
  const { dailyLog } = await evaluateDailyLog(userId, resolvedDateKey)

  let verdictType = 'partial'
  if (dailyLog.completed) verdictType = 'completed'
  if (!dailyLog.started && !dailyLog.graceDayUsed) verdictType = 'missed'
  if (dailyLog.graceDayUsed) verdictType = 'grace'

  return {
    dateKey: resolvedDateKey,
    plannedMinutes: dailyLog.plannedMinutes || 0,
    actualMinutes: dailyLog.actualMinutes || 0,
    sessionsCount: dailyLog.sessionsCount || 0,
    verdict: dailyLog.verdict || '',
    verdictType,
    graceDayUsed: Boolean(dailyLog.graceDayUsed),
  }
}

module.exports = {
  getTodayDateKey,
  getYesterdayDateKey,
  setDailyContract,
  logSessionImpact,
  evaluateDailyLog,
  queueNotifications,
  getTodayBehaviorStatus,
  getStreakStatus,
  getDailySummary,
}
