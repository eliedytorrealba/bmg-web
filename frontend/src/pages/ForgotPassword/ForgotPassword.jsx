import {
  ArrowLeft,
  Mail,
  Send,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  forgotPassword,
} from '../../services/passwordService'

function ForgotPassword() {
  const [email, setEmail] =
    useState('')

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

  function handleChange(event) {
    setEmail(event.target.value)

    if (errorMessage) {
      setErrorMessage('')
    }

    if (successMessage) {
      setSuccessMessage('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await forgotPassword(email)

      setSuccessMessage(
        response.message ||
          'Si existe una cuenta asociada a ese correo electrónico, te enviaremos un enlace para restablecer tu contraseña.',
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
          'No pudimos procesar la solicitud. Inténtalo nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-neutral-50 px-4 py-14 sm:py-20">
      <section className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
            <Mail
              size={26}
              aria-hidden="true"
            />
          </span>

          <p className="mt-5 font-semibold text-bmg-blue">
            Recuperación de cuenta
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-bmg-dark">
            Olvidé mi contraseña
          </h1>

          <p className="mt-3 leading-7 text-neutral-600">
            Ingresa el correo electrónico
            asociado a tu cuenta y te
            enviaremos un enlace para crear
            una nueva contraseña.
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
                value={email}
                onChange={handleChange}
                required
                maxLength={255}
                disabled={isSubmitting}
                autoComplete="email"
                inputMode="email"
                placeholder="cliente@empresa.com"
                className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />
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

          {successMessage && (
            <p
              role="status"
              className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold leading-6 text-green-700"
            >
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
          >
            <Send
              size={18}
              aria-hidden="true"
            />

            {isSubmitting
              ? 'Enviando...'
              : 'Enviar enlace'}
          </button>
        </form>

        <div className="mt-8 border-t border-neutral-200 pt-6 text-center">
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-bmg-blue bg-white px-5 py-2 text-sm font-bold text-bmg-blue transition hover:bg-bmg-blue hover:text-bmg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
          >
            <ArrowLeft
              size={17}
              aria-hidden="true"
            />

            Volver a iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  )
}

export default ForgotPassword