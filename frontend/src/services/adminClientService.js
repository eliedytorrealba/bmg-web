import api from './api'

export async function getAdminClients(
  params = {},
) {
  const response = await api.get(
    '/api/admin/clients',
    {
      params,
    },
  )

  return response.data
}

export async function getAdminClient(
  clientId,
) {
  const response = await api.get(
    `/api/admin/clients/${clientId}`,
  )

  return response.data.data
}

export async function getAdminPriceLists() {
  const response = await api.get(
    '/api/admin/clients/price-lists',
  )

  return response.data.data
}

export async function updateAdminClient(
  clientId,
  payload,
) {
  const response = await api.patch(
    `/api/admin/clients/${clientId}`,
    payload,
  )

  return response.data
}

export async function updateAdminClientPriceList(
  clientId,
  priceListId,
) {
  const response = await api.patch(
    `/api/admin/clients/${clientId}/price-list`,
    {
      price_list_id: priceListId,
    },
  )

  return response.data
}