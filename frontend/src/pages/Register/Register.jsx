import {
  Building2,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  Phone,
  User,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

const DOCUMENT_CONFIG = {
  DNI: {
    label: 'DNI',
    placeholder: 'Ej. 40999888',
    maxLength: 8,
    inputMode: 'numeric',
  },
  CUIT: {
    label: 'CUIT',
    placeholder: 'Ej. 20409998881',
    maxLength: 11,
    inputMode: 'numeric',
  },
  CUIL: {
    label: 'CUIL',
    placeholder: 'Ej. 20409998881',
    maxLength: 11,
    inputMode: 'numeric',
  },
  PASSPORT: {
    label: 'Pasaporte',
    placeholder: 'Ej. AA123456',
    maxLength: 20,
    inputMode: 'text',
  },
}

function Register() {
  const {
    register,
    isAuthenticated,
    isLoading,
    user,
  } = useAuth()

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    document_type: 'DNI',
    document_number: '',
    password: '',
    password_confirmation: '',
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
    fieldErrors,
    setFieldErrors,
  ] = useState({})

  const documentConfig =
    DOCUMENT_CONFIG[formData.document_type]

  function clearFieldError(fieldName) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors
      }

      const nextErrors = {
        ...currentErrors,
      }

      delete nextErrors[fieldName]

      return nextErrors
    })
  }

  function handleChange(event) {
    const { name, value } = event.target

    let nextValue = value

    if (name === 'name') {
      nextValue = value.replace(
        /[^\p{L}\s'-]/gu,
        '',
      )
    }

    if (name === 'phone') {
      nextValue = value
        .replace(/\D/g, '')
        .slice(0, 15)
    }

    if (
      name === 'document_number' &&
      ['DNI', 'CUIT', 'CUIL'].includes(
        formData.document_type,
      )
    ) {
      nextValue = value.replace(/\D/g, '')
    }

    if (
      name === 'document_number' &&
      formData.document_type === 'PASSPORT'
    ) {
      nextValue = value
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }))

    clearFieldError(name)

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  function handleDocumentTypeChange(event) {
    const { value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      document_type: value,
      document_number: '',
    }))

    clearFieldError('document_type')
    clearFieldError('document_number')

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  function getFieldError(fieldName) {
    return fieldErrors[fieldName]?.[0] ?? ''
  }

  function validateForm() {
    const errors = {}

    const trimmedName =
      formData.name.trim()

    if (!trimmedName) {
      errors.name = [
        'El nombre y apellido son obligatorios.',
      ]
    } else if (
      !/^[\p{L}]+(?:[\s'-]+[\p{L}]+)+$/u.test(
        trimmedName,
      )
    ) {
      errors.name = [
        'Ingresa nombre y apellido usando solamente letras.',
      ]
    }

    if (!formData.email.trim()) {
      errors.email = [
        'El correo electrónico es obligatorio.',
      ]
    }

    if (
      formData.phone &&
      !/^\d{8,15}$/.test(formData.phone)
    ) {
      errors.phone = [
        'El teléfono debe contener entre 8 y 15 números.',
      ]
    }

    if (
      formData.document_type === 'DNI' &&
      !/^\d{7,8}$/.test(
        formData.document_number,
      )
    ) {
      errors.document_number = [
        'El DNI debe contener 7 u 8 números.',
      ]
    }

    if (
      ['CUIT', 'CUIL'].includes(
        formData.document_type,
      ) &&
      !/^\d{11}$/.test(
        formData.document_number,
      )
    ) {
      errors.document_number = [
        `El ${formData.document_type} debe contener exactamente 11 números.`,
      ]
    }

    if (
      formData.document_type ===
        'PASSPORT' &&
      !/^[A-Z0-9]{5,20}$/.test(
        formData.document_number,
      )
    ) {
      errors.document_number = [
        'El pasaporte debe contener entre 5 y 20 letras o números.',
      ]
    }

    if (formData.password.length < 8) {
      errors.password = [
        'La contraseña debe tener al menos 8 caracteres.',
      ]
    }

    if (
      formData.password !==
      formData.password_confirmation
    ) {
      errors.password_confirmation = [
        'Las contraseñas no coinciden.',
      ]
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setErrorMessage(
        Object.values(errors)[0][0],
      )

      return false
    }

    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setErrorMessage('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email
          .trim()
          .toLowerCase(),
        phone:
          formData.phone || null,
        company:
          formData.company.trim() || null,
        document_type:
          formData.document_type,
        document_number:
          formData.document_number.trim(),
        password: formData.password,
        password_confirmation:
          formData.password_confirmation,
      })

      navigate('/mi-cuenta', {
        replace: true,
      })
    } catch (error) {
      const errors =
        error.response?.data?.errors ?? {}

      setFieldErrors(errors)

      const firstValidationMessage =
        Object.values(errors)?.[0]?.[0]

      setErrorMessage(
        firstValidationMessage ||
          error.response?.data?.message ||
          'No pudimos crear tu cuenta. Revisa los datos e inténtalo nuevamente.',
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
            : '/mi-cuenta'
        }
        replace
      />
    )
  }

  return (
    <main className="bg-neutral-50 px-4 py-16 sm:py-20">
      <section className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
            <UserPlus
              size={26}
              aria-hidden="true"
            />
          </span>

          <p className="mt-5 font-semibold text-bmg-blue">
            Cuenta BMG
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-bmg-dark">
            Crear cuenta
          </h1>

          <p className="mt-3 leading-7 text-neutral-600">
            Regístrate para acceder al portal,
            guardar favoritos y solicitar
            cotizaciones.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-bmg-dark">
                Nombre y Apellido *
              </span>

              <span className="relative mt-2 block">
                <User
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
                  placeholder="Nombre y apellido"
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />
              </span>

              {getFieldError('name') && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError('name')}
                </p>
              )}
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-bmg-dark">
                Correo Electrónico *
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
                  maxLength={255}
                  disabled={isSubmitting}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="cliente@empresa.com"
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />
              </span>

              {getFieldError('email') && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError('email')}
                </p>
              )}
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
                  maxLength={15}
                  disabled={isSubmitting}
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ej. 1123456789"
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />
              </span>

              {getFieldError('phone') && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError('phone')}
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

              {getFieldError('company') && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError('company')}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-bmg-dark">
                Tipo de Documento *
              </span>

              <select
                name="document_type"
                value={formData.document_type}
                onChange={
                  handleDocumentTypeChange
                }
                required
                disabled={isSubmitting}
                className="mt-2 min-h-13 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
              >
                {Object.entries(
                  DOCUMENT_CONFIG,
                ).map(
                  ([
                    documentType,
                    config,
                  ]) => (
                    <option
                      key={documentType}
                      value={documentType}
                    >
                      {config.label}
                    </option>
                  ),
                )}
              </select>

              {getFieldError(
                'document_type',
              ) && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError(
                    'document_type',
                  )}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-bmg-dark">
                Número de Documento *
              </span>

              <span className="relative mt-2 block">
                <FileText
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  type="text"
                  name="document_number"
                  value={
                    formData.document_number
                  }
                  onChange={handleChange}
                  required
                  maxLength={
                    documentConfig.maxLength
                  }
                  inputMode={
                    documentConfig.inputMode
                  }
                  disabled={isSubmitting}
                  autoComplete="off"
                  placeholder={
                    documentConfig.placeholder
                  }
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />
              </span>

              {getFieldError(
                'document_number',
              ) && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError(
                    'document_number',
                  )}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-bmg-dark">
                Contraseña *
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
                        !currentValue,
                    )
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-50"
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

              {getFieldError('password') && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError('password')}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-bmg-dark">
                Confirmar Contraseña *
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
                  name="password_confirmation"
                  value={
                    formData.password_confirmation
                  }
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-14 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPasswordConfirmation
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-50"
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

              {getFieldError(
                'password_confirmation',
              ) && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {getFieldError(
                    'password_confirmation',
                  )}
                </p>
              )}
            </label>
          </div>

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
            <UserPlus
              size={18}
              aria-hidden="true"
            />

            {isSubmitting
              ? 'Creando cuenta...'
              : 'Crear cuenta'}
          </button>

          <p className="mt-6 text-center text-sm text-neutral-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-bmg-blue hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Register