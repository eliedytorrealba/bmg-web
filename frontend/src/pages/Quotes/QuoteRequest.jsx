import {
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  Send,
  ShoppingBag,
  User,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import useCart from '../../hooks/useCart'
import api from '../../services/api'

const MESSAGE_MAX_LENGTH = 1000
const PHONE_MAX_LENGTH = 20

const currencyFormatter =
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

const initialFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
}

function QuoteRequest() {
  const {
    cartItems,
    totalItems,
    subtotal,
    hasVisiblePrices,
    allPricesVisible,
    clearCart,
  } = useCart()

  const [formData, setFormData] =
    useState(initialFormData)

  const [wasSubmitted, setWasSubmitted] =
    useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submitError, setSubmitError] =
    useState('')

  useEffect(() => {
    if (!wasSubmitted) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [wasSubmitted])

  const cartSummary = useMemo(() => {
    return cartItems
      .map((item) => {
        const canViewPrice =
          item.can_view_price === true

        if (!canViewPrice) {
          return `${item.quantity} x ${item.name}`
        }

        const unitPrice =
          Number(item.price) || 0

        const itemTotal =
          unitPrice *
          Number(item.quantity || 0)

        return `${item.quantity} x ${
          item.name
        } - ${currencyFormatter.format(
          itemTotal,
        )}`
      })
      .join('\n')
  }, [cartItems])

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    let nextValue = value

    if (name === 'phone') {
      nextValue = value
        .replace(/[^\d+\-()\s]/g, '')
        .slice(0, PHONE_MAX_LENGTH)
    }

    if (name === 'message') {
      nextValue = value.slice(
        0,
        MESSAGE_MAX_LENGTH,
      )
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }))

    if (submitError) {
      setSubmitError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (cartItems.length === 0) {
      setSubmitError(
        'Debes agregar al menos un producto antes de solicitar una cotización.',
      )

      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    const quoteData = {
      customer: {
        name: formData.name.trim(),
        company:
          formData.company.trim(),
        email:
          formData.email.trim(),
        phone:
          formData.phone.trim(),
      },

      message:
        formData.message.trim(),

      items: cartItems.map((item) => ({
        productId: item.id,
        quantity:
          Number(item.quantity) || 1,
      })),

      totalItems,

      subtotal: hasVisiblePrices
        ? Number(subtotal) || 0
        : null,
    }

    try {
      await api.post(
        '/api/quotes',
        quoteData,
      )

      clearCart()
      setFormData(initialFormData)
      setWasSubmitted(true)
    } catch (error) {
      console.error(
        'Error al enviar la cotización:',
        error,
      )

      const validationErrors =
        error.response?.data?.errors

      const firstValidationError =
        validationErrors
          ? Object.values(
              validationErrors,
            )
              .flat()
              .find(Boolean)
          : null

      setSubmitError(
        firstValidationError ||
          error.response?.data?.message ||
          'No pudimos enviar la cotización en este momento. Inténtalo nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNewRequest() {
    setWasSubmitted(false)
    setSubmitError('')
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <p className="font-semibold text-bmg-blue">
            Área de clientes
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
            Solicitar cotización
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Revisa los productos seleccionados y
            completa tus datos para enviar la
            solicitud a nuestro equipo comercial.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-16">
          <section aria-label="Formulario de cotización">
            {wasSubmitted ? (
              <div className="rounded-3xl border border-green-200 bg-green-50 px-6 py-12 text-center sm:px-10">
                <span className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2
                    size={36}
                    aria-hidden="true"
                  />
                </span>

                <h2 className="mt-6 text-3xl font-bold text-bmg-dark">
                  Cotización enviada
                </h2>

                <p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-600">
                  Recibimos correctamente tu
                  solicitud. Puedes consultar su
                  estado desde Mis cotizaciones.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to="/mi-cuenta/cotizaciones"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-dark px-6 py-3 font-bold text-white transition hover:bg-neutral-700"
                  >
                    Mis cotizaciones
                  </Link>

                  <button
                    type="button"
                    onClick={
                      handleNewRequest
                    }
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue"
                  >
                    Nueva cotización
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div>
                  <p className="font-semibold text-bmg-blue">
                    Datos de contacto
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-bmg-dark">
                    Completa tus datos
                  </h2>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-bmg-dark">
                      Nombre y apellido
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
                        maxLength={150}
                        disabled={isSubmitting}
                        autoComplete="name"
                        placeholder="Tu nombre"
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>
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
                        maxLength={150}
                        disabled={isSubmitting}
                        autoComplete="organization"
                        placeholder="Nombre de la empresa"
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>
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
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        maxLength={150}
                        disabled={isSubmitting}
                        autoComplete="email"
                        placeholder="correo@empresa.com"
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>
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
                        required
                        maxLength={
                          PHONE_MAX_LENGTH
                        }
                        inputMode="tel"
                        pattern="[0-9+\-()\s]+"
                        disabled={isSubmitting}
                        autoComplete="tel"
                        placeholder="+54 11 1234-5678"
                        className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                      />
                    </span>
                  </label>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-bold text-bmg-dark">
                    Mensaje adicional
                  </span>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    maxLength={
                      MESSAGE_MAX_LENGTH
                    }
                    rows={5}
                    placeholder="Puedes agregar cualquier detalle adicional sobre tu solicitud."
                    className="mt-2 w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                  />

                  <span className="mt-1 block text-right text-xs text-neutral-500">
                    {formData.message.length} /{' '}
                    {MESSAGE_MAX_LENGTH}
                  </span>
                </label>

                {cartItems.length > 0 ? (
                  <div className="mt-7 rounded-2xl border border-bmg-blue/20 bg-bmg-blue/5 p-5">
                    <div className="flex items-center gap-3">
                      <ShoppingBag
                        size={20}
                        aria-hidden="true"
                        className="text-bmg-blue"
                      />

                      <h3 className="font-bold text-bmg-dark">
                        Productos incluidos
                      </h3>
                    </div>

                    <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-neutral-600">
                      {cartSummary}
                    </pre>
                  </div>
                ) : (
                  <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-bold text-amber-800">
                      No hay productos
                    </p>

                    <p className="mt-2 text-sm text-amber-700">
                      Agrega productos antes de
                      enviar una cotización.
                    </p>

                    <Link
                      to="/productos"
                      className="mt-4 inline-flex rounded-full bg-bmg-dark px-5 py-3 text-sm font-bold text-white"
                    >
                      Ver productos
                    </Link>
                  </div>
                )}

                {submitError && (
                  <p
                    role="alert"
                    className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    cartItems.length === 0
                  }
                  className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Send
                    size={18}
                    aria-hidden="true"
                  />

                  {isSubmitting
                    ? 'Enviando...'
                    : 'Enviar cotización'}
                </button>
              </form>
            )}
          </section>

          <aside aria-label="Resumen de cotización">
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-bmg-dark p-6 text-white shadow-xl sm:p-8">
                <p className="font-semibold text-bmg-blue">
                  Resumen
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Tu cotización
                </h2>

                {cartItems.length > 0 ? (
                  <>
                    <dl className="mt-7 space-y-4">
                      <div className="flex items-center justify-between gap-4 text-neutral-300">
                        <dt>Unidades</dt>

                        <dd className="font-bold text-white">
                          {totalItems}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-neutral-300">
                        <dt>
                          Productos diferentes
                        </dt>

                        <dd className="font-bold text-white">
                          {
                            cartItems.length
                          }
                        </dd>
                      </div>

                      {hasVisiblePrices && (
                        <div className="border-t border-white/15 pt-5">
                          <div className="flex items-end justify-between gap-4">
                            <dt className="font-semibold text-neutral-300">
                              {allPricesVisible
                                ? 'Subtotal'
                                : 'Subtotal parcial'}
                            </dt>

                            <dd className="text-3xl font-bold text-white">
                              {currencyFormatter.format(
                                Number(
                                  subtotal,
                                ) || 0,
                              )}
                            </dd>
                          </div>
                        </div>
                      )}
                    </dl>

                    <Link
                      to="/carrito"
                      className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center font-bold text-white transition hover:border-bmg-blue hover:text-bmg-blue"
                    >
                      Revisar carrito
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-5 leading-7 text-neutral-300">
                      Todavía no agregaste
                      productos.
                    </p>

                    <Link
                      to="/productos"
                      className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-bmg-blue px-5 py-3 font-bold text-bmg-dark"
                    >
                      Ver productos
                    </Link>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

export default QuoteRequest