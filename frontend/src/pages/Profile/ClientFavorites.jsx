import {
  ArrowLeft,
  Heart,
  PackageSearch,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import api from '../../services/api'

function ClientFavorites() {
  const [favorites, setFavorites] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [removingId, setRemovingId] =
    useState(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await api.get(
          '/api/my/favorites',
        )

        setFavorites(
          Array.isArray(response.data.data)
            ? response.data.data
            : [],
        )
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos cargar tus productos favoritos.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  async function removeFavorite(
    productId,
  ) {
    setRemovingId(productId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await api.delete(
        `/api/my/favorites/${productId}`,
      )

      setFavorites((current) =>
        current.filter(
          (product) =>
            product.id !== productId,
        ),
      )

      window.dispatchEvent(
        new Event('favorites-updated'),
      )

      setSuccessMessage(
        'El producto se eliminó de favoritos.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
          'No pudimos eliminar el producto de favoritos.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
          <Link
            to="/mi-cuenta"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-bmg-dark transition hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Volver a Mi cuenta
          </Link>

          <p className="mt-5 font-semibold text-bmg-blue">
            Área de clientes
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-bmg-dark sm:text-4xl">
            Favoritos
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            Guarda tus productos habituales para
            encontrarlos rápidamente cuando los
            necesites.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
          {errorMessage && (
            <p
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700"
            >
              {successMessage}
            </p>
          )}

          {isLoading ? (
            <div className="py-16 text-center">
              <p className="font-semibold text-neutral-600">
                Cargando favoritos...
              </p>
            </div>
          ) : favorites.length === 0 ? (
            <section className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <Heart
                  size={27}
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-5 text-2xl font-bold text-bmg-dark">
                Todavía no tienes favoritos
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
                Marca tus productos preferidos
                desde el catálogo para encontrarlos
                más rápido desde tu cuenta.
              </p>

              <Link
                to="/productos"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-bmg-blue px-6 py-2.5 text-sm font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                Ver productos
              </Link>
            </section>
          ) : (
            <section>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                  <PackageSearch
                    size={20}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="text-sm font-semibold text-bmg-blue">
                    Productos guardados
                  </p>

                  <h2 className="mt-0.5 text-2xl font-bold text-bmg-dark">
                    Mis favoritos
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {favorites.map(
                  (product) => (
                    <article
                      key={product.id}
                      className="flex min-w-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold uppercase tracking-wide text-bmg-blue">
                          {product.brand?.name ??
                            'Sin marca'}
                        </p>

                        <Link
                          to={`/productos/${product.id}`}
                          className="mt-1.5 block transition hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                        >
                          <h3 className="line-clamp-3 text-sm font-bold leading-5 text-bmg-dark">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="mt-2 text-xs text-neutral-500">
                          Código:{' '}
                          {product.code ??
                            'Sin código'}
                        </p>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                          {product.category?.name ??
                            'Sin categoría'}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200 pt-4">
                        <Link
                          to={`/productos/${product.id}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-full bg-bmg-dark px-3 py-2 text-xs font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                        >
                          Ver producto
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            removeFavorite(
                              product.id,
                            )
                          }
                          disabled={
                            removingId ===
                            product.id
                          }
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-bmg-dark transition hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                        >
                          <Heart
                            size={14}
                            fill="currentColor"
                            aria-hidden="true"
                          />

                          <span>
                            {removingId ===
                            product.id
                              ? 'Quitando...'
                              : 'Quitar'}
                          </span>
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}

export default ClientFavorites
