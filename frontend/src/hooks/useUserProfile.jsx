import { useAuth } from './useAuth.jsx'

export function useUserProfile() {
  const { userProfile, getProfile, updateUserProfile, resetUserProfile } = useAuth()

  return {
    userProfile,
    getProfile,
    updateProfile: updateUserProfile,
    saveUserProfile: updateUserProfile,
    resetProfile: resetUserProfile,
  }
}
