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

export async function getAdminQuotes(params = {}) {
  const response = await api.get(
    '/api/quotes',
    {
      params,
    },
  )

  return response.data
}

export async function getAdminQuote(quoteId) {
  const response = await api.get(
    `/api/quotes/${quoteId}`,
  )

  return response.data.data
}

export async function updateQuoteStatus(
  quoteId,
  status,
) {
  const response = await api.patch(
    `/api/quotes/${quoteId}/status`,
    {
      status,
    },
  )

  return response.data
}

export async function updateQuoteFinalTotal(
  quoteId,
  finalTotal,
) {
  const response = await api.patch(
    `/api/quotes/${quoteId}/final-total`,
    {
      final_total: finalTotal,
    },
  )

  return response.data
}