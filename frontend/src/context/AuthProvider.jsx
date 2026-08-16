import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import api from '../services/api'
import AuthContext from './AuthContext'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] =
    useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const response =
        await api.get('/api/me')

      setUser(response.data.data.user)

      return response.data.data.user
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
        return null
      }

      throw error
    }
  }, [])

  useEffect(() => {
    async function restoreSession() {
      try {
        await fetchUser()
      } catch (error) {
        console.error(
          'No se pudo restaurar la sesión:',
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [fetchUser])

  const login = useCallback(
    async ({
      email,
      password,
      remember = false,
    }) => {
      await api.get(
        '/sanctum/csrf-cookie',
      )

      const response = await api.post(
        '/api/login',
        {
          email,
          password,
          remember,
        },
      )

      const authenticatedUser =
        response.data.data.user

      setUser(authenticatedUser)

      return authenticatedUser
    },
    [],
  )

  const updateProfile = useCallback(
    async (profileData) => {
      const response = await api.patch(
        '/api/me/profile',
        profileData,
      )

      const updatedUser =
        response.data.data.user

      setUser(updatedUser)

      return response.data
    },
    [],
  )

  const logout = useCallback(async () => {
    await api.post('/api/logout')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      isClient: user?.role === 'client',
      login,
      logout,
      fetchUser,
      updateProfile,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      fetchUser,
      updateProfile,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider