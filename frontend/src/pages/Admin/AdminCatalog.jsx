import {
  ImageOff,
  ImagePlus,
  PackageSearch,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  deleteAdminProductImage,
  getAdminCatalogProducts,
  uploadAdminProductImage,
} from '../../services/adminCatalogService'
import { getCatalogFilters } from '../../services/productService'

const EMPTY_PAGINATION = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
  from: 0,
  to: 0,
}

function AdminCatalog() {
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrandId, setSelectedBrandId] =
    useState('')
  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState('')
  const [imageStatus, setImageStatus] =
    useState('')

  const [currentPage, setCurrentPage] =
    useState(1)

  const [pagination, setPagination] =
    useState(EMPTY_PAGINATION)

  const [isLoading, setIsLoading] =
    useState(true)

  const [filtersLoading, setFiltersLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  const [busyProductId, setBusyProductId] =
    useState(null)

  const [deleteProduct, setDeleteProduct] =
    useState(null)

  const fileInputRefs = useRef({})

  /*
  |--------------------------------------------------------------------------
  | Cargar productos
  |--------------------------------------------------------------------------
  */

  const loadProducts = useCallback(
    async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response =
          await getAdminCatalogProducts({
            page: currentPage,
            per_page: 25,

            search:
              searchTerm.trim() ||
              undefined,

            brand_id:
              selectedBrandId ||
              undefined,

            category_id:
              selectedCategoryId ||
              undefined,

            image_status:
              imageStatus ||
              undefined,
          })

        setProducts(
          Array.isArray(response.data)
            ? response.data
            : [],
        )

        setPagination({
          currentPage:
            response.current_page ??
            currentPage,

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
          'No se pudo cargar el catálogo administrativo:',
          error,
        )

        setProducts([])

        setPagination(
          EMPTY_PAGINATION,
        )

        setErrorMessage(
          error.response?.data?.message ||
            'No se pudo cargar el catálogo.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [
      currentPage,
      searchTerm,
      selectedBrandId,
      selectedCategoryId,
      imageStatus,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Carga inicial de filtros
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true

    async function fetchFilters() {
      try {
        const filters =
          await getCatalogFilters()

        if (!isMounted) {
          return
        }

        setBrands(
          Array.isArray(filters.brands)
            ? filters.brands
            : [],
        )

        setCategories(
          Array.isArray(
            filters.categories,
          )
            ? filters.categories
            : [],
        )
      } catch (error) {
        console.error(
          'No se pudieron cargar los filtros:',
          error,
        )

        if (!isMounted) {
          return
        }

        setBrands([])
        setCategories([])
      } finally {
        if (isMounted) {
          setFiltersLoading(false)
        }
      }
    }

    fetchFilters()

    return () => {
      isMounted = false
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Carga de productos
  |--------------------------------------------------------------------------
  |
  | Se utiliza un pequeño debounce para evitar realizar una petición
  | por cada tecla presionada en el buscador.
  |
  */

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        loadProducts()
      }, 350)

    return () => {
      window.clearTimeout(
        timeoutId,
      )
    }
  }, [loadProducts])

  /*
  |--------------------------------------------------------------------------
  | Filtros
  |--------------------------------------------------------------------------
  */

  function resetPage() {
    setCurrentPage(1)
  }

  function handleSearchChange(event) {
    setSearchTerm(
      event.target.value,
    )

    resetPage()
  }

  function handleBrandChange(event) {
    setSelectedBrandId(
      event.target.value,
    )

    resetPage()
  }

  function handleCategoryChange(event) {
    setSelectedCategoryId(
      event.target.value,
    )

    resetPage()
  }

  function handleImageStatusChange(
    event,
  ) {
    setImageStatus(
      event.target.value,
    )

    resetPage()
  }

  function clearFilters() {
    setSearchTerm('')
    setSelectedBrandId('')
    setSelectedCategoryId('')
    setImageStatus('')
    setCurrentPage(1)
  }

  /*
  |--------------------------------------------------------------------------
  | Selector de archivos
  |--------------------------------------------------------------------------
  */

  function openFilePicker(productId) {
    const input =
      fileInputRefs.current[
        productId
      ]

    if (input) {
      input.click()
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Subir o reemplazar imagen
  |--------------------------------------------------------------------------
  */

  async function handleImageSelected(
    product,
    event,
  ) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    setBusyProductId(product.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await uploadAdminProductImage(
          product.id,
          file,
        )

      setSuccessMessage(
        response.message ||
          'Imagen guardada correctamente.',
      )

      await loadProducts()
    } catch (error) {
      console.error(
        'No se pudo guardar la imagen:',
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

      setErrorMessage(
        firstValidationError ||
          error.response?.data
            ?.message ||
          'No se pudo guardar la imagen.',
      )
    } finally {
      setBusyProductId(null)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Eliminar imagen
  |--------------------------------------------------------------------------
  */

  function requestImageDelete(
    product,
  ) {
    setDeleteProduct(product)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function closeDeleteModal() {
    if (busyProductId !== null) {
      return
    }

    setDeleteProduct(null)
  }

  async function confirmImageDelete() {
    if (!deleteProduct) {
      return
    }

    const productId =
      deleteProduct.id

    setBusyProductId(productId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await deleteAdminProductImage(
          productId,
        )

      setSuccessMessage(
        response.message ||
          'Imagen eliminada correctamente.',
      )

      setDeleteProduct(null)

      await loadProducts()
    } catch (error) {
      console.error(
        'No se pudo eliminar la imagen:',
        error,
      )

      setErrorMessage(
        error.response?.data
          ?.message ||
          'No se pudo eliminar la imagen.',
      )
    } finally {
      setBusyProductId(null)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Paginación
  |--------------------------------------------------------------------------
  */

  function goToPage(page) {
    if (
      page < 1 ||
      page > pagination.lastPage ||
      page === pagination.currentPage
    ) {
      return
    }

    setCurrentPage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedBrandId !== '' ||
    selectedCategoryId !== '' ||
    imageStatus !== ''

  return (
    <>
      <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <Link
              to="/admin"
              className="text-sm font-bold text-bmg-blue transition hover:text-bmg-dark"
            >
              ← Volver al Panel
            </Link>
          </div>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                  <PackageSearch
                    size={27}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="font-semibold text-bmg-blue">
                    Administración
                  </p>

                  <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                    Catálogo
                  </h1>

                  <p className="mt-3 max-w-3xl leading-7 text-neutral-600">
                    Administra las imágenes de
                    los productos disponibles en
                    el catálogo general.
                  </p>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                    Los productos incorporados
                    mediante las listas de precios
                    aparecerán automáticamente en
                    este listado.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadProducts}
                disabled={isLoading}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-wait disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  aria-hidden="true"
                  className={
                    isLoading
                      ? 'animate-spin'
                      : ''
                  }
                />

                Actualizar
              </button>
            </div>
          </section>

          {successMessage && (
            <p
              role="status"
              className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700"
            >
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label
                  htmlFor="admin-product-search"
                  className="text-sm font-bold text-bmg-dark"
                >
                  Buscar
                </label>

                <div className="relative mt-2">
                  <Search
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="admin-product-search"
                    type="search"
                    value={searchTerm}
                    onChange={
                      handleSearchChange
                    }
                    maxLength={150}
                    placeholder="Código, producto, marca..."
                    className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-11 pr-4 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-brand-filter"
                  className="text-sm font-bold text-bmg-dark"
                >
                  Marca
                </label>

                <select
                  id="admin-brand-filter"
                  value={selectedBrandId}
                  onChange={
                    handleBrandChange
                  }
                  disabled={filtersLoading}
                  className="mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:bg-neutral-100"
                >
                  <option value="">
                    Todas
                  </option>

                  {brands.map(
                    (brand) => (
                      <option
                        key={brand.id}
                        value={brand.id}
                      >
                        {brand.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-category-filter"
                  className="text-sm font-bold text-bmg-dark"
                >
                  Categoría
                </label>

                <select
                  id="admin-category-filter"
                  value={
                    selectedCategoryId
                  }
                  onChange={
                    handleCategoryChange
                  }
                  disabled={filtersLoading}
                  className="mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:bg-neutral-100"
                >
                  <option value="">
                    Todas
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-image-filter"
                  className="text-sm font-bold text-bmg-dark"
                >
                  Imagen
                </label>

                <select
                  id="admin-image-filter"
                  value={imageStatus}
                  onChange={
                    handleImageStatusChange
                  }
                  className="mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="with_image">
                    Con imagen
                  </option>

                  <option value="without_image">
                    Sin imagen
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-5">
              <div>
                <p className="font-bold text-bmg-dark">
                  {pagination.total}{' '}
                  {pagination.total === 1
                    ? 'producto'
                    : 'productos'}
                </p>

                {pagination.total > 0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Mostrando del{' '}
                    {pagination.from} al{' '}
                    {pagination.to}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={clearFilters}
                disabled={
                  !hasActiveFilters
                }
                className="min-h-10 rounded-full border border-neutral-300 px-5 py-2 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40"
              >
                Limpiar filtros
              </button>
            </div>
          </section>

          {isLoading && (
            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
              <p className="font-bold text-bmg-dark">
                Cargando productos...
              </p>
            </section>
          )}

          {!isLoading &&
            !errorMessage &&
            products.length === 0 && (
              <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
                <PackageSearch
                  size={48}
                  aria-hidden="true"
                  className="mx-auto text-neutral-300"
                />

                <h2 className="mt-4 text-2xl font-bold text-bmg-dark">
                  No encontramos productos
                </h2>

                <p className="mt-2 text-neutral-600">
                  Prueba modificando los
                  filtros seleccionados.
                </p>
              </section>
            )}

          {!isLoading &&
            products.length > 0 && (
              <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Imagen
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
                          Estado
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {products.map(
                        (product) => {
                          const isBusy =
                            busyProductId ===
                            product.id

                          return (
                            <tr
                              key={
                                product.id
                              }
                              className="align-middle"
                            >
                              <td className="px-5 py-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                                  {product.image_url ? (
                                    <img
                                      src={
                                        product.image_url
                                      }
                                      alt={
                                        product.name
                                      }
                                      className="h-full w-full object-contain p-2"
                                    />
                                  ) : (
                                    <ImageOff
                                      size={28}
                                      aria-hidden="true"
                                      className="text-neutral-300"
                                    />
                                  )}
                                </div>
                              </td>

                              <td className="max-w-sm px-5 py-4">
                                <p className="font-bold text-bmg-dark">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="mt-1 break-all text-xs text-neutral-500">
                                  Código:{' '}
                                  {
                                    product.code
                                  }
                                </p>
                              </td>

                              <td className="px-5 py-4 text-sm text-neutral-600">
                                {product
                                  .brand
                                  ?.name ??
                                  'Sin marca'}
                              </td>

                              <td className="px-5 py-4 text-sm text-neutral-600">
                                {product
                                  .category
                                  ?.name ??
                                  'Sin categoría'}
                              </td>

                              <td className="px-5 py-4">
                                {product.has_image ? (
                                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                    Con imagen
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                    Sin imagen
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex min-w-max justify-end gap-2">
                                  <input
                                    ref={(
                                      element,
                                    ) => {
                                      if (
                                        element
                                      ) {
                                        fileInputRefs.current[
                                          product.id
                                        ] =
                                          element
                                      }
                                    }}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(
                                      event,
                                    ) =>
                                      handleImageSelected(
                                        product,
                                        event,
                                      )
                                    }
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFilePicker(
                                        product.id,
                                      )
                                    }
                                    disabled={
                                      isBusy
                                    }
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-bmg-dark px-4 py-2 text-xs font-bold text-white transition enabled:hover:bg-bmg-blue disabled:cursor-wait disabled:opacity-50"
                                  >
                                    {product.has_image ? (
                                      <ImagePlus
                                        size={
                                          15
                                        }
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      <Upload
                                        size={
                                          15
                                        }
                                        aria-hidden="true"
                                      />
                                    )}

                                    {isBusy
                                      ? 'Procesando...'
                                      : product.has_image
                                        ? 'Cambiar'
                                        : 'Subir imagen'}
                                  </button>

                                  {product.has_image && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        requestImageDelete(
                                          product,
                                        )
                                      }
                                      disabled={
                                        isBusy
                                      }
                                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition enabled:hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                                    >
                                      <Trash2
                                        size={
                                          15
                                        }
                                        aria-hidden="true"
                                      />

                                      Eliminar
                                    </button>
                                  )}
                                </div>
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

          {!isLoading &&
            pagination.lastPage > 1 && (
              <nav
                aria-label="Paginación del catálogo administrativo"
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
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
                  className="min-h-11 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <span className="text-sm font-semibold text-neutral-600">
                  Página{' '}
                  {
                    pagination.currentPage
                  }{' '}
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
                  className="min-h-11 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </nav>
            )}
        </div>
      </main>

      {deleteProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-image-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2
                size={22}
                aria-hidden="true"
              />
            </div>

            <h2
              id="delete-product-image-title"
              className="mt-5 text-2xl font-bold text-bmg-dark"
            >
              Eliminar imagen
            </h2>

            <p className="mt-3 leading-7 text-neutral-600">
              Se eliminará la imagen de{' '}
              <strong>
                {deleteProduct.name}
              </strong>
              . El producto continuará
              disponible en el catálogo.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  busyProductId !== null
                }
                className="min-h-11 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmImageDelete
                }
                disabled={
                  busyProductId !== null
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-50"
              >
                <Trash2
                  size={16}
                  aria-hidden="true"
                />

                {busyProductId !== null
                  ? 'Eliminando...'
                  : 'Eliminar imagen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminCatalog