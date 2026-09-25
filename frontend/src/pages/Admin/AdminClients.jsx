import {
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
  Users,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import {
  getAdminClients,
  getAdminPriceLists,
  updateAdminClientPriceList,
} from '../../services/adminClientService'

const currencyFormatter =
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })

const CONTROL_TEXT_CLASS =
  'text-sm font-bold leading-5'

const CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
}

const NORMAL_CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '20px',
}

function PriceListDropdown({
  client,
  priceLists,
  isUpdating,
  onChange,
}) {
  const [isOpen, setIsOpen] =
    useState(false)

  const [
    menuPosition,
    setMenuPosition,
  ] = useState({
    top: 0,
    left: 0,
    width: 0,
  })

  const triggerRef =
    useRef(null)

  const menuRef =
    useRef(null)

  const currentPriceListId =
    client.price_list?.id ?? null

  const currentPriceListName =
    client.price_list?.name ??
    'Sin asignar'

  function updateMenuPosition() {
    if (!triggerRef.current) {
      return
    }

    const rect =
      triggerRef.current.getBoundingClientRect()

    setMenuPosition({
      top:
        rect.bottom +
        8,
      left:
        rect.left,
      width:
        Math.max(
          rect.width,
          224,
        ),
    })
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    updateMenuPosition()

    function handleClickOutside(event) {
      const clickedTrigger =
        triggerRef.current?.contains(
          event.target,
        )

      const clickedMenu =
        menuRef.current?.contains(
          event.target,
        )

      if (
        !clickedTrigger &&
        !clickedMenu
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    function handleViewportChange() {
      updateMenuPosition()
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    window.addEventListener(
      'resize',
      handleViewportChange,
    )

    window.addEventListener(
      'scroll',
      handleViewportChange,
      true,
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

      window.removeEventListener(
        'resize',
        handleViewportChange,
      )

      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true,
      )
    }
  }, [isOpen])

  async function handleSelect(
    priceListId,
  ) {
    setIsOpen(false)

    if (
      priceListId ===
        currentPriceListId ||
      isUpdating
    ) {
      return
    }

    await onChange(
      client.id,
      priceListId,
    )
  }

  function handleToggle() {
    if (isUpdating) {
      return
    }

    if (!isOpen) {
      updateMenuPosition()
    }

    setIsOpen(
      (current) => !current,
    )
  }

  const dropdownMenu =
    isOpen &&
    !isUpdating &&
    typeof document !==
      'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Asignar lista de precios"
            style={{
              position: 'fixed',
              top:
                menuPosition.top,
              left:
                menuPosition.left,
              width:
                menuPosition.width,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl"
          >
            <button
              type="button"
              role="option"
              aria-selected={
                currentPriceListId ===
                null
              }
              onClick={() =>
                handleSelect(null)
              }
              style={
                NORMAL_CONTROL_TEXT_STYLE
              }
              className="flex min-h-10 w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm font-normal leading-5 text-bmg-dark transition hover:bg-neutral-50"
            >
              <span>
                Sin asignar
              </span>

              {currentPriceListId ===
                null && (
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
                  currentPriceListId ===
                  priceList.id

                return (
                  <button
                    key={
                      priceList.id
                    }
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
                      NORMAL_CONTROL_TEXT_STYLE
                    }
                    className="flex min-h-10 w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm font-normal leading-5 text-bmg-dark transition hover:bg-bmg-blue/5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">
                        {
                          priceList.name
                        }
                      </span>

                      {priceList.is_general && (
                        <span className="mt-0.5 block text-xs font-normal text-bmg-blue">
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
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div className="w-full min-w-48">
        <button
          ref={triggerRef}
          type="button"
          disabled={isUpdating}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={
            handleToggle
          }
          style={
            NORMAL_CONTROL_TEXT_STYLE
          }
          className="inline-flex min-h-10 w-full items-center justify-between gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-normal leading-5 text-bmg-dark transition hover:border-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          <span className="truncate">
            {isUpdating
              ? 'Actualizando...'
              : currentPriceListName}
          </span>

          <ChevronDown
            size={16}
            strokeWidth={2.5}
            aria-hidden="true"
            className={`shrink-0 text-bmg-blue transition-transform duration-200 ${
              isOpen
                ? 'rotate-180'
                : ''
            }`}
          />
        </button>
      </div>

      {dropdownMenu}
    </>
  )
}

function AdminClients() {
  const [clients, setClients] =
    useState([])

  const [
    priceLists,
    setPriceLists,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('')

  const [
    updatingClientId,
    setUpdatingClientId,
  ] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [
          clientsResponse,
          listsResponse,
        ] = await Promise.all([
          getAdminClients(),
          getAdminPriceLists(),
        ])

        if (!isMounted) {
          return
        }

        setClients(
          Array.isArray(
            clientsResponse.data,
          )
            ? clientsResponse.data
            : [],
        )

        setPriceLists(
          Array.isArray(
            listsResponse,
          )
            ? listsResponse
            : [],
        )
      } catch (error) {
        console.error(
          'No se pudieron cargar los clientes:',
          error,
        )

        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos cargar los clientes.',
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
  }, [])

  const filteredClients =
    useMemo(
      () => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase()

        if (!normalizedSearch) {
          return clients
        }

        return clients.filter(
          (client) => {
            const searchableValues =
              [
                client.name,
                client.email,
                client.company,
                client.document_number,
                client.price_list
                  ?.name,
              ]

            return searchableValues.some(
              (value) =>
                String(
                  value ?? '',
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            )
          },
        )
      },
      [
        clients,
        searchTerm,
      ],
    )

  async function handlePriceListChange(
    clientId,
    priceListId,
  ) {
    setUpdatingClientId(
      clientId,
    )

    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await updateAdminClientPriceList(
          clientId,
          priceListId,
        )

      setClients(
        (currentClients) =>
          currentClients.map(
            (client) =>
              client.id ===
              clientId
                ? {
                    ...client,
                    price_list:
                      response.data
                        .price_list,
                  }
                : client,
          ),
      )

      setSuccessMessage(
        'Lista de precios actualizada correctamente.',
      )
    } catch (error) {
      console.error(
        'No se pudo actualizar la lista de precios:',
        error,
      )

      setErrorMessage(
        error.response?.data
          ?.message ||
          'No pudimos actualizar la lista de precios.',
      )
    } finally {
      setUpdatingClientId(
        null,
      )
    }
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

          Volver al Panel
        </Link>

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <Users
                size={26}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-semibold text-bmg-blue">
                Administración
              </p>

              <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Clientes
              </h1>

              <p className="mt-3 text-neutral-600">
                Consulta los clientes
                registrados, sus
                cotizaciones y las ventas
                realizadas.
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

        {isLoading && (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando clientes...
            </p>
          </section>
        )}

        {!isLoading &&
          clients.length === 0 && (
            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-bmg-dark">
                No hay clientes
                registrados
              </h2>

              <p className="mt-3 text-neutral-600">
                Los clientes aparecerán
                aquí cuando existan
                cuentas con rol de
                cliente.
              </p>
            </section>
          )}

        {!isLoading &&
          clients.length > 0 && (
            <>
              <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Clientes disponibles
                    </p>

                    <p className="mt-1 text-lg font-bold text-bmg-dark">
                      {
                        filteredClients.length
                      }{' '}
                      {filteredClients.length ===
                      1
                        ? 'cliente'
                        : 'clientes'}
                    </p>
                  </div>

                  <div className="w-full sm:w-80">
                    <label
                      htmlFor="client-search"
                      className="text-sm font-bold text-bmg-dark"
                    >
                      Buscar cliente
                    </label>

                    <div className="relative mt-2">
                      <Search
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        id="client-search"
                        type="search"
                        value={
                          searchTerm
                        }
                        onChange={(
                          event,
                        ) =>
                          setSearchTerm(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Nombre, email, empresa..."
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`min-h-11 w-full rounded-full border border-neutral-300 bg-white py-2 pl-11 pr-4 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition placeholder:font-normal placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {filteredClients.length ===
              0 ? (
                <section className="mt-6 rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-bmg-dark">
                    No encontramos
                    clientes
                  </h2>

                  <p className="mt-2 text-neutral-600">
                    Prueba con otro
                    nombre, email,
                    empresa o documento.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm('')
                    }
                    style={
                      CONTROL_TEXT_STYLE
                    }
                    className={`mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
                  >
                    Limpiar búsqueda
                  </button>
                </section>
              ) : (
                <section className="mt-6 rounded-3xl border border-neutral-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Cliente
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Empresa
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Lista de precios
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Cotizaciones
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Ventas
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Total vendido
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Acción
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-neutral-200">
                        {filteredClients.map(
                          (client) => (
                            <tr
                              key={
                                client.id
                              }
                              className="transition hover:bg-neutral-50"
                            >
                              <td className="px-5 py-4">
                                <p className="font-bold text-bmg-dark">
                                  {client.name ||
                                    'Sin nombre'}
                                </p>

                                <p className="mt-1 text-xs text-neutral-500">
                                  {client.email ||
                                    '-'}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-sm font-normal text-neutral-700">
                                {client.company ||
                                  '-'}
                              </td>

                              <td className="min-w-56 px-5 py-4">
                                <PriceListDropdown
                                  client={
                                    client
                                  }
                                  priceLists={
                                    priceLists
                                  }
                                  isUpdating={
                                    updatingClientId ===
                                    client.id
                                  }
                                  onChange={
                                    handlePriceListChange
                                  }
                                />
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-bmg-dark">
                                {client.quotes_count ??
                                  0}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-bmg-dark">
                                {client.sales_count ??
                                  0}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-bmg-dark">
                                {currencyFormatter.format(
                                  Number(
                                    client.sales_total ??
                                      0,
                                  ),
                                )}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <Link
                                  to={`/admin/clientes/${client.id}`}
                                  style={
                                    CONTROL_TEXT_STYLE
                                  }
                                  className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
                                >
                                  Ver detalle
                                </Link>
                              </td>
                            </tr>
                          ),
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

export default AdminClients