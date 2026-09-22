import api from './api'

export async function forgotPassword(
  email,
) {
  const response = await api.post(
    '/api/forgot-password',
    {
      email,
    },
  )

  return response.data
}

export async function resetPassword({
  token,
  email,
  password,
  passwordConfirmation,
}) {
  const response = await api.post(
    '/api/reset-password',
    {
      token,
      email,
      password,
      password_confirmation:
        passwordConfirmation,
    },
  )

  return response.data
}