import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getAdminQuote,
  updateQuoteFinalTotal,
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

    await onStatusChange(status)
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

function AdminQuoteDetail() {
  const { quoteId } = useParams()

  const [quote, setQuote] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isUpdating, setIsUpdating] =
    useState(false)

  const [
    isEditingFinalTotal,
    setIsEditingFinalTotal,
  ] = useState(false)

  const [
    finalTotalValue,
    setFinalTotalValue,
  ] = useState('')

  const [
    isSavingFinalTotal,
    setIsSavingFinalTotal,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadQuote() {
      try {
        const response =
          await getAdminQuote(quoteId)

        if (!isMounted) {
          return
        }

        setQuote(response)

        setFinalTotalValue(
          response.final_total !== null &&
            response.final_total !== undefined
            ? String(response.final_total)
            : response.subtotal !== null &&
                response.subtotal !== undefined
              ? String(response.subtotal)
              : '',
        )
      } catch (error) {
        console.error(
          'No se pudo cargar la cotización:',
          error,
        )

        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data?.message ||
            'No pudimos cargar la cotización.',
        )
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

  async function handleStatusChange(
    status,
  ) {
    setIsUpdating(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await updateQuoteStatus(
          quote.id,
          status,
        )

      setQuote((currentQuote) => ({
        ...currentQuote,
        ...response.data,
      }))
    } catch (error) {
      console.error(
        'No se pudo actualizar el estado:',
        error,
      )

      setErrorMessage(
        error.response?.data?.message ||
          'No pudimos actualizar el estado.',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  function handleEditFinalTotal() {
    setFinalTotalValue(
      quote.final_total !== null &&
        quote.final_total !== undefined
        ? String(quote.final_total)
        : quote.subtotal !== null &&
            quote.subtotal !== undefined
          ? String(quote.subtotal)
          : '',
    )

    setErrorMessage('')
    setSuccessMessage('')
    setIsEditingFinalTotal(true)
  }

  function handleCancelFinalTotal() {
    setFinalTotalValue(
      quote.final_total !== null &&
        quote.final_total !== undefined
        ? String(quote.final_total)
        : quote.subtotal !== null &&
            quote.subtotal !== undefined
          ? String(quote.subtotal)
          : '',
    )

    setIsEditingFinalTotal(false)
  }

  async function handleSaveFinalTotal(
    event,
  ) {
    event.preventDefault()

    const normalizedValue =
      Number(finalTotalValue)

    if (
      !Number.isFinite(normalizedValue) ||
      normalizedValue < 0
    ) {
      setErrorMessage(
        'Ingresa un total final válido.',
      )

      return
    }

    setIsSavingFinalTotal(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await updateQuoteFinalTotal(
          quote.id,
          normalizedValue,
        )

      setQuote((currentQuote) => ({
        ...currentQuote,
        ...response.data,
      }))

      setFinalTotalValue(
        String(
          response.data.final_total ??
            normalizedValue,
        ),
      )

      setIsEditingFinalTotal(false)

      setSuccessMessage(
        'Total final actualizado correctamente.',
      )
    } catch (error) {
      console.error(
        'No se pudo actualizar el total final:',
        error,
      )

      setErrorMessage(
        error.response?.data?.message ||
          'No pudimos actualizar el total final.',
      )
    } finally {
      setIsSavingFinalTotal(false)
    }
  }

  if (isLoading) {
    return (
      <main className="bg-neutral-50 px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-bold text-bmg-dark">
            Cargando cotización...
          </p>
        </div>
      </main>
    )
  }

  if (errorMessage || !quote) {
    return (
      <main className="bg-neutral-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/admin/cotizaciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Volver a Cotizaciones
          </Link>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center text-red-700">
            <p className="font-bold">
              {errorMessage ||
                'La cotización no está disponible.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin/cotizaciones"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Volver a Cotizaciones
        </Link>

        <section className="mt-6 overflow-visible rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <FileText
                  size={26}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-semibold text-bmg-blue">
                  Cotización
                </p>

                <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                  {quote.number}
                </h1>

                <p className="mt-3 text-neutral-600">
                  {quote.created_at
                    ? dateFormatter.format(
                        new Date(
                          quote.created_at,
                        ),
                      )
                    : '-'}
                </p>
              </div>
            </div>

            <div className="w-full max-w-xs">
              <p className="text-sm font-bold text-bmg-dark">
                Estado
              </p>

              <div className="mt-2">
                <StatusDropdown
                  quote={quote}
                  isUpdating={isUpdating}
                  onStatusChange={
                    handleStatusChange
                  }
                />
              </div>
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

        {successMessage && (
          <p
            role="status"
            className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700"
          >
            {successMessage}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-bmg-dark">
                Datos del cliente
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Nombre
                  </p>

                  <p className="mt-1 font-semibold text-bmg-dark">
                    {quote.customer?.name || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Empresa
                  </p>

                  <p className="mt-1 font-semibold text-bmg-dark">
                    {quote.customer?.company || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Correo
                  </p>

                  <p className="mt-1 break-words font-semibold text-bmg-dark">
                    {quote.customer?.email || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Teléfono
                  </p>

                  <p className="mt-1 font-semibold text-bmg-dark">
                    {quote.customer?.phone || '-'}
                  </p>
                </div>
              </div>

              {quote.message && (
                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Mensaje
                  </p>

                  <p className="mt-2 whitespace-pre-wrap leading-7 text-neutral-700">
                    {quote.message}
                  </p>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-5">
                <h2 className="text-xl font-bold text-bmg-dark">
                  Productos cotizados
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Producto
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Cantidad
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Unitario
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200">
                    {(quote.items ?? []).map(
                      (item) => (
                        <tr
                          key={`${item.productId}-${item.code}`}
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-bmg-dark">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Código: {item.code}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right font-semibold text-neutral-700">
                            {item.quantity}
                          </td>

                          <td className="px-5 py-4 text-right font-semibold text-neutral-700">
                            {item.canViewPrice
                              ? currencyFormatter.format(
                                  Number(
                                    item.unitPrice,
                                  ),
                                )
                              : '-'}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-bmg-dark">
                            {item.canViewPrice
                              ? currencyFormatter.format(
                                  Number(
                                    item.total,
                                  ),
                                )
                              : '-'}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-bmg-dark">
              Resumen
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-600">
                  Unidades
                </span>

                <span className="font-bold text-bmg-dark">
                  {quote.total_items ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-600">
                  Subtotal cotizado
                </span>

                <span className="font-bold text-bmg-dark">
                  {quote.subtotal !== null
                    ? currencyFormatter.format(
                        Number(
                          quote.subtotal,
                        ),
                      )
                    : '-'}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                {!isEditingFinalTotal ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-bmg-dark">
                        Total final
                      </span>

                      <span className="text-xl font-bold text-bmg-dark">
                        {quote.final_total !== null
                          ? currencyFormatter.format(
                              Number(
                                quote.final_total,
                              ),
                            )
                          : quote.subtotal !== null
                            ? currencyFormatter.format(
                                Number(
                                  quote.subtotal,
                                ),
                              )
                            : '-'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleEditFinalTotal
                      }
                      style={
                        CONTROL_TEXT_STYLE
                      }
                      className={`mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
                    >
                      Editar total final
                    </button>
                  </>
                ) : (
                  <form
                    onSubmit={
                      handleSaveFinalTotal
                    }
                  >
                    <label
                      htmlFor="final-total"
                      className="text-sm font-bold text-bmg-dark"
                    >
                      Total final
                    </label>

                    <input
                      id="final-total"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        finalTotalValue
                      }
                      onChange={(event) =>
                        setFinalTotalValue(
                          event.target.value,
                        )
                      }
                      disabled={
                        isSavingFinalTotal
                      }
                      style={
                        CONTROL_TEXT_STYLE
                      }
                      className={`mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:bg-neutral-100`}
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={
                          handleCancelFinalTotal
                        }
                        disabled={
                          isSavingFinalTotal
                        }
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={
                          isSavingFinalTotal
                        }
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-bmg-dark px-4 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60`}
                      >
                        {isSavingFinalTotal
                          ? 'Guardando...'
                          : 'Guardar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default AdminQuoteDetail