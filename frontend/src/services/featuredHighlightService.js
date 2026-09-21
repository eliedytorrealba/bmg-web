import api from './api'

export async function getAdminHighlights() {
  const response = await api.get(
    '/api/admin/highlights',
  )

  return Array.isArray(response.data.data)
    ? response.data.data
    : []
}

export async function createHighlight(
  payload,
) {
  const formData =
    buildHighlightFormData(
      payload,
    )

  const response = await api.post(
    '/api/admin/highlights',
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function updateHighlight(
  highlightId,
  payload,
) {
  const formData =
    buildHighlightFormData(
      payload,
    )

  const response = await api.post(
    `/api/admin/highlights/${highlightId}`,
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function deleteHighlight(
  highlightId,
) {
  const response = await api.delete(
    `/api/admin/highlights/${highlightId}`,
  )

  return response.data
}

function buildHighlightFormData(
  payload,
) {
  const formData =
    new FormData()

  formData.append(
    'title',
    payload.title ?? '',
  )

  formData.append(
    'alt_text',
    payload.alt_text ?? '',
  )

  formData.append(
    'is_active',
    payload.is_active
      ? '1'
      : '0',
  )

  formData.append(
    'sort_order',
    String(
      payload.sort_order ?? 0,
    ),
  )

  if (payload.link_url) {
    formData.append(
      'link_url',
      payload.link_url,
    )
  }

  if (payload.starts_at) {
    formData.append(
      'starts_at',
      payload.starts_at,
    )
  }

  if (payload.ends_at) {
    formData.append(
      'ends_at',
      payload.ends_at,
    )
  }

  if (payload.image) {
    formData.append(
      'image',
      payload.image,
    )
  }

  return formData
}