import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  FileText,
  Mail,
  Phone,
  ReceiptText,
  ShoppingCart,
  User,
  WalletCards,
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
  getAdminClient,
  getAdminPriceLists,
  updateAdminClient,
} from '../../services/adminClientService'

const currencyFormatter =
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const dateFormatter =
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

const CONTROL_TEXT_CLASS =
  'text-sm font-bold leading-5'

const CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
}

const STATUS_OPTIONS = [
  {
    value: '',
    label: 'Todas las cotizaciones',
  },
  {
    value: 'pending',
    label: 'Pendientes',
  },
  {
    value: 'answered',
    label: 'Respondidas',
  },
  {
    value: 'approved',
    label: 'Aprobadas',
  },
  {
    value: 'rejected',
    label: 'Rechazadas',
  },
  {
    value: 'processed',
    label: 'Procesadas',
  },
]

const STATUS_LABELS = {
  pending: 'Pendiente',
  answered: 'Respondida',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  processed: 'Procesada',
}

const STATUS_STYLES = {
  pending:
    'border-[#F2B705] text-bmg-dark',

  answered:
    'border-bmg-blue text-bmg-dark',

  approved:
    'border-[#22A06B] text-bmg-dark',

  rejected:
    'border-[#D64545] text-bmg-dark',

  processed:
    'border-[#15803D] text-bmg-dark',
}

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-'
  }

  const numericValue =
    Number(value)

  if (!Number.isFinite(numericValue)) {
    return '-'
  }

  return currencyFormatter.format(
    numericValue,
  )
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return dateFormatter.format(date)
}

function getQuoteCode(quote) {
  if (quote?.code) {
    return quote.code
  }

  const id = String(
    quote?.id ?? '',
  ).padStart(
    6,
    '0',
  )

  const date =
    quote?.created_at
      ? new Date(
          quote.created_at,
        )
      : new Date()

  const year =
    Number.isNaN(
      date.getTime(),
    )
      ? new Date().getFullYear()
      : date.getFullYear()

  return `COT-${year}-${id}`
}

function PriceListDropdown({
  value,
  priceLists,
  disabled,
  onChange,
}) {
  const [isOpen, setIsOpen] =
    useState(false)

  const dropdownRef =
    useRef(null)

  const selectedPriceList =
    priceLists.find(
      (priceList) =>
        priceList.id === value,
    )

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

  function handleSelect(priceListId) {
    onChange(priceListId)
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        style={CONTROL_TEXT_STYLE}
        className={`inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition hover:border-bmg-blue focus-visible:border-bmg-blue focus-visible:ring-4 focus-visible:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100`}
      >
        <span className="truncate">
          {selectedPriceList?.name ??
            'Sin asignar'}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className={`shrink-0 text-bmg-blue transition-transform ${
            isOpen
              ? 'rotate-180'
              : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          role="listbox"
          aria-label="Seleccionar lista de precios"
          className="absolute left-0 z-50 mt-2 w-full min-w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={
              value === null
            }
            onClick={() =>
              handleSelect(null)
            }
            style={
              CONTROL_TEXT_STYLE
            }
            className={`flex min-h-10 w-full items-center justify-between rounded-xl px-4 py-2 text-left ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:bg-neutral-50`}
          >
            Sin asignar

            {value === null && (
              <Check
                size={16}
                strokeWidth={2.5}
                className="text-bmg-blue"
                aria-hidden="true"
              />
            )}
          </button>

          {priceLists.map(
            (priceList) => {
              const isSelected =
                value ===
                priceList.id

              return (
                <button
                  key={priceList.id}
                  type="button"
                  role="option"
                  aria-selected={
                    isSelected
                  }
                  onClick={() =>
                    handleSelect(
                      priceList.id,
                    )
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-4 py-2 text-left ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:bg-bmg-blue/5`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">
                      {priceList.name}
                    </span>

                    {priceList.is_general && (
                      <span className="block text-xs font-semibold text-bmg-blue">
                        Lista general
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      className="shrink-0 text-bmg-blue"
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

function QuoteStatusFilter({
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] =
    useState(false)

  const dropdownRef =
    useRef(null)

  const selectedOption =
    STATUS_OPTIONS.find(
      (option) =>
        option.value === value,
    ) ?? STATUS_OPTIONS[0]

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

  function handleSelect(status) {
    onChange(status)
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className="relative w-full"
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        style={CONTROL_TEXT_STYLE}
        className={`inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
      >
        <span className="truncate">
          {selectedOption.label}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className={`shrink-0 text-bmg-blue transition-transform ${
            isOpen
              ? 'rotate-180'
              : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Filtrar cotizaciones por estado"
          className="absolute right-0 z-50 mt-2 w-full min-w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl"
        >
          {STATUS_OPTIONS.map(
            (option) => {
              const isSelected =
                option.value === value

              return (
                <button
                  key={
                    option.value ||
                    'all'
                  }
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
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`flex min-h-10 w-full items-center justify-between rounded-xl px-4 py-2 text-left ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:bg-bmg-blue/5`}
                >
                  <span>
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      className="text-bmg-blue"
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

function AdminClientDetail() {
  const {
    clientId,
  } = useParams()

  const [
    client,
    setClient,
  ] = useState(null)

  const [
    priceLists,
    setPriceLists,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isEditing,
    setIsEditing,
  ] = useState(false)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    quoteStatusFilter,
    setQuoteStatusFilter,
  ] = useState('')

  const [
    formData,
    setFormData,
  ] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    document_type: '',
    document_number: '',
    price_list_id: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [
          clientData,
          listsData,
        ] = await Promise.all([
          getAdminClient(
            clientId,
          ),
          getAdminPriceLists(),
        ])

        if (!isMounted) {
          return
        }

        setClient(
          clientData,
        )

        setPriceLists(
          Array.isArray(
            listsData,
          )
            ? listsData
            : [],
        )

        setFormData({
          name:
            clientData.name ?? '',

          email:
            clientData.email ?? '',

          phone:
            clientData.phone ?? '',

          company:
            clientData.company ?? '',

          document_type:
            clientData.document_type ??
            '',

          document_number:
            clientData.document_number ??
            '',

          price_list_id:
            clientData.price_list
              ?.id ?? null,
        })
      } catch (error) {
        console.error(
          'No se pudo cargar el cliente:',
          error,
        )

        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos cargar la información del cliente.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [clientId])

  function handleInputChange(
    event,
  ) {
    const {
      name,
      value,
    } = event.target

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      }),
    )
  }

  function handleEdit() {
    setFormData({
      name:
        client.name ?? '',

      email:
        client.email ?? '',

      phone:
        client.phone ?? '',

      company:
        client.company ?? '',

      document_type:
        client.document_type ?? '',

      document_number:
        client.document_number ?? '',

      price_list_id:
        client.price_list?.id ??
        null,
    })

    setErrorMessage('')
    setSuccessMessage('')
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
    setErrorMessage('')
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await updateAdminClient(
          client.id,
          {
            name:
              formData.name.trim(),

            email:
              formData.email.trim(),

            phone:
              formData.phone.trim() ||
              null,

            company:
              formData.company.trim() ||
              null,

            document_type:
              formData.document_type.trim() ||
              null,

            document_number:
              formData.document_number.trim() ||
              null,

            price_list_id:
              formData.price_list_id,
          },
        )

      setClient(
        (currentClient) => ({
          ...currentClient,
          ...response.data,
        }),
      )

      setIsEditing(false)

      setSuccessMessage(
        response.message ||
          'Datos del cliente actualizados correctamente.',
      )
    } catch (error) {
      console.error(
        'No se pudo actualizar el cliente:',
        error,
      )

      const validationErrors =
        error.response?.data
          ?.errors

      if (validationErrors) {
        const firstError =
          Object.values(
            validationErrors,
          )
            .flat()
            .at(0)

        setErrorMessage(
          firstError ||
            'Revisa los datos ingresados.',
        )
      } else {
        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos actualizar los datos del cliente.',
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando cliente...
            </p>
          </section>
        </div>
      </main>
    )
  }

  if (
    errorMessage &&
    !client
  ) {
    return (
      <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/admin/clientes"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Volver a Clientes
          </Link>

          <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
            <p className="font-bold text-red-700">
              {errorMessage}
            </p>
          </section>
        </div>
      </main>
    )
  }

  const quotes =
    Array.isArray(
      client?.quotes,
    )
      ? client.quotes
      : []

  const filteredQuotes =
    quoteStatusFilter
      ? quotes.filter(
          (quote) =>
            quote.status ===
            quoteStatusFilter,
        )
      : quotes

  const quotesCount =
    Number(
      client?.quotes_count ??
        quotes.length,
    )

  const salesCount =
    Number(
      client?.sales_count ??
        quotes.filter(
          (quote) =>
            quote.status ===
            'processed',
        ).length,
    )

  const calculatedSalesTotal =
    quotes
      .filter(
        (quote) =>
          quote.status ===
          'processed',
      )
      .reduce(
        (
          total,
          quote,
        ) =>
          total +
          Number(
            quote.final_total ??
              quote.subtotal ??
              0,
          ),
        0,
      )

  const salesTotal =
    client?.sales_total !==
      null &&
    client?.sales_total !==
      undefined
      ? Number(
          client.sales_total,
        )
      : calculatedSalesTotal

  const priceListName =
    client?.price_list?.name ??
    'Sin lista asignada'

  const documentLabel =
    client?.document_type ||
    client?.document_number
      ? [
          client.document_type,
          client.document_number,
        ]
          .filter(Boolean)
          .join(' ')
      : '-'

  return (
    <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Volver a Clientes
        </Link>

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <User
                size={26}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-semibold text-bmg-blue">
                Administración
              </p>

              <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                {client.name ||
                  'Cliente'}
              </h1>

              <p className="mt-3 text-neutral-600">
                Consulta la información del
                cliente, sus cotizaciones y
                las ventas realizadas.
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

        {successMessage && (
          <p
            role="status"
            className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700"
          >
            {successMessage}
          </p>
        )}

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <FileText
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Cotizaciones
            </p>

            <p className="mt-1 text-3xl font-bold text-bmg-dark">
              {quotesCount}
            </p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <ShoppingCart
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Ventas
            </p>

            <p className="mt-1 text-3xl font-bold text-bmg-dark">
              {salesCount}
            </p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <WalletCards
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Total vendido
            </p>

            <p className="mt-1 text-3xl font-bold text-bmg-dark">
              {formatCurrency(
                salesTotal,
              )}
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <User
                size={22}
                className="text-bmg-blue"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-bmg-dark">
                Datos del cliente
              </h2>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={
                  handleEdit
                }
                style={
                  CONTROL_TEXT_STYLE
                }
                className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
              >
                Editar datos
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-neutral-500">
                  Nombre
                </p>

                <p className="mt-1 font-bold text-bmg-dark">
                  {client.name || '-'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Mail
                    size={16}
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold">
                    Email
                  </p>
                </div>

                <p className="mt-1 break-words text-bmg-dark">
                  {client.email || '-'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Phone
                    size={16}
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold">
                    Teléfono
                  </p>
                </div>

                <p className="mt-1 text-bmg-dark">
                  {client.phone || '-'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Building2
                    size={16}
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold">
                    Empresa
                  </p>
                </div>

                <p className="mt-1 text-bmg-dark">
                  {client.company || '-'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <ReceiptText
                    size={16}
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold">
                    Documento
                  </p>
                </div>

                <p className="mt-1 text-bmg-dark">
                  {documentLabel}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <WalletCards
                    size={16}
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold">
                    Lista de precios
                  </p>
                </div>

                <p className="mt-1 font-bold text-bmg-dark">
                  {priceListName}
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
              className="mt-6"
            >
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Nombre
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={
                      formData.name
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Teléfono
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Empresa
                  </label>

                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={
                      formData.company
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="document_type"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Tipo de documento
                  </label>

                  <input
                    id="document_type"
                    name="document_type"
                    type="text"
                    value={
                      formData.document_type
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="document_number"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Número de documento
                  </label>

                  <input
                    id="document_number"
                    name="document_number"
                    type="text"
                    value={
                      formData.document_number
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-sm font-bold text-bmg-dark">
                    Lista de precios
                  </p>

                  <div className="mt-2 max-w-sm">
                    <PriceListDropdown
                      value={
                        formData.price_list_id
                      }
                      priceLists={
                        priceLists
                      }
                      disabled={
                        isSaving
                      }
                      onChange={(
                        priceListId,
                      ) =>
                        setFormData(
                          (current) => ({
                            ...current,
                            price_list_id:
                              priceListId,
                          }),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    isSaving
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-5 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-60`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-bmg-dark px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60`}
                >
                  {isSaving
                    ? 'Guardando...'
                    : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-bmg-dark">
                Cotizaciones del cliente
              </h2>

              <p className="mt-1 text-sm text-neutral-600">
                Historial de solicitudes y
                ventas asociadas al cliente.
              </p>

              <p className="mt-2 text-sm font-bold text-bmg-dark">
                {filteredQuotes.length}{' '}
                {filteredQuotes.length === 1
                  ? 'cotización'
                  : 'cotizaciones'}
              </p>
            </div>

            <div className="w-full sm:w-64">
              <p className="text-sm font-bold text-bmg-dark">
                Filtrar por estado
              </p>

              <div className="mt-2">
                <QuoteStatusFilter
                  value={
                    quoteStatusFilter
                  }
                  onChange={
                    setQuoteStatusFilter
                  }
                />
              </div>
            </div>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <FileText
                size={32}
                className="mx-auto text-neutral-400"
                aria-hidden="true"
              />

              <p className="mt-4 font-bold text-bmg-dark">
                No hay cotizaciones
              </p>

              <p className="mt-2 text-sm text-neutral-600">
                {quoteStatusFilter
                  ? 'No hay cotizaciones con el estado seleccionado.'
                  : 'Este cliente todavía no tiene cotizaciones registradas.'}
              </p>

              {quoteStatusFilter && (
                <button
                  type="button"
                  onClick={() =>
                    setQuoteStatusFilter('')
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
                >
                  Mostrar todas
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Cotización
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
                        const statusLabel =
                          STATUS_LABELS[
                            quote.status
                          ] ??
                          quote.status ??
                          '-'

                        const statusStyle =
                          STATUS_STYLES[
                            quote.status
                          ] ??
                          'border-neutral-300 text-bmg-dark'

                        const finalTotal =
                          quote.final_total !==
                            null &&
                          quote.final_total !==
                            undefined
                            ? quote.final_total
                            : quote.subtotal

                        const wasModified =
                          quote.final_total !==
                            null &&
                          quote.final_total !==
                            undefined &&
                          Number(
                            quote.final_total,
                          ) !==
                            Number(
                              quote.subtotal,
                            )

                        return (
                          <tr
                            key={quote.id}
                            className="transition hover:bg-neutral-50"
                          >
                            <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-bmg-dark">
                              {getQuoteCode(
                                quote,
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-600">
                              {formatDate(
                                quote.created_at,
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-bmg-dark">
                              {quote.total_items ??
                                0}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-600">
                                {formatCurrency(
                                    quote.subtotal,
                                )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <p
                                className={`text-sm ${
                                  wasModified
                                    ? 'text-bmg-blue'
                                    : 'text-bmg-dark'
                                }`}
                              >
                                {formatCurrency(
                                  finalTotal,
                                )}
                              </p>

                              {wasModified && (
                                <p className="mt-1 text-xs text-bmg-blue">
                                  Modificado
                                </p>
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                style={
                                  CONTROL_TEXT_STYLE
                                }
                                className={`inline-flex min-h-10 min-w-32 items-center justify-center rounded-full border bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} ${statusStyle}`}
                              >
                                {statusLabel}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <Link
                                to={`/admin/cotizaciones/${quote.id}`}
                                style={
                                  CONTROL_TEXT_STYLE
                                }
                                className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
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
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminClientDetail