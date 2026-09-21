import api from './api'

export async function getAdminCatalogProducts(
  params = {},
) {
  const response = await api.get(
    '/api/admin/catalog',
    {
      params,
    },
  )

  return response.data
}

export async function uploadAdminProductImage(
  productId,
  imageFile,
) {
  const formData = new FormData()

  formData.append(
    'image',
    imageFile,
  )

  const response = await api.post(
    `/api/admin/catalog/${productId}/image`,
    formData,
  )

  return response.data
}

export async function deleteAdminProductImage(
  productId,
) {
  const response = await api.delete(
    `/api/admin/catalog/${productId}/image`,
  )

  return response.data
}