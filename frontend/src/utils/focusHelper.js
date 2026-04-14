import { getGuestData, saveGuestData } from './guestStorage.js'
import {
  startGuestSession,
  pauseGuestSession,
  resumeGuestSession,
  stopGuestSession,
  clearGuestSession,
  getGuestElapsed
} from './guestFocus.js'

// Simple hooks/wrappers for focus logic that delegates to correct storage
export function getActiveSession(isAuthenticated, authState) {
  if (isAuthenticated) {
    return authState.activeSession
  }
  return getGuestData().activeSession
}

export function startSessionAdapter(isAuthenticated, authState, authStart, title, subjectName, durationMin) {
  if (isAuthenticated) {
    // We create a task locally using auth API if not exists?
    // Wait, FocusPage usually expects a task. For Quick Start, we need to handle it.
    // We'll expose a quick start that auth handles directly in FocusPage.
    return null;
  } else {
    return startGuestSession(title, subjectName, durationMin)
  }
}
