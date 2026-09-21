import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  FileSpreadsheet,
  Pencil,
  Search,
  ToggleLeft,
  ToggleRight,
  Upload,
  Users,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getAdminPriceList,
  importAdminPriceList,
  updateAdminPriceList,
  updateAdminPriceListStatus,
} from '../../services/adminPriceListService'

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

function AdminPriceListDetail() {
  const {
    priceListId,
  } = useParams()

  const fileInputRef =
    useRef(null)

  const [
    priceList,
    setPriceList,
  ] = useState(null)

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
    isEditing,
    setIsEditing,
  ] = useState(false)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false)

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null)

  const [
    isImporting,
    setIsImporting,
  ] = useState(false)

  const [
    importResult,
    setImportResult,
  ] = useState(null)

  const [
    formData,
    setFormData,
  ] = useState({
    name: '',
    code: '',
  })

  async function loadPriceList() {
    try {
      const data =
        await getAdminPriceList(
          priceListId,
        )

      setPriceList(data)

      setFormData({
        name: data?.name ?? '',
        code: data?.code ?? '',
      })
    } catch (error) {
      console.error(
        'No se pudo cargar la lista de precios:',
        error,
      )

      setErrorMessage(
        error.response?.data
          ?.message ||
          'No pudimos cargar la lista de precios.',
      )
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const data =
          await getAdminPriceList(
            priceListId,
          )

        if (!isMounted) {
          return
        }

        setPriceList(data)

        setFormData({
          name: data?.name ?? '',
          code: data?.code ?? '',
        })
      } catch (error) {
        console.error(
          'No se pudo cargar la lista de precios:',
          error,
        )

        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos cargar la lista de precios.',
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
  }, [priceListId])

  const items =
    useMemo(
      () =>
        Array.isArray(
          priceList?.items,
        )
          ? priceList.items
          : [],
      [priceList],
    )

  const filteredItems =
    useMemo(
      () => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase()

        if (!normalizedSearch) {
          return items
        }

        return items.filter(
          (item) => {
            const product =
              item?.product

            const searchableValues =
              [
                product?.code,
                product?.name,
                product?.brand?.name,
                product?.category?.name,
                item?.price,
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
        items,
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

    setFormData(
      (current) => ({
        ...current,
        [name]:
          name === 'code'
            ? value.toUpperCase()
            : value,
      }),
    )
  }

  function handleEdit() {
    setFormData({
      name:
        priceList?.name ?? '',
      code:
        priceList?.code ?? '',
    })

    setErrorMessage('')
    setSuccessMessage('')
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)

    setFormData({
      name:
        priceList?.name ?? '',
      code:
        priceList?.code ?? '',
    })

    setErrorMessage('')
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    if (
      isSaving ||
      !priceList
    ) {
      return
    }

    const name =
      formData.name.trim()

    const code =
      formData.code
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

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await updateAdminPriceList(
          priceList.id,
          {
            name,
            code,
          },
        )

      setPriceList(
        (current) => ({
          ...current,
          ...response.data,
        }),
      )

      setIsEditing(false)

      setSuccessMessage(
        response.message ||
          'Lista de precios actualizada correctamente.',
      )
    } catch (error) {
      console.error(
        'No se pudo actualizar la lista de precios:',
        error,
      )

      const validationErrors =
        error.response?.data
          ?.errors

      const firstError =
        validationErrors
          ? Object.values(
              validationErrors,
            )
              .flat()
              .find(Boolean)
          : null

      setErrorMessage(
        firstError ||
          error.response?.data
            ?.message ||
          'No pudimos actualizar la lista de precios.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange() {
    if (
      !priceList ||
      priceList.is_general ||
      isUpdatingStatus
    ) {
      return
    }

    const nextStatus =
      !priceList.is_active

    setIsUpdatingStatus(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await updateAdminPriceListStatus(
          priceList.id,
          nextStatus,
        )

      setPriceList(
        (current) => ({
          ...current,
          ...response.data,
        }),
      )

      setSuccessMessage(
        response.message ||
          (nextStatus
            ? 'Lista activada correctamente.'
            : 'Lista desactivada correctamente.'),
      )
    } catch (error) {
      console.error(
        'No se pudo cambiar el estado de la lista:',
        error,
      )

      setErrorMessage(
        error.response?.data
          ?.message ||
          'No pudimos cambiar el estado de la lista.',
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  function handleFileChange(
    event,
  ) {
    const file =
      event.target.files?.[0] ??
      null

    setSelectedFile(file)
    setImportResult(null)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleClearFile() {
    setSelectedFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleImport(
    event,
  ) {
    event.preventDefault()

    if (
      !selectedFile ||
      !priceList ||
      isImporting
    ) {
      return
    }

    setIsImporting(true)
    setErrorMessage('')
    setSuccessMessage('')
    setImportResult(null)

    try {
      const response =
        await importAdminPriceList(
          priceList.id,
          selectedFile,
        )

      setImportResult(
        response.data?.import ??
          null,
      )

      setSuccessMessage(
        response.message ||
          'Lista de precios actualizada correctamente.',
      )

      handleClearFile()

      await loadPriceList()
    } catch (error) {
      console.error(
        'No se pudo importar la lista de precios:',
        error,
      )

      const validationErrors =
        error.response?.data
          ?.errors

      const fileErrors =
        error.response?.data
          ?.data?.errors

      const firstValidationError =
        validationErrors
          ? Object.values(
              validationErrors,
            )
              .flat()
              .find(Boolean)
          : null

      const firstImportError =
        Array.isArray(
          fileErrors,
        )
          ? fileErrors[0]
          : null

      setErrorMessage(
        firstValidationError ||
          firstImportError ||
          error.response?.data
            ?.message ||
          'No pudimos importar la lista de precios.',
      )
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando lista de
              precios...
            </p>
          </section>
        </div>
      </main>
    )
  }

  if (
    errorMessage &&
    !priceList
  ) {
    return (
      <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/admin/listas-precios"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Volver a listas de precios
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

  return (
    <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin/listas-precios"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Volver a listas de precios
        </Link>

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
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
                {priceList?.name ||
                  'Lista de precios'}
              </h1>

              <p className="mt-3 text-neutral-600">
                Consulta y administra los
                productos, precios y
                configuración de esta
                lista.
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
            <Boxes
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Productos
            </p>

            <p className="mt-1 text-3xl font-bold text-bmg-dark">
              {priceList?.products_count ??
                items.length}
            </p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <Users
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Clientes asignados
            </p>

            <p className="mt-1 text-3xl font-bold text-bmg-dark">
              {priceList?.clients_count ??
                0}
            </p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <CheckCircle2
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Estado
            </p>

            <p
              className={`mt-1 text-2xl font-bold ${
                priceList?.is_active
                  ? 'text-green-700'
                  : 'text-neutral-500'
              }`}
            >
              {priceList?.is_active
                ? 'Activa'
                : 'Inactiva'}
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CircleDollarSign
                size={22}
                className="text-bmg-blue"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-bmg-dark">
                Datos de la lista
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
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
              >
                <Pencil
                  size={16}
                  aria-hidden="true"
                />

                Editar datos
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-semibold text-neutral-500">
                  Nombre
                </p>

                <p className="mt-1 font-bold text-bmg-dark">
                  {priceList?.name ||
                    '-'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-500">
                  Código
                </p>

                <p className="mt-1 text-bmg-dark">
                  {priceList?.code ||
                    '-'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-500">
                  Tipo
                </p>

                <p className="mt-1 text-bmg-dark">
                  {priceList?.is_general
                    ? 'Lista General'
                    : 'Personalizada'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-500">
                  Última actualización
                </p>

                <p className="mt-1 text-bmg-dark">
                  {formatDate(
                    priceList
                      ?.updated_at,
                  )}
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
              <div className="grid gap-5 sm:grid-cols-2">
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
                      formData.name
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:opacity-60"
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
                      formData.code
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      isSaving ||
                      priceList?.is_general
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold uppercase text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                  />

                  {priceList?.is_general && (
                    <p className="mt-2 text-xs text-neutral-500">
                      El código de la Lista
                      General no puede
                      modificarse.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={
                    handleCancelEdit
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

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              {priceList?.is_active ? (
                <ToggleRight
                  size={25}
                  className="text-bmg-blue"
                  aria-hidden="true"
                />
              ) : (
                <ToggleLeft
                  size={25}
                  className="text-neutral-500"
                  aria-hidden="true"
                />
              )}

              <h2 className="text-xl font-bold text-bmg-dark">
                Estado de la lista
              </h2>
            </div>

            <p className="mt-4 text-neutral-600">
              {priceList?.is_general
                ? 'La Lista General debe permanecer activa y no puede desactivarse.'
                : priceList?.is_active
                  ? 'Esta lista está disponible para ser asignada a clientes.'
                  : 'Esta lista está inactiva y no debería asignarse a nuevos clientes.'}
            </p>

            <button
              type="button"
              onClick={
                handleStatusChange
              }
              disabled={
                priceList?.is_general ||
                isUpdatingStatus
              }
              style={
                CONTROL_TEXT_STYLE
              }
              className={`mt-6 inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 ${CONTROL_TEXT_CLASS} transition ${
                priceList?.is_general
                  ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                  : priceList?.is_active
                    ? 'border-red-300 bg-white text-red-700 hover:bg-red-50'
                    : 'border-green-300 bg-white text-green-700 hover:bg-green-50'
              } disabled:opacity-60`}
            >
              {isUpdatingStatus
                ? 'Actualizando...'
                : priceList?.is_general
                  ? 'Lista General activa'
                  : priceList?.is_active
                    ? 'Desactivar lista'
                    : 'Activar lista'}
            </button>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <FileSpreadsheet
                size={24}
                className="text-bmg-blue"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-bmg-dark">
                Importar Excel
              </h2>
            </div>

            <p className="mt-4 text-neutral-600">
              Carga un archivo Excel para
              sincronizar los productos y
              precios de esta lista.
            </p>

            <p className="mt-3 text-sm text-neutral-500">
              Columnas requeridas:
              CODIGO, NOMBRE, MARCA,
              RUBRO y PRECIO VENTA.
            </p>

            <form
              onSubmit={
                handleImport
              }
              className="mt-6"
            >
              <input
                ref={fileInputRef}
                id="price-list-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={
                  handleFileChange
                }
                disabled={
                  isImporting
                }
                className="hidden"
              />

              <label
                htmlFor="price-list-file"
                className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-5 text-center transition hover:border-bmg-blue hover:bg-bmg-blue/5"
              >
                <Upload
                  size={26}
                  className="text-bmg-blue"
                  aria-hidden="true"
                />

                <span className="mt-3 text-sm font-bold text-bmg-dark">
                  {selectedFile
                    ? selectedFile.name
                    : 'Seleccionar archivo Excel'}
                </span>

                <span className="mt-1 text-xs text-neutral-500">
                  Formatos .xlsx o .xls
                </span>
              </label>

              {selectedFile && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={
                      isImporting
                    }
                    style={
                      CONTROL_TEXT_STYLE
                    }
                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60`}
                  >
                    <Upload
                      size={16}
                      aria-hidden="true"
                    />

                    {isImporting
                      ? 'Importando...'
                      : 'Importar archivo'}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleClearFile
                    }
                    disabled={
                      isImporting
                    }
                    style={
                      CONTROL_TEXT_STYLE
                    }
                    className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-5 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-60`}
                  >
                    Quitar archivo
                  </button>
                </div>
              )}
            </form>
          </article>
        </section>

        {importResult && (
          <section className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={24}
                className="text-green-700"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-green-800">
                Resultado de la
                importación
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Filas procesadas
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.processed_rows ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Productos creados
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.created_products ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Productos actualizados
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.updated_products ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Precios creados
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.created_prices ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Precios actualizados
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.updated_prices ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Retirados de la lista
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.removed_prices ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Marcas procesadas
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.processed_brands ??
                    0}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Categorías
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {importResult.processed_categories ??
                    0}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-bmg-dark">
                Productos de la lista
              </h2>

              <p className="mt-1 text-sm text-neutral-600">
                Productos actualmente
                asociados a esta lista de
                precios.
              </p>

              <p className="mt-2 text-sm font-bold text-bmg-dark">
                {filteredItems.length}{' '}
                {filteredItems.length === 1
                  ? 'producto'
                  : 'productos'}
              </p>
            </div>

            <div className="w-full sm:w-80">
              <label
                htmlFor="product-search"
                className="text-sm font-bold text-bmg-dark"
              >
                Buscar producto
              </label>

              <div className="relative mt-2">
                <Search
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="product-search"
                  type="search"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Código, nombre, marca..."
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`min-h-11 w-full rounded-full border border-neutral-300 bg-white py-2 pl-11 pr-4 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition placeholder:font-normal placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15`}
                />
              </div>
            </div>
          </div>

          {filteredItems.length ===
          0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <Boxes
                size={32}
                className="mx-auto text-neutral-400"
                aria-hidden="true"
              />

              <p className="mt-4 font-bold text-bmg-dark">
                No hay productos
              </p>

              <p className="mt-2 text-sm text-neutral-600">
                {searchTerm
                  ? 'No encontramos productos con la búsqueda ingresada.'
                  : 'Esta lista todavía no tiene productos asociados.'}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm('')
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
                >
                  Limpiar búsqueda
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
                        Código
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Producto
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Marca
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Categoría
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Precio
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200">
                    {filteredItems.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className="transition hover:bg-neutral-50"
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-bmg-dark">
                            {item.product
                              ?.code ||
                              '-'}
                          </td>

                          <td className="px-5 py-4 text-sm font-normal text-bmg-dark">
                            {item.product
                              ?.name ||
                              '-'}
                          </td>

                          <td className="px-5 py-4 text-sm font-normal text-neutral-700">
                            {item.product
                              ?.brand
                              ?.name ||
                              '-'}
                          </td>

                          <td className="px-5 py-4 text-sm font-normal text-neutral-700">
                            {item.product
                              ?.category
                              ?.name ||
                              '-'}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-bmg-dark">
                            {formatCurrency(
                              item.price,
                            )}
                          </td>
                        </tr>
                      ),
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

export default AdminPriceListDetail