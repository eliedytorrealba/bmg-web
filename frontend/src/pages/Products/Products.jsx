import {
  Filter,
  Heart,
  Package,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import AddToCartButton from '../../components/products/AddToCartButton'
import useAuth from '../../hooks/useAuth'
import useFavorites from '../../hooks/useFavorites'
import {
  getCatalogFilters,
  getProducts,
} from '../../services/productService'

const currencyFormatter =
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })

const EMPTY_PAGINATION = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
  from: 0,
  to: 0,
}

const CATEGORY_GROUPS = {
  lubricants: 'Lubricantes',
  filters: 'Filtros',
  additives: 'Aditivos',
  cosmetics: 'Cosmética',
  accessories: 'Accesorios',
}

function normalizeProductForCart(product) {
  return {
    ...product,
    brand:
      product.brand?.name ??
      'Sin marca',
    category:
      product.category?.name ??
      'Sin categoría',
    price: product.can_view_price
      ? Number(product.price)
      : 0,
  }
}

function normalizeFilterName(value) {
  const normalizedValue = String(
    value ?? '',
  )
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]/g, '')

  if (
    normalizedValue === 'total' ||
    normalizedValue === 'totalenergies' ||
    normalizedValue === 'totalelf' ||
    normalizedValue === 'elf'
  ) {
    return 'total'
  }

  return normalizedValue
}

function findFilterByName(
  availableFilters,
  requestedName,
) {
  if (!requestedName) {
    return null
  }

  const normalizedRequestedName =
    normalizeFilterName(requestedName)

  return (
    availableFilters.find(
      (filterOption) =>
        normalizeFilterName(
          filterOption.name,
        ) === normalizedRequestedName,
    ) ?? null
  )
}

function getPositiveInteger(
  value,
  fallback = 1,
) {
  const parsedValue = Number(value)

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return fallback
  }

  return parsedValue
}

function Products() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const {
    isAuthenticated,
    isAdmin,
  } = useAuth()

  const {
    canUseFavorites,
    isFavorite,
    isBusy,
    toggleFavorite,
    errorMessage: favoriteErrorMessage,
  } = useFavorites()

  const searchTerm =
    searchParams.get('buscar') ?? ''

  // El texto que se está escribiendo no se recorta ni se envía por cada tecla.
  const [pendingSearch, setPendingSearch] = useState(null)
  const searchTimeoutRef = useRef(null)
  const [showFilters, setShowFilters] = useState(false)

  const brandFromUrl =
    searchParams.get('brand') ?? ''

  const categoryFromUrl =
    searchParams.get('category') ?? ''

  const categoryGroupFromUrl =
    searchParams.get('categoryGroup') ??
    ''

  const currentPage =
    getPositiveInteger(
      searchParams.get('page'),
      1,
    )

  const [products, setProducts] =
    useState([])

  const [brands, setBrands] =
    useState([])

  const [categories, setCategories] =
    useState([])

  const [sortOption, setSortOption] =
    useState('name-asc')

  const [pagination, setPagination] =
    useState(EMPTY_PAGINATION)

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    filtersLoading,
    setFiltersLoading,
  ] = useState(true)

  const [
    filtersErrorMessage,
    setFiltersErrorMessage,
  ] = useState('')

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const selectedBrand = useMemo(
    () =>
      findFilterByName(
        brands,
        brandFromUrl,
      ),
    [brands, brandFromUrl],
  )

  const selectedCategory = useMemo(
    () =>
      findFilterByName(
        categories,
        categoryFromUrl,
      ),
    [categories, categoryFromUrl],
  )

  const selectedBrandId =
    selectedBrand?.id
      ? String(selectedBrand.id)
      : ''

  const selectedCategoryId =
    selectedCategory?.id
      ? String(selectedCategory.id)
      : ''

  const categoryGroupLabel =
    CATEGORY_GROUPS[
      categoryGroupFromUrl
    ] ?? ''

  const hasInvalidCategoryGroup =
    Boolean(categoryGroupFromUrl) &&
    !categoryGroupLabel

  const hasUnresolvedBrand =
    Boolean(brandFromUrl) &&
    !filtersLoading &&
    !selectedBrand

  const hasUnresolvedCategory =
    Boolean(categoryFromUrl) &&
    !filtersLoading &&
    !selectedCategory

  const hasInvalidUrlFilter =
    hasUnresolvedBrand ||
    hasUnresolvedCategory ||
    hasInvalidCategoryGroup

  useEffect(() => {
    let isMounted = true

    const timeoutId =
      window.setTimeout(async () => {
        setFiltersLoading(true)
        setFiltersErrorMessage('')

        try {
          const filters =
            await getCatalogFilters()

          if (!isMounted) {
            return
          }

          setBrands(
            Array.isArray(
              filters.brands,
            )
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

          setFiltersErrorMessage(
            'No pudimos cargar las categorías y marcas.',
          )
        } finally {
          if (isMounted) {
            setFiltersLoading(false)
          }
        }
      }, 0)

    return () => {
      isMounted = false

      window.clearTimeout(
        timeoutId,
      )
    }
  }, [])

  const loadProducts =
    useCallback(async () => {
      /*
       * Los filtros por nombre necesitan
       * esperar a que el catálogo de filtros
       * esté disponible para obtener su ID.
       *
       * categoryGroup no necesita convertirse
       * a un ID: se envía directamente al
       * backend como category_group.
       */
      if (
        filtersLoading &&
        (
          brandFromUrl ||
          categoryFromUrl
        )
      ) {
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      if (hasInvalidUrlFilter) {
        setProducts([])
        setPagination(
          EMPTY_PAGINATION,
        )
        setIsLoading(false)

        return
      }

      try {
        const response =
          await getProducts({
            page: currentPage,
            per_page: 24,

            search:
              searchTerm.trim() ||
              undefined,

            brand_id:
              selectedBrandId ||
              undefined,

            category_id:
              selectedCategoryId ||
              undefined,

            category_group:
              categoryGroupFromUrl ||
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
          'No se pudieron cargar los productos:',
          error,
        )

        setProducts([])
        setPagination(
          EMPTY_PAGINATION,
        )

        setErrorMessage(
          error.response?.data
            ?.message ||
            'No pudimos cargar el catálogo. Inténtalo nuevamente.',
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      currentPage,
      searchTerm,
      selectedBrandId,
      selectedCategoryId,
      categoryGroupFromUrl,
      filtersLoading,
      brandFromUrl,
      categoryFromUrl,
      hasInvalidUrlFilter,
    ])

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

  useEffect(() => () => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const sortedProducts = useMemo(() => {
    const nextProducts = [
      ...products,
    ]

    if (sortOption === 'name-desc') {
      return nextProducts.sort(
        (
          firstProduct,
          secondProduct,
        ) =>
          secondProduct.name.localeCompare(
            firstProduct.name,
            'es',
          ),
      )
    }

    if (sortOption === 'price-asc') {
      return nextProducts.sort(
        (
          firstProduct,
          secondProduct,
        ) => {
          if (
            !firstProduct.can_view_price &&
            !secondProduct.can_view_price
          ) {
            return 0
          }

          if (
            !firstProduct.can_view_price
          ) {
            return 1
          }

          if (
            !secondProduct.can_view_price
          ) {
            return -1
          }

          return (
            Number(
              firstProduct.price,
            ) -
            Number(
              secondProduct.price,
            )
          )
        },
      )
    }

    if (sortOption === 'price-desc') {
      return nextProducts.sort(
        (
          firstProduct,
          secondProduct,
        ) => {
          if (
            !firstProduct.can_view_price &&
            !secondProduct.can_view_price
          ) {
            return 0
          }

          if (
            !firstProduct.can_view_price
          ) {
            return 1
          }

          if (
            !secondProduct.can_view_price
          ) {
            return -1
          }

          return (
            Number(
              secondProduct.price,
            ) -
            Number(
              firstProduct.price,
            )
          )
        },
      )
    }

    return nextProducts.sort(
      (
        firstProduct,
        secondProduct,
      ) =>
        firstProduct.name.localeCompare(
          secondProduct.name,
          'es',
        ),
    )
  }, [products, sortOption])

  function updateUrl({
    search = pendingSearch ?? searchTerm,
    brandName = brandFromUrl,
    categoryName =
      categoryFromUrl,
    categoryGroup =
      categoryGroupFromUrl,
    page = 1,
  }) {
    const nextParams =
      new URLSearchParams()

    const normalizedSearch =
      search.trim()

    if (normalizedSearch) {
      nextParams.set(
        'buscar',
        normalizedSearch,
      )
    }

    if (brandName) {
      nextParams.set(
        'brand',
        brandName,
      )
    }

    if (categoryName) {
      nextParams.set(
        'category',
        categoryName,
      )
    }

    if (categoryGroup) {
      nextParams.set(
        'categoryGroup',
        categoryGroup,
      )
    }

    if (page > 1) {
      nextParams.set(
        'page',
        String(page),
      )
    }

    setSearchParams(nextParams, {
      replace: true,
    })
  }

  function handleSearchChange(event) {
    const nextSearch = event.target.value
    setPendingSearch(nextSearch)

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      // Solo al terminar de escribir normalizamos los extremos.
      // Los espacios internos se conservan para búsquedas como "filtro aceite".
      updateUrl({
        search: nextSearch,
        page: 1,
      })
      setPendingSearch(null)
      searchTimeoutRef.current = null
    }, 450)
  }

  function handleBrandChange(event) {
    const nextBrandId =
      event.target.value

    const nextBrand =
      brands.find(
        (brand) =>
          String(brand.id) ===
          nextBrandId,
      ) ?? null

    updateUrl({
      brandName:
        nextBrand?.name ?? '',
      page: 1,
    })
  }

  function handleCategoryChange(event) {
    const nextCategoryId =
      event.target.value

    const nextCategory =
      categories.find(
        (category) =>
          String(category.id) ===
          nextCategoryId,
      ) ?? null

    /*
     * Al seleccionar una categoría específica
     * se elimina el grupo general para evitar
     * aplicar ambos filtros al mismo tiempo.
     */
    updateUrl({
      categoryName:
        nextCategory?.name ?? '',
      categoryGroup: '',
      page: 1,
    })
  }

  function handleSortChange(event) {
    setSortOption(
      event.target.value,
    )
  }

  function clearFilters() {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
    setPendingSearch(null)
    setSortOption('name-asc')

    setSearchParams(
      {},
      {
        replace: true,
      },
    )
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

    updateUrl({
      page,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const hasActiveFilters =
    (pendingSearch ?? searchTerm).trim() !== '' ||
    brandFromUrl !== '' ||
    categoryFromUrl !== '' ||
    categoryGroupFromUrl !== ''

  const activeFilterMessage =
    categoryGroupLabel
      ? `Categoría principal: ${categoryGroupLabel}`
      : selectedCategory?.name
        ? `Categoría: ${selectedCategory.name}`
        : selectedBrand?.name
          ? `Marca: ${selectedBrand.name}`
          : ''

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <div className="text-center">
            <p className="font-semibold text-bmg-blue">
              Catálogo BMG
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
              Encuentra lo que necesitas
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-600">
              Explora lubricantes, filtros,
              aditivos, cosmética y productos
              para el sector automotor.
            </p>

            {activeFilterMessage && (
              <p className="mx-auto mt-4 inline-flex rounded-full bg-bmg-blue/10 px-4 py-2 text-sm font-bold text-bmg-blue">
                {activeFilterMessage}
              </p>
            )}
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <label
              htmlFor="product-search"
              className="sr-only"
            >
              Buscar productos
            </label>

            <div className="relative">
              <Search
                size={21}
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                id="product-search"
                type="search"
                value={pendingSearch ?? searchTerm}
                onChange={
                  handleSearchChange
                }
                maxLength={150}
                autoComplete="off"
                placeholder="Buscar por producto, marca o código..."
                className="min-h-14 w-full rounded-full border border-neutral-300 bg-white py-3 pl-14 pr-6 text-bmg-dark shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <section className="min-w-0">
            <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                onClick={() => setShowFilters((visible) => !visible)}
                aria-expanded={showFilters}
                aria-controls="catalog-filters"
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                <SlidersHorizontal size={17} aria-hidden="true" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-neutral-500">Productos disponibles</p>
                  <p className="mt-1 font-bold text-bmg-dark">
                    {pagination.total}{' '}
                    {pagination.total === 1 ? 'producto encontrado' : 'productos encontrados'}
                  </p>
                  {pagination.total > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Mostrando del {pagination.from} al {pagination.to}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Filter size={18} aria-hidden="true" className="shrink-0 text-neutral-500" />
                  <label htmlFor="sort-products" className="sr-only">Ordenar productos</label>
                  <select
                    id="sort-products"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="min-h-10 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  >
                    <option value="name-asc">Nombre: A-Z</option>
                    <option value="name-desc">Nombre: Z-A</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                  </select>
                </div>
              </div>
            </div>

            {showFilters && (
              <div id="catalog-filters" className="mt-5 rounded-2xl border border-neutral-200 bg-bmg-light p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} aria-hidden="true" className="text-bmg-blue" />
                  <h2 className="font-bold text-bmg-dark">Filtros del catálogo</h2>
                </div>

                {filtersErrorMessage && (
                  <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    {filtersErrorMessage}
                  </p>
                )}

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                  <div>
                    <label htmlFor="category-filter" className="text-sm font-bold text-bmg-dark">Categoría</label>
                    <select id="category-filter" value={selectedCategoryId} onChange={handleCategoryChange} disabled={filtersLoading} className="mt-2 min-h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:bg-neutral-100">
                      <option value="">Todas</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brand-filter" className="text-sm font-bold text-bmg-dark">Marca</label>
                    <select id="brand-filter" value={selectedBrandId} onChange={handleBrandChange} disabled={filtersLoading} className="mt-2 min-h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-bmg-dark outline-none transition focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 disabled:cursor-wait disabled:bg-neutral-100">
                      <option value="">Todas</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className="inline-flex min-h-10 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 md:col-span-2 lg:col-span-1">
                    Limpiar filtros
                  </button>
                </div>

                {categoryGroupLabel && (
                  <p className="mt-4 text-sm font-semibold text-bmg-blue">Categoría principal: {categoryGroupLabel}</p>
                )}

                {hasInvalidUrlFilter && (
                  <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    El filtro solicitado no coincide con una opción del catálogo.
                  </p>
                )}
              </div>
            )}

            {favoriteErrorMessage && (
              <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                {favoriteErrorMessage}
              </p>
            )}

              {isLoading && (
                <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
                  <p className="font-bold text-bmg-dark">
                    Cargando productos...
                  </p>
                </div>
              )}

              {!isLoading &&
                errorMessage && (
                  <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center text-red-700">
                    <p className="font-bold">
                      {errorMessage}
                    </p>

                    <button
                      type="button"
                      onClick={
                        loadProducts
                      }
                      className="mt-5 min-h-11 rounded-full bg-bmg-dark px-6 py-3 font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

              {!isLoading &&
                !errorMessage &&
                sortedProducts.length >
                  0 && (
                  <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {sortedProducts.map(
                      (product) => (
                        <article
                          key={product.id}
                          className="group relative min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
                        >
                          {canUseFavorites && (
                            <button
                              type="button"
                              onClick={() =>
                                toggleFavorite(product.id)
                              }
                              disabled={isBusy(product.id)}
                              aria-label={
                                isFavorite(product.id)
                                  ? `Quitar ${product.name} de favoritos`
                                  : `Agregar ${product.name} a favoritos`
                              }
                              aria-pressed={
                                isFavorite(product.id)
                              }
                              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-bmg-dark shadow-md transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                            >
                              <Heart
                                size={15}
                                fill={
                                  isFavorite(product.id)
                                    ? 'currentColor'
                                    : 'none'
                                }
                                aria-hidden="true"
                              />
                              </button>
                            )}

                          <Link
                            to={`/productos/${product.id}`}
                            aria-label={`Ver ${product.name}`}
                            className="block"
                          >
                            <div className="flex h-32 items-center justify-center bg-neutral-100 p-3 sm:h-36 xl:h-32">
                              {product.image_url ? (
                                <img
                                  src={
                                    product.image_url
                                  }
                                  alt={
                                    product.name
                                  }
                                  loading="lazy"
                                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white text-center">
                                  <Package
                                    size={
                                      38
                                    }
                                    strokeWidth={
                                      1.4
                                    }
                                    aria-hidden="true"
                                    className="text-neutral-300"
                                  />

                                  <span className="mt-2 text-xs font-semibold text-neutral-400">
                                    Imagen
                                    próximamente
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="min-w-0 p-3">
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                              <p className="min-w-0 break-words text-xs font-bold text-bmg-blue">
                                {product
                                  .brand
                                  ?.name ??
                                  'Sin marca'}
                              </p>

                              <span className="max-w-full break-words rounded-full bg-bmg-light px-2 py-1 text-[11px] font-semibold text-neutral-600">
                                {product
                                  .category
                                  ?.name ??
                                  'Sin categoría'}
                              </span>
                            </div>

                            <Link
                              to={`/productos/${product.id}`}
                              className="block"
                            >
                              <h2 className="mt-2 min-h-9 break-words text-xs font-bold leading-4 text-bmg-dark transition group-hover:text-bmg-blue">
                                {
                                  product.name
                                }
                              </h2>
                            </Link>

                            <p className="mt-1.5 break-all text-[11px] text-neutral-500">
                              Código:{' '}
                              {product.code}
                            </p>

                            <div className="mt-2 min-h-6">
  {product.can_view_price ? (
    <p className="break-words text-base font-bold text-bmg-dark">
      {currencyFormatter.format(
        Number(product.price),
      )}
    </p>
  ) : !isAuthenticated ? (
    <p className="text-sm font-bold leading-5 text-bmg-blue">
      Inicia sesión para consultar
    </p>
  ) : !isAdmin ? (
    <p className="text-sm font-bold leading-5 text-bmg-blue">
      Precio no disponible
    </p>
  ) : null}
</div>

                            <div className="mt-3 grid gap-2">
                              <Link
                                to={`/productos/${product.id}`}
                                className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-bmg-dark px-3 py-2 text-xs font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                              >
                                Ver detalle
                              </Link>

                              <div className="[&_button]:!min-h-9 [&_button]:!px-2 [&_button]:!py-1.5 [&_button]:!text-[11px] [&_button]:!leading-4 [&_button]:!gap-1 [&_svg]:!h-3.5 [&_svg]:!w-3.5">
                                <AddToCartButton
                                  product={normalizeProductForCart(
                                    product,
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}

              {!isLoading &&
                !errorMessage &&
                sortedProducts.length ===
                  0 && (
                  <div className="mt-8 rounded-3xl border border-neutral-200 bg-bmg-light px-6 py-16 text-center">
                    <h2 className="text-2xl font-bold text-bmg-dark">
                      No encontramos productos
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-neutral-600">
                      Prueba cambiando los
                      filtros o escribiendo otro
                      nombre, código o marca.
                    </p>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-bmg-dark px-7 py-3 font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Mostrar todos
                    </button>
                  </div>
                )}

              {!isLoading &&
                !errorMessage &&
                pagination.lastPage >
                  1 && (
                  <nav
                    aria-label="Paginación de productos"
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
                      className="min-h-11 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Anterior
                    </button>

                    <span className="text-sm font-semibold text-neutral-600">
                      Página{' '}
                      {
                        pagination.currentPage
                      }{' '}
                      de{' '}
                      {
                        pagination.lastPage
                      }
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
                      className="min-h-11 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-bmg-dark transition enabled:hover:border-bmg-blue enabled:hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Siguiente
                    </button>
                  </nav>
                )}
          </section>
        </div>
      </main>
    </>
  )
}

export default Products