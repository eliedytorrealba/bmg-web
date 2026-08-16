import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Mail,
  MessageSquareText,
  Package,
  Phone,
  Tag,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import { getMyQuote } from '../../services/quoteService'

const currencyFormatter = new Intl.NumberFormat(
  'es-AR',
  {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  },
)

const dateFormatter = new Intl.DateTimeFormat(
  'es-AR',
  {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
)

const statusLabels = {
  pending: 'Pendiente',
  answered: 'Respondida',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

const statusClasses = {
  pending:
    'border-amber-200 bg-amber-50 text-amber-700',
  answered:
    'border-blue-200 bg-blue-50 text-blue-700',
  approved:
    'border-green-200 bg-green-50 text-green-700',
  rejected:
    'border-red-200 bg-red-50 text-red-700',
}

function ClientQuoteDetail() {
  const { quoteId } = useParams()

  const [quote, setQuote] = useState(null)
  const [isLoading, setIsLoading] =
    useState(true)
  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadQuote() {
      try {
        const response = await getMyQuote(
          quoteId,
        )

        if (isMounted) {
          setQuote(response)
        }
      } catch (error) {
        console.error(
          'No se pudo cargar la cotización:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              'No pudimos cargar la cotización.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuote()

    return () => {
      isMounted = false
    }
  }, [quoteId])

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <p className="font-bold text-bmg-dark">
          Cargando cotización...
        </p>
      </main>
    )
  }

  if (errorMessage || !quote) {
    return (
      <main className="bg-white px-4 py-20">
        <section className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700">
            No pudimos mostrar la cotización
          </h1>

          <p className="mt-3 text-red-600">
            {errorMessage ||
              'La cotización no está disponible.'}
          </p>

          <Link
            to="/mi-cuenta/cotizaciones"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-bmg-dark transition hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
          >
            <ArrowLeft
              size={20}
              aria-hidden="true"
            />

            Volver a Mis cotizaciones
          </Link>
        </section>
      </main>
    )
  }

  const status =
    quote.status ?? 'pending'

  const items = Array.isArray(quote.items)
    ? quote.items
    : []

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <Link
            to="/mi-cuenta/cotizaciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Volver a Mis cotizaciones
          </Link>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-bmg-blue">
                Detalle de cotización
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
                {quote.number ??
                  `#${String(
                    quote.id,
                  ).padStart(6, '0')}`}
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-600">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays
                    size={17}
                    aria-hidden="true"
                    className="text-bmg-blue"
                  />

                  {quote.created_at
                    ? dateFormatter.format(
                        new Date(
                          quote.created_at,
                        ),
                      )
                    : 'Sin fecha'}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Package
                    size={17}
                    aria-hidden="true"
                    className="text-bmg-blue"
                  />

                  {quote.total_items}{' '}
                  {quote.total_items === 1
                    ? 'unidad'
                    : 'unidades'}
                </span>
              </div>
            </div>

            <span
              className={`inline-flex self-start rounded-full border px-4 py-2 text-sm font-bold ${
                statusClasses[status] ??
                statusClasses.pending
              }`}
            >
              {statusLabels[status] ??
                'Pendiente'}
            </span>
          </div>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
          <section className="space-y-8">
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <ClipboardList
                  size={22}
                  aria-hidden="true"
                  className="text-bmg-blue"
                />

                <h2 className="text-2xl font-bold text-bmg-dark">
                  Productos incluidos
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                {items.map((item, index) => {
                  const canViewPrice =
                    item.canViewPrice === true

                  return (
                    <article
                      key={`${item.productId ?? index}-${index}`}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-bmg-blue">
                            {item.brand ??
                              'Sin marca'}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-bmg-dark">
                            {item.name ??
                              'Producto'}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500">
                            <span className="inline-flex items-center gap-2">
                              <Tag
                                size={15}
                                aria-hidden="true"
                              />

                              Código:{' '}
                              {item.code ??
                                'Sin código'}
                            </span>

                            <span>
                              Cantidad:{' '}
                              {Number(
                                item.quantity,
                              ) || 1}
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          {canViewPrice ? (
                            <>
                              <p className="text-sm text-neutral-500">
                                Precio unitario
                              </p>

                              <p className="mt-1 font-bold text-bmg-dark">
                                {currencyFormatter.format(
                                  Number(
                                    item.unitPrice,
                                  ) || 0,
                                )}
                              </p>

                              <p className="mt-3 text-sm text-neutral-500">
                                Total
                              </p>

                              <p className="mt-1 text-xl font-bold text-bmg-dark">
                                {currencyFormatter.format(
                                  Number(
                                    item.total,
                                  ) || 0,
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="font-bold text-bmg-blue">
                              Precio a confirmar
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <MessageSquareText
                  size={22}
                  aria-hidden="true"
                  className="text-bmg-blue"
                />

                <h2 className="text-2xl font-bold text-bmg-dark">
                  Mensaje enviado
                </h2>
              </div>

              <p className="mt-5 whitespace-pre-wrap leading-7 text-neutral-600">
                {quote.message ||
                  'No se agregó un mensaje adicional.'}
              </p>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-3xl bg-bmg-dark p-6 text-white shadow-xl sm:p-8">
              <p className="font-semibold text-bmg-blue">
                Resumen
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Cotización
              </h2>

              <dl className="mt-7 space-y-4">
                <div className="flex items-center justify-between gap-4 text-neutral-300">
                  <dt>Productos</dt>

                  <dd className="font-bold text-white">
                    {items.length}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 text-neutral-300">
                  <dt>Unidades</dt>

                  <dd className="font-bold text-white">
                    {quote.total_items}
                  </dd>
                </div>

                {quote.has_visible_prices ? (
                  <div className="border-t border-white/15 pt-5">
                    <div className="flex items-end justify-between gap-4">
                      <dt className="font-semibold text-neutral-300">
                        {quote.all_prices_visible
                          ? 'Subtotal'
                          : 'Subtotal parcial'}
                      </dt>

                      <dd className="text-3xl font-bold text-white">
                        {currencyFormatter.format(
                          Number(
                            quote.subtotal,
                          ) || 0,
                        )}
                      </dd>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-white/15 pt-5">
                    <p className="font-semibold text-bmg-blue">
                      Precios pendientes de confirmación.
                    </p>
                  </div>
                )}
              </dl>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-bmg-dark">
                Datos de contacto
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-4">
                  <Building2
                    size={20}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-bmg-blue"
                  />

                  <div>
                    <p className="font-bold text-bmg-dark">
                      Empresa
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                      {quote.customer?.company ||
                        quote.company ||
                        'No informada'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail
                    size={20}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-bmg-blue"
                  />

                  <div>
                    <p className="font-bold text-bmg-dark">
                      Correo
                    </p>

                    <p className="mt-1 break-all text-sm text-neutral-600">
                      {quote.customer?.email ||
                        quote.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone
                    size={20}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-bmg-blue"
                  />

                  <div>
                    <p className="font-bold text-bmg-dark">
                      Teléfono
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                      {quote.customer?.phone ||
                        quote.phone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2
                    size={20}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-bmg-blue"
                  />

                  <div>
                    <p className="font-bold text-bmg-dark">
                      Estado
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                      {statusLabels[status] ??
                        'Pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </main>
    </>
  )
}

export default ClientQuoteDetail