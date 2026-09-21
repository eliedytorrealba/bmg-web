import api from './api'

export async function getAdminNotifications() {
  const response = await api.get(
    '/api/admin/notifications',
  )

  return Array.isArray(response.data.data)
    ? response.data.data
    : []
}

export async function createAdminNotification(
  payload,
) {
  const response = await api.post(
    '/api/admin/notifications',
    payload,
  )

  return response.data
}

export async function deleteAdminNotification(
  notificationId,
) {
  const response = await api.delete(
    `/api/admin/notifications/${notificationId}`,
  )

  return response.data
}

export async function deleteBulkAdminNotifications(
  notificationIds,
) {
  const response = await api.delete(
    '/api/admin/notifications/bulk',
    {
      data: {
        notification_ids:
          notificationIds,
      },
    },
  )

  return response.data
}