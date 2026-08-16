import {
  Navigate,
  useLocation,
} from 'react-router-dom'

import useAuth from '../hooks/useAuth'

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth()

  const location = useLocation()

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <p className="font-bold text-bmg-dark">
          Verificando acceso...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  if (
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute