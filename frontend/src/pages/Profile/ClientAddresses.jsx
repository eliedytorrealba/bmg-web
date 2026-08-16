import {
  ArrowLeft,
  Building2,
  MapPin,
  Save,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import api from '../../services/api'

const emptyAddress = {
  street: '',
  number: '',
  floor_apartment: '',
  city: '',
  province: '',
  postal_code: '',
  notes: '',
}

function ClientAddresses() {
  const [principal, setPrincipal] =
    useState(emptyAddress)

  const [secondary, setSecondary] =
    useState(emptyAddress)

  const [isLoading, setIsLoading] =
    useState(true)

  const [savingType, setSavingType] =
    useState(null)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [errorMessage, setErrorMessage] =
    useState('')

  const [fieldErrors, setFieldErrors] =
    useState({})

  useEffect(() => {
    async function loadAddresses() {
      try {
        const response = await api.get(
          '/api/my/addresses',
        )

        if (response.data.data.principal) {
          setPrincipal({
            ...emptyAddress,
            ...response.data.data.principal,
          })
        }

        if (response.data.data.secondary) {
          setSecondary({
            ...emptyAddress,
            ...response.data.data.secondary,
          })
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos cargar tus direcciones.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadAddresses()
  }, [])

  function handleChange(
    type,
    event,
  ) {
    const { name, value } = event.target

    const setter =
      type === 'principal'
        ? setPrincipal
        : setSecondary

    setter((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [`${type}.${name}`]: undefined,
    }))

    setSuccessMessage('')
    setErrorMessage('')
  }

  async function handleSave(
    type,
    address,
  ) {
    setSavingType(type)
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    try {
      const response = await api.put(
        '/api/my/addresses',
        {
          type,
          street: address.street,
          number: address.number,
          floor_apartment:
            address.floor_apartment || null,
          city: address.city,
          province: address.province,
          postal_code:
            address.postal_code || null,
          notes: address.notes || null,
        },
      )

      setSuccessMessage(
        type === 'principal'
          ? 'La dirección principal se guardó correctamente.'
          : 'La otra dirección se guardó correctamente.',
      )

      const savedAddress =
        response.data.data.address

      if (type === 'principal') {
        setPrincipal({
          ...emptyAddress,
          ...savedAddress,
        })
      } else {
        setSecondary({
          ...emptyAddress,
          ...savedAddress,
        })
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (error) {
      const errors =
        error.response?.data?.errors ?? {}

      const normalizedErrors = {}

      Object.entries(errors).forEach(
        ([field, messages]) => {
          normalizedErrors[
            `${type}.${field}`
          ] = messages
        },
      )

      setFieldErrors(normalizedErrors)

      setErrorMessage(
        error.response?.data?.message ??
          'No pudimos guardar la dirección. Revisa los datos e inténtalo nuevamente.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } finally {
      setSavingType(null)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <p className="font-semibold text-neutral-600">
          Cargando direcciones...
        </p>
      </main>
    )
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
            Mis direcciones
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Gestiona las direcciones de entrega
            asociadas a tu cuenta.
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

          <section>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <MapPin
                  size={22}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-semibold text-bmg-blue">
                  Entrega predeterminada
                </p>

                <h2 className="mt-1 text-3xl font-bold text-bmg-dark">
                  Dirección principal
                </h2>
              </div>
            </div>

            <AddressForm
              type="principal"
              address={principal}
              onChange={handleChange}
              onSave={handleSave}
              isSaving={
                savingType === 'principal'
              }
              fieldErrors={fieldErrors}
            />
          </section>

          <section className="mt-12">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <Building2
                  size={22}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-semibold text-bmg-blue">
                  Dirección alternativa
                </p>

                <h2 className="mt-1 text-3xl font-bold text-bmg-dark">
                  Otra dirección
                </h2>
              </div>
            </div>

            <p className="mt-3 text-neutral-600">
              Esta dirección es opcional y puede
              utilizarse como alternativa para
              futuras entregas.
            </p>

            <AddressForm
              type="secondary"
              address={secondary}
              onChange={handleChange}
              onSave={handleSave}
              isSaving={
                savingType === 'secondary'
              }
              fieldErrors={fieldErrors}
            />
          </section>
        </div>
      </main>
    </>
  )
}

function AddressForm({
  type,
  address,
  onChange,
  onSave,
  isSaving,
  fieldErrors,
}) {
  function errorFor(field) {
    return fieldErrors[
      `${type}.${field}`
    ]?.[0]
  }

  return (
    <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <AddressInput
          label="Calle"
          name="street"
          value={address.street}
          onChange={(event) =>
            onChange(type, event)
          }
          required
          error={errorFor('street')}
        />

        <AddressInput
          label="Número"
          name="number"
          value={address.number}
          onChange={(event) =>
            onChange(type, event)
          }
          required
          error={errorFor('number')}
        />

        <AddressInput
          label="Piso / Departamento"
          name="floor_apartment"
          value={address.floor_apartment}
          onChange={(event) =>
            onChange(type, event)
          }
          placeholder="Opcional"
          error={errorFor(
            'floor_apartment',
          )}
        />

        <AddressInput
          label="Código postal"
          name="postal_code"
          value={address.postal_code}
          onChange={(event) =>
            onChange(type, event)
          }
          placeholder="Opcional"
          error={errorFor('postal_code')}
        />

        <AddressInput
          label="Localidad"
          name="city"
          value={address.city}
          onChange={(event) =>
            onChange(type, event)
          }
          required
          error={errorFor('city')}
        />

        <AddressInput
          label="Provincia"
          name="province"
          value={address.province}
          onChange={(event) =>
            onChange(type, event)
          }
          required
          error={errorFor('province')}
        />
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-bold text-bmg-dark">
          Referencias / Observaciones
        </span>

        <textarea
          name="notes"
          value={address.notes}
          onChange={(event) =>
            onChange(type, event)
          }
          rows={4}
          maxLength={1000}
          placeholder="Ej.: Portón negro, depósito al fondo, horario de recepción..."
          className="mt-2 w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15"
        />

        {errorFor('notes') && (
          <p className="mt-2 text-sm font-semibold text-red-600">
            {errorFor('notes')}
          </p>
        )}
      </label>

      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={() =>
            onSave(type, address)
          }
          disabled={isSaving}
          className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-bmg-blue px-7 py-3.5 font-bold text-bmg-dark transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
        >
          <Save
            size={18}
            aria-hidden="true"
          />

          {isSaving
            ? 'Guardando...'
            : type === 'principal'
              ? 'Guardar dirección principal'
              : 'Guardar otra dirección'}
        </button>
      </div>
    </div>
  )
}

function AddressInput({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  error,
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-bmg-dark">
        {label}
        {required && (
          <span className="text-red-600">
            {' '}
            *
          </span>
        )}
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-2 min-h-13 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15"
      />

      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </label>
  )
}

export default ClientAddresses