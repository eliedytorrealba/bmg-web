import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Package,
  RotateCcw,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import { getMyQuotes } from '../../services/quoteService'

const currencyFormatter =
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

const dateFormatter =
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone:
      'America/Argentina/Buenos_Aires',
  })

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

const initialFilters = {
  from: '',
  to: '',
  status: '',
}

function getArgentinaToday() {
  const parts = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone:
        'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).formatToParts(new Date())

  const year = Number(
    parts.find(
      (part) => part.type === 'year',
    )?.value,
  )

  const month = Number(
    parts.find(
      (part) => part.type === 'month',
    )?.value,
  )

  const day = Number(
    parts.find(
      (part) => part.type === 'day',
    )?.value,
  )

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  )
}

function formatDateForInput(date) {
  const year = date.getUTCFullYear()

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getUTCDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function ClientQuotes() {
  const [quotes, setQuotes] =
    useState([])

  const [filters, setFilters] =
    useState(initialFilters)

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      lastPage: 1,
      total: 0,
      from: 0,
      to: 0,
    })

  const [currentPage, setCurrentPage] =
    useState(1)

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const hasActiveFilters =
    filters.from !== '' ||
    filters.to !== '' ||
    filters.status !== ''

  const hasInvalidDateRange =
    filters.from !== '' &&
    filters.to !== '' &&
    filters.to < filters.from

  const loadQuotes = useCallback(
    async () => {
      if (hasInvalidDateRange) {
        setQuotes([])

        setPagination({
          currentPage: 1,
          lastPage: 1,
          total: 0,
          from: 0,
          to: 0,
        })

        setErrorMessage(
          'La fecha hasta no puede ser anterior a la fecha desde.',
        )

        setIsLoading(false)

        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const response =
          await getMyQuotes({
            page: currentPage,

            from:
              filters.from ||
              undefined,

            to:
              filters.to ||
              undefined,

            status:
              filters.status ||
              undefined,
          })

        setQuotes(
          Array.isArray(response.data)
            ? response.data
            : [],
        )

        setPagination({
          currentPage:
            response.current_page ?? 1,

          lastPage:
            response.last_page ?? 1,

          total:
            response.total ?? 0,

          from:
            response.from ?? 0,

          to:
            response.to ?? 0,
        })
      } catch (error) {
        console.error(
          'No se pudieron cargar las cotizaciones:',
          error,
        )

        setQuotes([])

        setPagination({
          currentPage: 1,
          lastPage: 1,
          total: 0,
          from: 0,
          to: 0,
        })

        const validationErrors =
          error.response?.data?.errors

        const firstValidationError =
          validationErrors
            ? Object.values(
                validationErrors,
              ).flat()[0]
            : null

        setErrorMessage(
          firstValidationError ||
            error.response?.data
              ?.message ||
            'No pudimos cargar tus cotizaciones.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [
      currentPage,
      filters.from,
      filters.to,
      filters.status,
      hasInvalidDateRange,
    ],
  )

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadQuotes()
      }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadQuotes])

  function handleFilterChange(event) {
    const {
      name,
      value,
    } = event.target

    setFilters(
      (currentFilters) => ({
        ...currentFilters,
        [name]: value,
      }),
    )

    setCurrentPage(1)
  }

  function applyQuickRange(days) {
    const today =
      getArgentinaToday()

    const startDate =
      new Date(today)

    startDate.setUTCDate(
      startDate.getUTCDate() -
        (days - 1),
    )

    setFilters({
      from:
        formatDateForInput(
          startDate,
        ),

      to:
        formatDateForInput(today),

      status:
        filters.status,
    })

    setCurrentPage(1)
  }

  function clearFilters() {
    setFilters(initialFilters)
    setCurrentPage(1)
  }

  function goToPage(page) {
    if (
      page < 1 ||
      page >
        pagination.lastPage ||
      page ===
        pagination.currentPage
    ) {
      return
    }

    setCurrentPage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
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
            Mis cotizaciones
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Consulta las solicitudes enviadas,
            los productos incluidos y el estado
            de cada cotización.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-neutral-500">
                  Historial
                </p>

                <h2 className="mt-1 text-2xl font-bold text-bmg-dark">
                  Cotizaciones enviadas
                </h2>

                {!isLoading &&
                  pagination.total > 0 && (
                    <p className="mt-2 text-sm text-neutral-500">
                      Mostrando del{' '}
                      {pagination.from} al{' '}
                      {pagination.to} de{' '}
                      {pagination.total}
                    </p>
                  )}
              </div>

              <Link
                to="/productos"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-bmg-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                Nueva cotización
              </Link>
            </div>

            <section className="mt-7 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                  <Filter
                    size={20}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <h3 className="font-bold text-bmg-dark">
                    Filtrar cotizaciones
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Busca por fecha o estado.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-bold text-bmg-dark">
                    Desde
                  </span>

                  <input
                    type="date"
                    name="from"
                    value={filters.from}
                    onChange={
                      handleFilterChange
                    }
                    max={
                      filters.to ||
                      undefined
                    }
                    className="mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-bmg-dark">
                    Hasta
                  </span>

                  <input
                    type="date"
                    name="to"
                    value={filters.to}
                    onChange={
                      handleFilterChange
                    }
                    min={
                      filters.from ||
                      undefined
                    }
                    className="mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-bmg-dark">
                    Estado
                  </span>

                  <select
                    name="status"
                    value={
                      filters.status
                    }
                    onChange={
                      handleFilterChange
                    }
                    className="mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  >
                    <option value="">
                      Todos los estados
                    </option>

                    <option value="pending">
                      Pendiente
                    </option>

                    <option value="answered">
                      Respondida
                    </option>

                    <option value="approved">
                      Aprobada
                    </option>

                    <option value="rejected">
                      Rechazada
                    </option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    applyQuickRange(7)
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                >
                  Última semana
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyQuickRange(30)
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                >
                  Último mes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyQuickRange(90)
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                >
                  Últimos 90 días
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={
                    !hasActiveFilters
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-neutral-600 transition enabled:hover:bg-neutral-200 enabled:hover:text-bmg-dark disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                >
                  <RotateCcw
                    size={17}
                    aria-hidden="true"
                  />

                  Restablecer
                </button>
              </div>

              {hasInvalidDateRange && (
                <p
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  La fecha hasta no puede ser
                  anterior a la fecha desde.
                </p>
              )}
            </section>

                       {isLoading && (
              <div className="py-16 text-center">
                <p className="font-bold text-bmg-dark">
                  Cargando cotizaciones...
                </p>
              </div>
            )}

            {!isLoading &&
              errorMessage &&
              !hasInvalidDateRange && (
                <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
                  <p className="font-bold text-red-700">
                    {errorMessage}
                  </p>

                  <button
                    type="button"
                    onClick={loadQuotes}
                    className="mt-5 min-h-11 rounded-full bg-bmg-dark px-6 py-3 font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                  >
                    Reintentar
                  </button>
                </div>
              )}

            {!isLoading &&
              !errorMessage &&
              quotes.length === 0 && (
                <div className="py-16 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                    <ClipboardList
                      size={32}
                      aria-hidden="true"
                    />
                  </span>

                  <h2 className="mt-6 text-2xl font-bold text-bmg-dark">
                    {hasActiveFilters
                      ? 'No encontramos cotizaciones'
                      : 'Todavía no tienes cotizaciones'}
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-600">
                    {hasActiveFilters
                      ? 'No hay cotizaciones que coincidan con los filtros seleccionados.'
                      : 'Agrega productos al carrito y envía una solicitud. Luego aparecerá aquí.'}
                  </p>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-dark px-6 py-3 font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Mostrar todas
                    </button>
                  ) : (
                    <Link
                      to="/productos"
                      className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Ver productos
                    </Link>
                  )}
                </div>
              )}

            {!isLoading &&
              !errorMessage &&
              quotes.length > 0 && (
                <div className="mt-8 space-y-5">
                  {quotes.map((quote) => {
                    const status =
                      quote.status ??
                      'pending'

                    const items =
                      Array.isArray(
                        quote.items,
                      )
                        ? quote.items
                        : []

                    const totalItems =
                      Number(
                        quote.total_items,
                      ) || 0

                    return (
                      <article
                        key={quote.id}
                        className="rounded-3xl border border-neutral-200 bg-white p-5 transition hover:border-bmg-blue hover:shadow-md sm:p-6"
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-500">
                              Cotización
                            </p>

                            <h3 className="mt-1 break-words text-2xl font-bold text-bmg-dark">
                              {quote.number ??
                                `#${String(
                                  quote.id,
                                ).padStart(
                                  6,
                                  '0',
                                )}`}
                            </h3>

                            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-600">
                              <span className="inline-flex items-center gap-2">
                                <CalendarDays
                                  size={17}
                                  aria-hidden="true"
                                  className="shrink-0 text-bmg-blue"
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
                                  className="shrink-0 text-bmg-blue"
                                />

                                {totalItems}{' '}
                                {totalItems === 1
                                  ? 'unidad'
                                  : 'unidades'}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`inline-flex self-start rounded-full border px-3 py-1.5 text-xs font-bold ${
                              statusClasses[
                                status
                              ] ??
                              statusClasses.pending
                            }`}
                          >
                            {statusLabels[
                              status
                            ] ?? 'Pendiente'}
                          </span>
                        </div>

                        <div className="mt-6 border-t border-neutral-200 pt-5">
                          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-bmg-dark">
                                Productos incluidos
                              </p>

                              {items.length >
                              0 ? (
                                <ul className="mt-3 space-y-2">
                                  {items
                                    .slice(0, 3)
                                    .map(
                                      (
                                        item,
                                        index,
                                      ) => (
                                        <li
                                          key={`${quote.id}-${item.productId ?? index}-${index}`}
                                          className="break-words text-sm leading-6 text-neutral-600"
                                        >
                                          {Number(
                                            item.quantity,
                                          ) || 1}{' '}
                                          ×{' '}
                                          {item.name ??
                                            'Producto'}
                                        </li>
                                      ),
                                    )}
                                </ul>
                              ) : (
                                <p className="mt-3 text-sm text-neutral-500">
                                  No hay productos
                                  disponibles en esta
                                  cotización.
                                </p>
                              )}

                              {items.length >
                                3 && (
                                <p className="mt-2 text-sm font-semibold text-bmg-blue">
                                  +{' '}
                                  {items.length -
                                    3}{' '}
                                  productos más
                                </p>
                              )}
                            </div>

                            <div className="md:text-right">
                              {quote.has_visible_prices ? (
                                <>
                                  <p className="text-sm text-neutral-500">
                                    {quote.all_prices_visible
                                      ? 'Subtotal'
                                      : 'Subtotal parcial'}
                                  </p>

                                  <p className="mt-1 text-2xl font-bold text-bmg-dark">
                                    {currencyFormatter.format(
                                      Number(
                                        quote.subtotal,
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
                        </div>

                        <div className="mt-6 flex justify-end border-t border-neutral-200 pt-5">
                          <Link
                            to={`/mi-cuenta/cotizaciones/${quote.id}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-bmg-dark px-5 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

            {!isLoading &&
              !errorMessage &&
              pagination.lastPage > 1 && (
                <nav
                  aria-label="Paginación de cotizaciones"
                  className="mt-10 flex flex-wrap items-center justify-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        pagination.currentPage -
                          1,
                      )
                    }
                    disabled={
                      pagination.currentPage ===
                      1
                    }
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                  >
                    <ChevronLeft
                      size={17}
                      aria-hidden="true"
                    />

                    Anterior
                  </button>

                  <span className="text-sm font-semibold text-neutral-600">
                    Página{' '}
                    {pagination.currentPage}{' '}
                    de{' '}
                    {pagination.lastPage}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        pagination.currentPage +
                          1,
                      )
                    }
                    disabled={
                      pagination.currentPage ===
                      pagination.lastPage
                    }
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                  >
                    Siguiente

                    <ChevronRight
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                </nav>
              )}
          </section>
        </div>
      </main>
    </>
  )
}

export default ClientQuotes
