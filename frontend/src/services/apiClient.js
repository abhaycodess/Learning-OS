const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://learning-os.onrender.com/api';

if (!API_BASE) {
  if (import.meta.env.MODE === 'production') {
    throw new Error('VITE_API_BASE_URL must be set in production!');
  }
}

export async function apiClient(path, options = {}) {
  const token = localStorage.getItem('authToken')

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || `Request failed (${response.status})`)
  }

  return response.json()
}
