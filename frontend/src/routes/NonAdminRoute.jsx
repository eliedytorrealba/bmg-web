import {
  Navigate,
} from 'react-router-dom'

import useAuth from '../hooks/useAuth'

function NonAdminRoute({
  children,
}) {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <p className="font-bold text-bmg-dark">
          Verificando acceso...
        </p>
      </main>
    )
  }

  if (
    isAuthenticated &&
    user?.role === 'admin'
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return children
}

export default NonAdminRoute