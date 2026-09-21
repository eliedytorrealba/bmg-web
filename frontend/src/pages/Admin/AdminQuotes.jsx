import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  Filter,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  getAdminQuotes,
  updateQuoteStatus,
} from '../../services/quoteService'

const currencyFormatter =
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })

const dateFormatter =
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pendiente',
  },
  {
    value: 'answered',
    label: 'Respondida',
  },
  {
    value: 'approved',
    label: 'Aprobada',
  },
  {
    value: 'rejected',
    label: 'Rechazada',
  },
  {
    value: 'processed',
    label: 'Procesada',
  },
]

const CONTROL_TEXT_CLASS =
  'text-sm font-bold leading-5'

const CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
}

const STATUS_STYLES = {
  pending: {
    button:
      'border-[#F2B705] text-bmg-dark hover:bg-[#FFF9E6]',
    menu:
      'text-bmg-dark hover:bg-[#FFF9E6]',
    icon:
      'text-[#D99F00]',
  },

  answered: {
    button:
      'border-bmg-blue text-bmg-dark hover:bg-bmg-blue/5',
    menu:
      'text-bmg-dark hover:bg-bmg-blue/5',
    icon:
      'text-bmg-blue',
  },

  approved: {
    button:
      'border-[#22A06B] text-bmg-dark hover:bg-[#ECF9F3]',
    menu:
      'text-bmg-dark hover:bg-[#ECF9F3]',
    icon:
      'text-[#167A50]',
  },

  rejected: {
    button:
      'border-[#D64545] text-bmg-dark hover:bg-[#FFF1F0]',
    menu:
      'text-bmg-dark hover:bg-[#FFF1F0]',
    icon:
      'text-[#B42318]',
  },

  processed: {
    button:
      'border-[#15803D] text-bmg-dark hover:bg-[#ECFDF3]',
    menu:
      'text-bmg-dark hover:bg-[#ECFDF3]',
    icon:
      'text-[#15803D]',
  },
}

const DEFAULT_STATUS_STYLE = {
  button:
    'border-bmg-dark text-bmg-dark hover:border-bmg-blue hover:text-bmg-blue',
  menu:
    'text-bmg-dark hover:bg-neutral-50',
  icon:
    'text-bmg-dark',
}

function StatusDropdown({
  quote,
  isUpdating,
  onStatusChange,
}) {
  const [isOpen, setIsOpen] =
    useState(false)

  const dropdownRef = useRef(null)

  const currentOption =
    STATUS_OPTIONS.find(
      (option) =>
        option.value === quote.status,
    ) ?? STATUS_OPTIONS[0]

  const currentStyle =
    STATUS_STYLES[quote.status] ??
    DEFAULT_STATUS_STYLE

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target,
        )
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )

      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [])

  async function handleSelect(status) {
    setIsOpen(false)

    if (
      status === quote.status ||
      isUpdating
    ) {
      return
    }

    await onStatusChange(
      quote.id,
      status,
    )
  }

  return (
    <div
      ref={dropdownRef}
      className="relative w-full"
    >
      <button
        type="button"
        disabled={isUpdating}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((current) => !current)
        }
        style={CONTROL_TEXT_STYLE}
        className={`inline-flex min-h-10 w-full items-center justify-between gap-3 rounded-full border bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${currentStyle.button}`}
      >
        <span className="whitespace-nowrap">
          {isUpdating
            ? 'Actualizando...'
            : currentOption.label}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${currentStyle.icon} ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && !isUpdating && (
        <div
          role="listbox"
          aria-label="Cambiar estado"
          className="absolute right-0 z-50 mt-2 w-full min-w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl"
        >
          {STATUS_OPTIONS.map(
            (option) => {
              const optionStyle =
                STATUS_STYLES[
                  option.value
                ] ??
                DEFAULT_STATUS_STYLE

              const isSelected =
                quote.status ===
                option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={
                    isSelected
                  }
                  onClick={() =>
                    handleSelect(
                      option.value,
                    )
                  }
                  style={CONTROL_TEXT_STYLE}
                  className={`flex min-h-10 w-full items-center justify-between rounded-xl px-4 py-2 text-left ${CONTROL_TEXT_CLASS} transition ${optionStyle.menu}`}
                >
                  <span>
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            },
          )}
        </div>
      )}
    </div>
  )
}

function AdminQuotes() {
  const [quotes, setQuotes] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    updatingQuoteId,
    setUpdatingQuoteId,
  ] = useState(null)

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadQuotes() {
      try {
        const response =
          await getAdminQuotes()

        if (!isMounted) {
          return
        }

        setQuotes(
          Array.isArray(response.data)
            ? response.data
            : [],
        )
      } catch (error) {
        console.error(
          'No se pudieron cargar las cotizaciones:',
          error,
        )

        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos cargar las cotizaciones.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuotes()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredQuotes = useMemo(
    () =>
      statusFilter
        ? quotes.filter(
            (quote) =>
              quote.status ===
              statusFilter,
          )
        : quotes,
    [
      quotes,
      statusFilter,
    ],
  )

  const selectedStatusLabel =
    STATUS_OPTIONS.find(
      (option) =>
        option.value === statusFilter,
    )?.label

  async function handleStatusChange(
    quoteId,
    status,
  ) {
    setUpdatingQuoteId(quoteId)
    setErrorMessage('')

    try {
      const response =
        await updateQuoteStatus(
          quoteId,
          status,
        )

      setQuotes((currentQuotes) =>
        currentQuotes.map((quote) =>
          quote.id === quoteId
            ? {
                ...quote,
                ...response.data,
              }
            : quote,
        ),
      )
    } catch (error) {
      console.error(
        'No se pudo actualizar la cotización:',
        error,
      )

      setErrorMessage(
        error.response?.data
          ?.message ||
          'No pudimos actualizar el estado de la cotización.',
      )
    } finally {
      setUpdatingQuoteId(null)
    }
  }

  function handleStatusFilterChange(
    event,
  ) {
    setStatusFilter(
      event.target.value,
    )
  }

  return (
    <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Volver al panel
        </Link>

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <FileText
                size={26}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-semibold text-bmg-blue">
                Administración
              </p>

              <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Cotizaciones
              </h1>

              <p className="mt-3 text-neutral-600">
                Consulta y gestiona las
                solicitudes de cotización
                enviadas por los clientes.
              </p>
            </div>
          </div>
        </section>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          >
            {errorMessage}
          </p>
        )}

        {isLoading && (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando cotizaciones...
            </p>
          </section>
        )}

        {!isLoading &&
          quotes.length === 0 && (
            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-bmg-dark">
                No hay cotizaciones
              </h2>

              <p className="mt-3 text-neutral-600">
                Cuando un cliente envíe una
                solicitud, aparecerá aquí.
              </p>
            </section>
          )}

        {!isLoading &&
          quotes.length > 0 && (
            <>
              <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Cotizaciones disponibles
                    </p>

                    <p className="mt-1 text-lg font-bold text-bmg-dark">
                      {filteredQuotes.length}{' '}
                      {filteredQuotes.length ===
                      1
                        ? 'cotización'
                        : 'cotizaciones'}
                    </p>

                    {statusFilter && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Estado:{' '}
                        {
                          selectedStatusLabel
                        }
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-64">
                    <label
                      htmlFor="status-filter"
                      className="text-sm font-bold text-bmg-dark"
                    >
                      Filtrar por estado
                    </label>

                    <div className="relative mt-2">
                      <Filter
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={
                          handleStatusFilterChange
                        }
                        style={CONTROL_TEXT_STYLE}
                        className={`min-h-11 w-full appearance-none rounded-full border border-neutral-300 bg-white py-2 pl-11 pr-10 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15`}
                      >
                        <option value="">
                          Todos los estados
                        </option>

                        {STATUS_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {filteredQuotes.length ===
              0 ? (
                <section className="mt-6 rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-bmg-dark">
                    No hay cotizaciones con
                    este estado
                  </h2>

                  <p className="mt-2 text-neutral-600">
                    Prueba seleccionando otro
                    estado o mostrando todas
                    las cotizaciones.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter('')
                    }
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-bmg-dark px-6 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                  >
                    Mostrar todas
                  </button>
                </section>
              ) : (
                <section className="mt-6 overflow-visible rounded-3xl border border-neutral-200 bg-white shadow-sm">
                  <div className="overflow-x-auto overflow-y-visible">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Cotización
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Cliente
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Fecha
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Productos
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Subtotal
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Total final
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Estado
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Acción
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-neutral-200">
                        {filteredQuotes.map(
                          (quote) => {
                            const finalTotal =
                              quote.final_total !==
                                null &&
                              quote.final_total !==
                                undefined
                                ? Number(
                                    quote.final_total,
                                  )
                                : quote.subtotal !==
                                      null &&
                                    quote.subtotal !==
                                      undefined
                                  ? Number(
                                      quote.subtotal,
                                    )
                                  : null

                            const subtotal =
                              quote.subtotal !==
                                null &&
                              quote.subtotal !==
                                undefined
                                ? Number(
                                    quote.subtotal,
                                  )
                                : null

                            const totalWasEdited =
                              subtotal !== null &&
                              finalTotal !== null &&
                              subtotal !==
                                finalTotal

                            return (
                              <tr
                                key={quote.id}
                                className="transition hover:bg-neutral-50"
                              >
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-bmg-dark">
                                  {
                                    quote.number
                                  }
                                </td>

                                <td className="px-5 py-4 text-sm text-neutral-700">
                                  <p className="font-normal text-bmg-dark">
                                    {quote
                                      .customer
                                      ?.name ||
                                      quote.user
                                        ?.name ||
                                      'Sin nombre'}
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-500">
                                    {quote
                                      .customer
                                      ?.email ||
                                      quote.user
                                        ?.email ||
                                      '-'}
                                  </p>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-neutral-600">
                                  {quote.created_at
                                    ? dateFormatter.format(
                                        new Date(
                                          quote.created_at,
                                        ),
                                      )
                                    : '-'}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-neutral-700">
                                  {quote.total_items ??
                                    0}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-neutral-600">
                                  {subtotal !== null
                                    ? currencyFormatter.format(
                                        subtotal,
                                      )
                                    : '-'}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                                  <p
                                    className={`text-sm font-normal ${
                                      totalWasEdited
                                        ? 'text-bmg-blue'
                                        : 'text-bmg-dark'
                                    }`}
                                  >
                                    {finalTotal !==
                                    null
                                      ? currencyFormatter.format(
                                          finalTotal,
                                        )
                                      : '-'}
                                  </p>

                                  {totalWasEdited && (
                                    <p className="mt-1 text-xs font-normal text-bmg-blue">
                                      Modificado
                                    </p>
                                  )}
                                </td>

                                <td className="min-w-52 px-5 py-4">
                                  <StatusDropdown
                                    quote={
                                      quote
                                    }
                                    isUpdating={
                                      updatingQuoteId ===
                                      quote.id
                                    }
                                    onStatusChange={
                                      handleStatusChange
                                    }
                                  />
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                                  <Link
                                    to={`/admin/cotizaciones/${quote.id}`}
                                    style={
                                      CONTROL_TEXT_STYLE
                                    }
                                    className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
                                  >
                                    Ver detalle
                                  </Link>
                                </td>
                              </tr>
                            )
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
      </div>
    </main>
  )
}

export default AdminQuotes