import { apiClient } from './apiClient.js'

export const learningService = {
  getSnapshot: () => apiClient('/snapshot'),
  createSubject: (payload) =>
    apiClient('/subjects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSubject: (id, payload) =>
    apiClient(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteSubject: (id) =>
    apiClient(`/subjects/${id}`, {
      method: 'DELETE',
    }),
  createTask: (payload) =>
    apiClient('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTask: (id, payload) =>
    apiClient(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTask: (id) =>
    apiClient(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  createSession: (payload) =>
    apiClient('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSessionReflection: (id, payload) =>
    apiClient(`/sessions/${id}/reflection`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}
