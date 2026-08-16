import api from './api'

export async function getMyQuotes(params = {}) {
  const response = await api.get(
    '/api/my/quotes',
    {
      params,
    },
  )

  return response.data
}

export async function getMyQuote(quoteId) {
  const response = await api.get(
    `/api/my/quotes/${quoteId}`,
  )

  return response.data.data
}