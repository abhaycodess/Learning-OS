import { useToastContext } from '../contexts/ToastContext.jsx'

export function useToast() {
  return useToastContext()
}
