import {
  ArrowLeft,
  CircleDollarSign,
  Plus,
  Search,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  createAdminPriceList,
  getAdminPriceLists,
} from '../../services/adminPriceListService'

const CONTROL_TEXT_CLASS =
  'text-sm font-bold leading-5'

const CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
}

function AdminPriceLists() {
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
    isCreating,
    setIsCreating,
  ] = useState(false)

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false)

  const [
    newPriceList,
    setNewPriceList,
  ] = useState({
    name: '',
    code: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadPriceLists() {
      try {
        const response =
          await getAdminPriceLists()

        if (!isMounted) {
          return
        }

        setPriceLists(
          Array.isArray(response)
            ? response
            : [],
        )
      } catch (error) {
        console.error(
          'No se pudieron cargar las listas de precios:',
          error,
        )

        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos cargar las listas de precios.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPriceLists()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredPriceLists =
    useMemo(
      () => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase()

        if (!normalizedSearch) {
          return priceLists
        }

        return priceLists.filter(
          (priceList) => {
            const searchableValues =
              [
                priceList.name,
                priceList.code,
                priceList.is_general
                  ? 'general'
                  : 'personalizada',
                priceList.is_active
                  ? 'activa'
                  : 'inactiva',
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
        priceLists,
        searchTerm,
      ],
    )

  function handleInputChange(
    event,
  ) {
    const {
      name,
      value,
    } = event.target

    setNewPriceList(
      (current) => ({
        ...current,
        [name]: value,
      }),
    )
  }

  function handleCancelCreate() {
    if (isCreating) {
      return
    }

    setShowCreateForm(false)

    setNewPriceList({
      name: '',
      code: '',
    })

    setErrorMessage('')
  }

  async function handleCreatePriceList(
    event,
  ) {
    event.preventDefault()

    if (isCreating) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    const name =
      newPriceList.name.trim()

    const code =
      newPriceList.code
        .trim()
        .toUpperCase()

    if (!name) {
      setErrorMessage(
        'Ingresa el nombre de la lista.',
      )

      return
    }

    if (!code) {
      setErrorMessage(
        'Ingresa el código de la lista.',
      )

      return
    }

    setIsCreating(true)

    try {
      const response =
        await createAdminPriceList({
          name,
          code,
        })

      if (response.data) {
        setPriceLists(
          (currentLists) => [
            ...currentLists,
            response.data,
          ],
        )
      }

      setSuccessMessage(
        response.message ||
          'Lista de precios creada correctamente.',
      )

      setNewPriceList({
        name: '',
        code: '',
      })

      setShowCreateForm(false)
    } catch (error) {
      console.error(
        'No se pudo crear la lista de precios:',
        error,
      )

      const validationErrors =
        error.response?.data
          ?.errors

      const firstValidationError =
        validationErrors
          ? Object.values(
              validationErrors,
            )
              .flat()
              .find(Boolean)
          : null

      setErrorMessage(
        firstValidationError ||
          error.response?.data
            ?.message ||
          'No pudimos crear la lista de precios.',
      )
    } finally {
      setIsCreating(false)
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
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <CircleDollarSign
                  size={27}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-semibold text-bmg-blue">
                  Administración
                </p>

                <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                  Listas de precios
                </h1>

                <p className="mt-3 max-w-2xl text-neutral-600">
                  Administra las listas
                  disponibles para los
                  clientes, sus productos y
                  precios asociados.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateForm(
                  (current) => !current,
                )
              }
              style={
                CONTROL_TEXT_STYLE
              }
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
            >
              <Plus
                size={18}
                strokeWidth={2.5}
                aria-hidden="true"
              />

              Nueva lista
            </button>
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

        {showCreateForm && (
          <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold text-bmg-blue">
                Nueva lista
              </p>

              <h2 className="mt-2 text-2xl font-bold text-bmg-dark">
                Crear lista de precios
              </h2>

              <p className="mt-2 text-neutral-600">
                Primero crea la lista.
                Luego podrás cargar su
                archivo Excel desde el
                detalle.
              </p>
            </div>

            <form
              onSubmit={
                handleCreatePriceList
              }
              className="mt-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="price-list-name"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Nombre
                  </label>

                  <input
                    id="price-list-name"
                    name="name"
                    type="text"
                    value={
                      newPriceList.name
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Ej. Lista Distribuidores"
                    disabled={
                      isCreating
                    }
                    className="mt-2 min-h-11 w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price-list-code"
                    className="text-sm font-bold text-bmg-dark"
                  >
                    Código
                  </label>

                  <input
                    id="price-list-code"
                    name="code"
                    type="text"
                    value={
                      newPriceList.code
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Ej. DISTRIBUIDORES"
                    disabled={
                      isCreating
                    }
                    className="mt-2 min-h-11 w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm uppercase text-bmg-dark outline-none transition placeholder:normal-case placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={
                    isCreating
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`inline-flex min-h-10 items-center justify-center rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60`}
                >
                  {isCreating
                    ? 'Creando...'
                    : 'Crear lista'}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelCreate
                  }
                  disabled={
                    isCreating
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-5 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-60`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {isLoading && (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando listas de
              precios...
            </p>
          </section>
        )}

        {!isLoading &&
          priceLists.length === 0 && (
            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-bmg-dark">
                No hay listas de
                precios
              </h2>

              <p className="mt-3 text-neutral-600">
                Crea una lista para
                comenzar a administrar
                precios.
              </p>
            </section>
          )}

        {!isLoading &&
          priceLists.length > 0 && (
            <>
              <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Listas disponibles
                    </p>

                    <p className="mt-1 text-lg font-bold text-bmg-dark">
                      {
                        filteredPriceLists.length
                      }{' '}
                      {filteredPriceLists.length ===
                      1
                        ? 'lista'
                        : 'listas'}
                    </p>
                  </div>

                  <div className="w-full sm:w-80">
                    <label
                      htmlFor="price-list-search"
                      className="text-sm font-bold text-bmg-dark"
                    >
                      Buscar lista
                    </label>

                    <div className="relative mt-2">
                      <Search
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        id="price-list-search"
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
                        placeholder="Nombre, código, estado..."
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`min-h-11 w-full rounded-full border border-neutral-300 bg-white py-2 pl-11 pr-4 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition placeholder:font-normal placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {filteredPriceLists.length ===
              0 ? (
                <section className="mt-6 rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-bmg-dark">
                    No encontramos
                    listas
                  </h2>

                  <p className="mt-2 text-neutral-600">
                    Prueba con otro
                    nombre, código o
                    estado.
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
                            Lista
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Código
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Productos
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Clientes
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Estado
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Tipo
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Acción
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-neutral-200">
                        {filteredPriceLists.map(
                          (priceList) => (
                            <tr
                              key={
                                priceList.id
                              }
                              className="transition hover:bg-neutral-50"
                            >
                              <td className="px-5 py-4">
                                <p className="font-bold text-bmg-dark">
                                  {
                                    priceList.name
                                  }
                                </p>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-neutral-700">
                                {
                                  priceList.code
                                }
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-bmg-dark">
                                {priceList.products_count ??
                                  0}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-bmg-dark">
                                {priceList.clients_count ??
                                  0}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <span
                                  className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-xs font-bold ${
                                    priceList.is_active
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}
                                >
                                  {priceList.is_active
                                    ? 'Activa'
                                    : 'Inactiva'}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <span
                                  className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-xs font-bold ${
                                    priceList.is_general
                                      ? 'bg-bmg-blue/10 text-bmg-blue'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}
                                >
                                  {priceList.is_general
                                    ? 'General'
                                    : 'Personalizada'}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <Link
                                  to={`/admin/listas-precios/${priceList.id}`}
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

export default AdminPriceLists