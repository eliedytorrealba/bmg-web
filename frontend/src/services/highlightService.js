import api from './api'

export async function getHighlights() {
  const response = await api.get(
    '/api/highlights',
  )

  return Array.isArray(response.data.data)
    ? response.data.data
    : []
}