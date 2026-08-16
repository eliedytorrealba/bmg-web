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
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-14">
          <Link
            to="/mi-cuenta"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-bmg-dark transition hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
          >
            <ArrowLeft
              size={20}
              aria-hidden="true"
            />
            Volver a Mi cuenta
          </Link>

          <p className="mt-8 font-semibold text-bmg-blue">
            Área de clientes
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
            Favoritos
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Guarda tus productos habituales para
            encontrarlos rápidamente cuando los
            necesites.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          {errorMessage && (
            <p
              role="alert"
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700"
            >
              {successMessage}
            </p>
          )}

          {isLoading ? (
            <div className="py-20 text-center">
              <p className="font-semibold text-neutral-600">
                Cargando favoritos...
              </p>
            </div>
          ) : favorites.length === 0 ? (
            <section className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <Heart
                  size={30}
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-6 text-2xl font-bold text-bmg-dark">
                Todavía no tienes favoritos
              </h2>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-600">
                Marca tus productos preferidos
                desde el catálogo para encontrarlos
                más rápido desde tu cuenta.
              </p>

              <Link
                to="/productos"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                Ver productos
              </Link>
            </section>
          ) : (
            <section>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                  <PackageSearch
                    size={22}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="font-semibold text-bmg-blue">
                    Productos guardados
                  </p>

                  <h2 className="mt-1 text-3xl font-bold text-bmg-dark">
                    Mis favoritos
                  </h2>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map(
                  (product) => (
                    <article
                      key={product.id}
                      className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-semibold text-bmg-blue">
                          {product.brand?.name ??
                            'Sin marca'}
                        </p>

                        <h3 className="mt-2 text-xl font-bold text-bmg-dark">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                          Código:{' '}
                          {product.code ??
                            'Sin código'}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                          {product.category?.name ??
                            'Sin categoría'}
                        </p>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                        <Link
                          to={`/productos/${product.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
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
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-bmg-dark bg-white px-4 py-2.5 text-sm font-bold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                        >
                          <Heart
                            size={16}
                            fill="currentColor"
                            aria-hidden="true"
                          />

                          <span className="text-sm font-bold">
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