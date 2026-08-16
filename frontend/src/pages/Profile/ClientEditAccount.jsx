import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

function ClientEditAccount() {
  const {
    user,
    updateProfile,
  } = useAuth()

  const [formData, setFormData] =
    useState({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      company: user?.company ?? '',
      current_password: '',
      password: '',
      password_confirmation: '',
    })

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false)

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState({})

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }))

    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')
    setFieldErrors({})

    try {
      const response =
        await updateProfile(formData)

      setSuccessMessage(
        response.message ??
          'Los datos se actualizaron correctamente.',
      )

      setFormData((current) => ({
        ...current,
        current_password: '',
        password: '',
        password_confirmation: '',
      }))

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (error) {
      const errors =
        error.response?.data?.errors ?? {}

      setFieldErrors(errors)

      setErrorMessage(
        error.response?.data?.message ??
          'No pudimos guardar los cambios. Revisa los datos e inténtalo nuevamente.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-14">
          <Link
            to="/mi-cuenta"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-bmg-dark transition hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
          >
            <ArrowLeft
              size={20}
              aria-hidden="true"
            />
            Volver a Mi cuenta
          </Link>

          <p className="mt-8 font-semibold text-bmg-blue">
            Área de clientes
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
            Editar cuenta
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Actualiza tus datos de contacto y
            administra la seguridad de tu cuenta.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
          {errorMessage && (
            <p
              role="alert"
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700"
            >
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <section>
              <p className="font-semibold text-bmg-blue">
                Información personal
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
                Datos de la cuenta
              </h2>

              <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-bmg-dark">
                      Nombre / Razón social
                    </span>

                    <span className="relative mt-2 block">
                      <UserRound
                        size={18}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        maxLength={255}
                        disabled={isSubmitting}
                        autoComplete="name"
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>

                    {fieldErrors.name?.[0] && (
                      <p className="mt-2 text-sm font-semibold text-red-600">
                        {fieldErrors.name[0]}
                      </p>
                    )}
                  </label>

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
                        value={user?.email ?? ''}
                        disabled
                        className="min-h-13 w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-100 py-3 pl-11 pr-4 text-neutral-500"
                      />
                    </span>

                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      El correo electrónico está
                      asociado a tu cuenta y no
                      puede modificarse desde esta
                      sección.
                    </p>
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-bmg-dark">
                      Teléfono
                    </span>

                    <span className="relative mt-2 block">
                      <Phone
                        size={18}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={30}
                        disabled={isSubmitting}
                        autoComplete="tel"
                        placeholder="+54 9 11..."
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>

                    {fieldErrors.phone?.[0] && (
                      <p className="mt-2 text-sm font-semibold text-red-600">
                        {fieldErrors.phone[0]}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-bmg-dark">
                      Empresa
                    </span>

                    <span className="relative mt-2 block">
                      <Building2
                        size={18}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        maxLength={255}
                        disabled={isSubmitting}
                        autoComplete="organization"
                        placeholder="Nombre de la empresa"
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>

                    {fieldErrors.company?.[0] && (
                      <p className="mt-2 text-sm font-semibold text-red-600">
                        {fieldErrors.company[0]}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <p className="font-semibold text-bmg-blue">
                Identificación
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
                Datos de identificación
              </h2>

              <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold text-bmg-dark">
                      Tipo de documento
                    </p>

                    <p className="mt-2 min-h-13 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-600">
                      {user?.document_type ??
                        'No informado'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-bmg-dark">
                      Número de documento
                    </p>

                    <p className="mt-2 min-h-13 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-600">
                      {user?.document_number ??
                        'No informado'}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-neutral-500">
                  Para modificar los datos de
                  identificación, contacta a BMG
                  Distribuidora.
                </p>
              </div>
            </section>

            <section className="mt-12">
              <p className="font-semibold text-bmg-blue">
                Seguridad
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
                Cambiar contraseña
              </h2>

              <p className="mt-3 text-neutral-600">
                Completa estos campos únicamente
                si deseas modificar tu contraseña.
              </p>

              <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <PasswordField
                  label="Contraseña actual"
                  name="current_password"
                  value={
                    formData.current_password
                  }
                  onChange={handleChange}
                  show={showCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      (current) => !current,
                    )
                  }
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  error={
                    fieldErrors
                      .current_password?.[0]
                  }
                />

                <div className="mt-6">
                  <PasswordField
                    label="Nueva contraseña"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    show={showNewPassword}
                    onToggle={() =>
                      setShowNewPassword(
                        (current) => !current,
                      )
                    }
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    error={
                      fieldErrors.password?.[0]
                    }
                  />
                </div>

                <div className="mt-6">
                  <PasswordField
                    label="Confirmar nueva contraseña"
                    name="password_confirmation"
                    value={
                      formData.password_confirmation
                    }
                    onChange={handleChange}
                    show={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </section>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-bmg-blue px-7 py-3.5 font-bold text-bmg-dark transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                <Save
                  size={18}
                  aria-hidden="true"
                />

                {isSubmitting
                  ? 'Guardando...'
                  : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  autoComplete,
  error,
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-bmg-dark">
        {label}
      </span>

      <span className="relative mt-2 block">
        <LockKeyhole
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />

        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-14 text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            show
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
          aria-pressed={show}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue"
        >
          {show ? (
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

      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </label>
  )
}

export default ClientEditAccount