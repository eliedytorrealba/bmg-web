import api from './api'

export async function getProducts(params = {}) {
  const response = await api.get('/api/products', {
    params,
  })

  return response.data
}

export async function getProduct(productId) {
  const response = await api.get(
    `/api/products/${productId}`,
  )

  return response.data.data
}

export async function getCatalogFilters() {
  const response = await api.get(
    '/api/catalog/filters',
  )

  return response.data.data
}