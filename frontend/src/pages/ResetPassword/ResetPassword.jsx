import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from 'lucide-react'
import { useState } from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import {
  resetPassword,
} from '../../services/passwordService'

function ResetPassword() {
  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token') ?? ''

  const email =
    searchParams.get('email') ?? ''

  const [
    formData,
    setFormData,
  ] = useState({
    password: '',
    passwordConfirmation: '',
  })

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    showPasswordConfirmation,
    setShowPasswordConfirmation,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const hasValidParameters =
    Boolean(token && email)

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (! hasValidParameters) {
      setErrorMessage(
        'El enlace de recuperación no es válido.',
      )

      return
    }

    if (
      formData.password !==
      formData.passwordConfirmation
    ) {
      setErrorMessage(
        'Las contraseñas no coinciden.',
      )

      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await resetPassword({
          token,
          email,
          password:
            formData.password,
          passwordConfirmation:
            formData.passwordConfirmation,
        })

      setSuccessMessage(
        response.message ||
          'Tu contraseña se restableció correctamente.',
      )

      setFormData({
        password: '',
        passwordConfirmation: '',
      })
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors

      const validationMessage =
        validationErrors?.password?.[0] ||
        validationErrors?.email?.[0] ||
        validationErrors?.token?.[0]

      const generalMessage =
        error.response?.data?.message

      setErrorMessage(
        validationMessage ||
          generalMessage ||
          'No pudimos restablecer tu contraseña. Solicita un nuevo enlace e inténtalo nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (! hasValidParameters) {
    return (
      <main className="bg-neutral-50 px-4 py-14 sm:py-20">
        <section className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-xl sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LockKeyhole
              size={26}
              aria-hidden="true"
            />
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-bmg-dark">
            Enlace no válido
          </h1>

          <p className="mt-3 leading-7 text-neutral-600">
            El enlace de recuperación está
            incompleto o no es válido. Solicita
            un nuevo enlace para restablecer tu
            contraseña.
          </p>

          <Link
            to="/olvide-mi-contrasena"
            className="mt-7 inline-flex min-h-13 items-center justify-center rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
          >
            Solicitar nuevo enlace
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="bg-neutral-50 px-4 py-14 sm:py-20">
      <section className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
            <LockKeyhole
              size={26}
              aria-hidden="true"
            />
          </span>

          <p className="mt-5 font-semibold text-bmg-blue">
            Seguridad de tu cuenta
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-bmg-dark">
            Restablecer contraseña
          </h1>

          <p className="mt-3 leading-7 text-neutral-600">
            Ingresa una nueva contraseña para
            tu cuenta de BMG Distribuidora.
          </p>

          <p className="mt-2 break-all text-sm font-semibold text-neutral-500">
            {email}
          </p>
        </div>

        {! successMessage ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <label className="block">
              <span className="text-sm font-bold text-bmg-dark">
                Nueva contraseña
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
                  minLength={8}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-14 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) =>
                        ! currentValue,
                    )
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
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

            <label className="mt-5 block">
              <span className="text-sm font-bold text-bmg-dark">
                Confirmar nueva contraseña
              </span>

              <span className="relative mt-2 block">
                <LockKeyhole
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  type={
                    showPasswordConfirmation
                      ? 'text'
                      : 'password'
                  }
                  name="passwordConfirmation"
                  value={
                    formData.passwordConfirmation
                  }
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-14 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(
                      (currentValue) =>
                        ! currentValue,
                    )
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPasswordConfirmation
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue"
                >
                  {showPasswordConfirmation ? (
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
              <LockKeyhole
                size={18}
                aria-hidden="true"
              />

              {isSubmitting
                ? 'Guardando...'
                : 'Restablecer contraseña'}
            </button>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2
                size={28}
                aria-hidden="true"
              />
            </span>

            <p
              role="status"
              className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold leading-6 text-green-700"
            >
              {successMessage}
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {! successMessage && (
          <div className="mt-8 border-t border-neutral-200 pt-6 text-center">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-bmg-blue transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />

              Volver a iniciar sesión
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default ResetPassword