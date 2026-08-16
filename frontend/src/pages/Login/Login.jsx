import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from 'lucide-react'
import { useState } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

function Login() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  function togglePasswordVisibility() {
    setShowPassword(
      (currentValue) =>
        !currentValue,
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const loggedUser =
        await login(formData)

      const requestedPath =
        location.state?.from?.pathname

      const requestedSearch =
        location.state?.from?.search ?? ''

      if (requestedPath) {
        navigate(
          `${requestedPath}${requestedSearch}`,
          {
            replace: true,
          },
        )

        return
      }

      navigate(
        loggedUser.role === 'admin'
          ? '/admin'
          : '/',
        {
          replace: true,
        },
      )
    } catch (error) {
      const validationMessage =
        error.response?.data?.errors
          ?.email?.[0]

      const generalMessage =
        error.response?.data?.message

      setErrorMessage(
        validationMessage ||
          generalMessage ||
          'No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-neutral-50 px-4">
        <p className="font-semibold text-neutral-600">
          Verificando sesión...
        </p>
      </main>
    )
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          user?.role === 'admin'
            ? '/admin'
            : '/'
        }
        replace
      />
    )
  }

  return (
    <main className="bg-neutral-50 px-4 py-14 sm:py-20">
      <section className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
            <LogIn
              size={26}
              aria-hidden="true"
            />
          </span>

          <p className="mt-5 font-semibold text-bmg-blue">
            Acceso para clientes
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-bmg-dark">
            Iniciar sesión
          </h1>

          <p className="mt-3 leading-7 text-neutral-600">
            Ingresa con tu cuenta para consultar
            precios y solicitar cotizaciones.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >
          <label className="block">
            <span className="text-sm font-bold text-bmg-dark">
              Correo electrónico
            </span>

            <span className="relative mt-2 block">
              <Mail
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={150}
                disabled={isSubmitting}
                autoComplete="email"
                inputMode="email"
                placeholder="cliente@empresa.com"
                className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />
            </span>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-bmg-dark">
              Contraseña
            </span>

            <span className="relative mt-2 block">
              <LockKeyhole
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-14 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />

              <button
                type="button"
                onClick={
                  togglePasswordVisibility
                }
                disabled={isSubmitting}
                aria-label={
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                aria-pressed={
                  showPassword
                }
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue"
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    size={20}
                    aria-hidden="true"
                  />
                )}
              </button>
            </span>
          </label>

          <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-semibold text-neutral-600">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-neutral-300 text-bmg-blue focus:ring-bmg-blue"
            />

            Mantener mi sesión iniciada
          </label>

          {errorMessage && (
            <p
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
          >
            <LogIn
              size={18}
              aria-hidden="true"
            />

            {isSubmitting
              ? 'Iniciando sesión...'
              : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-7 rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-600">
          <p className="font-bold text-bmg-dark">
            Cuenta de prueba
          </p>

          <p className="mt-2">
            Correo: cliente@bmg.com
          </p>

          <p>
            Contraseña: Cliente1234!
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login