import api from './api'

export async function getAdminPriceLists(
  params = {},
) {
  const response = await api.get(
    '/api/admin/price-lists',
    {
      params,
    },
  )

  return response.data.data
}

export async function getAdminPriceList(
  priceListId,
) {
  const response = await api.get(
    `/api/admin/price-lists/${priceListId}`,
  )

  return response.data.data
}

export async function createAdminPriceList(
  payload,
) {
  const response = await api.post(
    '/api/admin/price-lists',
    payload,
  )

  return response.data
}

export async function updateAdminPriceList(
  priceListId,
  payload,
) {
  const response = await api.patch(
    `/api/admin/price-lists/${priceListId}`,
    payload,
  )

  return response.data
}

export async function updateAdminPriceListStatus(
  priceListId,
  isActive,
) {
  const response = await api.patch(
    `/api/admin/price-lists/${priceListId}/status`,
    {
      is_active: isActive,
    },
  )

  return response.data
}

export async function importAdminPriceList(
  priceListId,
  file,
) {
  const formData = new FormData()

  formData.append(
    'file',
    file,
  )

  const response = await api.post(
    `/api/admin/price-lists/${priceListId}/import`,
    formData,
  )

  return response.data
}