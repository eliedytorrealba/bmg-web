import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  Tag,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import AddToCartButton from '../../components/products/AddToCartButton'
import useAuth from '../../hooks/useAuth'
import useFavorites from '../../hooks/useFavorites'
import { getProduct } from '../../services/productService'

const currencyFormatter = new Intl.NumberFormat(
  'es-AR',
  {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  },
)

function normalizeProductForCart(product) {
  return {
    ...product,
    brand:
      product.brand?.name ??
      product.brand ??
      'Sin marca',
    category:
      product.category?.name ??
      product.category ??
      'Sin categoría',
    price: product.can_view_price
      ? Number(product.price)
      : 0,
  }
}

function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isAdmin,
    user,
  } = useAuth()

  const {
    canUseFavorites,
    isFavorite,
    isBusy,
    toggleFavorite,
    errorMessage: favoriteErrorMessage,
  } = useFavorites()

  const [product, setProduct] =
    useState(null)

  const [quantity, setQuantity] =
    useState(1)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const canSelectQuantity =
    !isAuthLoading &&
    isAuthenticated &&
    !isAdmin &&
    user?.role === 'client'

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const loadedProduct =
          await getProduct(productId)

        if (isMounted) {
          setProduct(loadedProduct)
          setQuantity(1)
        }
      } catch (error) {
        console.error(
          'No se pudo cargar el producto:',
          error,
        )

        if (!isMounted) {
          return
        }

        if (error.response?.status === 404) {
          setErrorMessage(
            'El producto solicitado no existe.',
          )
        } else {
          setErrorMessage(
            'No pudimos cargar el producto. Inténtalo nuevamente.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  const cartProduct = useMemo(
    () =>
      product
        ? normalizeProductForCart(product)
        : null,
    [product],
  )

  function decreaseQuantity() {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1),
    )
  }

  function increaseQuantity() {
    setQuantity(
      (currentQuantity) =>
        currentQuantity + 1,
    )
  }

  function handleQuantityChange(event) {
    const nextQuantity = Number(
      event.target.value,
    )

    if (!Number.isFinite(nextQuantity)) {
      return
    }

    setQuantity(
      Math.max(
        1,
        Math.floor(nextQuantity),
      ),
    )
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <p className="font-bold text-bmg-dark">
          Cargando producto...
        </p>
      </main>
    )
  }

  if (errorMessage || !product) {
    return (
      <main className="bg-white px-4 py-20">
        <section className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700">
            No pudimos mostrar el producto
          </h1>

          <p className="mt-3 text-red-600">
            {errorMessage ||
              'El producto solicitado no está disponible.'}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/productos', {
                replace: true,
              })
            }
            className="mt-6 rounded-full bg-bmg-dark px-6 py-3 font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
          >
            Volver al catálogo
          </button>
        </section>
      </main>
    )
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <nav
            aria-label="Navegación secundaria"
            className="flex flex-wrap items-center gap-2 text-sm text-neutral-500"
          >
            <Link
              to="/"
              className="transition hover:text-bmg-blue"
            >
              Inicio
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <Link
              to="/productos"
              className="transition hover:text-bmg-blue"
            >
              Productos
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span className="min-w-0 break-words font-semibold text-bmg-dark">
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Volver al catálogo
          </Link>

          <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-14">
            <section className="min-w-0">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 lg:sticky lg:top-28">
                <div className="flex aspect-square items-center justify-center p-8 sm:p-12">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white px-8 text-center">
                      <Package
                        size={64}
                        strokeWidth={1.4}
                        aria-hidden="true"
                        className="text-neutral-300"
                      />

                      <p className="mt-5 text-lg font-bold text-neutral-400">
                        Imagen próximamente
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="max-w-full break-words rounded-full bg-bmg-blue/10 px-4 py-2 text-sm font-bold text-bmg-blue">
                  {product.brand?.name ??
                    'Sin marca'}
                </span>

                <span className="max-w-full break-words rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-600">
                  {product.category?.name ??
                    'Sin categoría'}
                </span>
              </div>

              <h1 className="mt-6 min-w-0 break-words text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
                {product.name}
              </h1>

              {canUseFavorites && (
  <button
    type="button"
    onClick={() =>
      toggleFavorite(product.id)
    }
    disabled={isBusy(product.id)}
    aria-pressed={
      isFavorite(product.id)
    }
    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-bmg-dark bg-white px-4 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
  >
    <Heart
      size={16}
      fill={
        isFavorite(product.id)
          ? 'currentColor'
          : 'none'
      }
      aria-hidden="true"
    />

    <span className="text-sm font-bold">
      {isBusy(product.id)
        ? 'Actualizando...'
        : isFavorite(product.id)
          ? 'Quitar de Favoritos'
          : 'Agregar a Favoritos'}
    </span>
  </button>
)}

{favoriteErrorMessage && (
  <p
    role="alert"
    className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
  >
    {favoriteErrorMessage}
  </p>
)}

              <p className="mt-4 break-all text-sm font-semibold text-neutral-500">
                Código: {product.code}
              </p>

              <div className="mt-8 border-y border-neutral-200 py-7">
                {product.can_view_price ? (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                      Precio para clientes
                    </p>

                    <p className="mt-2 break-words text-4xl font-bold text-bmg-dark">
                      {currencyFormatter.format(
                        Number(product.price),
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                      Precio
                    </p>

                    <p className="mt-2 text-3xl font-bold text-bmg-blue">
                      Inicia sesión para consultar
                    </p>
                  </>
                )}
              </div>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <dt className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                    <Tag
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-bmg-blue"
                    />

                    Código
                  </dt>

                  <dd className="mt-2 break-all text-lg font-bold text-bmg-dark">
                    {product.code}
                  </dd>
                </div>

                <div className="min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <dt className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                    <Package
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-bmg-blue"
                    />

                    Categoría
                  </dt>

                  <dd className="mt-2 break-words text-lg font-bold text-bmg-dark">
                    {product.category?.name ??
                      'Sin categoría'}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 rounded-3xl border border-neutral-200 bg-bmg-light p-6">
                <h2 className="text-lg font-bold text-bmg-dark">
                  Información comercial
                </h2>

                <ul className="mt-5 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bmg-blue/15 text-bmg-blue">
                      <Check
                        size={15}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>

                    <span className="text-sm leading-6 text-neutral-600">
                      Los precios y las condiciones
                      comerciales están disponibles
                      para clientes registrados.
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bmg-blue/15 text-bmg-blue">
                      <Check
                        size={15}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>

                    <span className="text-sm leading-6 text-neutral-600">
                      Inicia sesión para agregar
                      productos y solicitar una
                      cotización.
                    </span>
                  </li>
                </ul>
              </div>

              {canSelectQuantity && (
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <label
                    htmlFor="product-quantity"
                    className="whitespace-nowrap text-sm font-bold text-bmg-dark"
                  >
                    Cantidad
                  </label>

                  <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white p-1">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Reducir cantidad"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-bmg-dark transition enabled:hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus
                        size={18}
                        aria-hidden="true"
                      />
                    </button>

                    <input
                      id="product-quantity"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={quantity}
                      onChange={
                        handleQuantityChange
                      }
                      className="h-11 w-14 appearance-none bg-transparent text-center font-bold text-bmg-dark outline-none"
                    />

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      aria-label="Aumentar cantidad"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-bmg-dark transition hover:bg-neutral-100"
                    >
                      <Plus
                        size={18}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <AddToCartButton
                  product={cartProduct}
                  quantity={
                    canSelectQuantity
                      ? quantity
                      : 1
                  }
                  className="max-w-xl"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

export default ProductDetail