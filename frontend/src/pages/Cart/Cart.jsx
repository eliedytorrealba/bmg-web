import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import useCart from '../../hooks/useCart'

const currencyFormatter = new Intl.NumberFormat(
  'es-AR',
  {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  },
)

function Cart() {
  const {
    cartItems,
    totalItems,
    subtotal,
    hasVisiblePrices,
    allPricesVisible,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  function handleClearCart() {
    const shouldClear = window.confirm(
      '¿Estás seguro de que deseas vaciar el carrito?',
    )

    if (shouldClear) {
      clearCart()
    }
  }

  if (cartItems.length === 0) {
    return (
      <main className="bg-bmg-light">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-16 lg:px-8">
          <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm sm:px-12">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <ShoppingBag
                size={38}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>

            <h1 className="mt-7 text-3xl font-bold text-bmg-dark sm:text-4xl">
              Tu carrito está vacío
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-neutral-600">
              Explora nuestro catálogo y agrega los productos
              que necesites para preparar tu cotización.
            </p>

            <Link
              to="/productos"
              className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-bmg-dark px-7 py-3 font-bold text-white transition hover:bg-neutral-700"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-14">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Continuar comprando
          </Link>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-semibold text-bmg-blue">
                Tu selección
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
                Carrito
              </h1>

              <p className="mt-4 text-neutral-600">
                {totalItems}{' '}
                {totalItems === 1
                  ? 'unidad agregada'
                  : 'unidades agregadas'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex items-center gap-2 self-start rounded-full border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:border-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:self-auto"
            >
              <Trash2
                size={17}
                aria-hidden="true"
              />

              Vaciar carrito
            </button>
          </div>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <section aria-label="Productos del carrito">
              <div className="space-y-5">
                {cartItems.map((item) => {
                  const canViewPrice =
                    item.can_view_price === true

                  const itemPrice = canViewPrice
                    ? Number(item.price) || 0
                    : null

                  const itemTotal = canViewPrice
                    ? itemPrice * item.quantity
                    : null

                  return (
                    <article
                      key={item.id}
                      className="grid gap-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[150px_1fr] sm:p-6"
                    >
                      <Link
                        to={`/productos/${item.id}`}
                        aria-label={`Ver ${item.name}`}
                        className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 p-5"
                      >
                        {item.image_url || item.image ? (
                          <img
                            src={
                              item.image_url ??
                              item.image
                            }
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package
                            size={48}
                            strokeWidth={1.4}
                            aria-hidden="true"
                            className="text-neutral-300"
                          />
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-bmg-blue">
                              {item.brand ??
                                'Sin marca'}
                            </p>

                            <Link
                              to={`/productos/${item.id}`}
                              className="mt-1 block text-xl font-bold text-bmg-dark transition hover:text-bmg-blue"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-2 text-sm text-neutral-500">
                              Código:{' '}
                              {item.code ??
                                'Sin código'}
                            </p>

                            {item.presentation && (
                              <p className="mt-1 text-sm text-neutral-500">
                                Presentación:{' '}
                                {item.presentation}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                            aria-label={`Eliminar ${item.name}`}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-red-500 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          >
                            <Trash2
                              size={18}
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        <div className="mt-6 flex flex-col gap-5 border-t border-neutral-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              Cantidad
                            </p>

                            <div className="mt-2 inline-flex items-center rounded-full border border-neutral-300 bg-white p-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={
                                  item.quantity <= 1
                                }
                                aria-label={`Reducir cantidad de ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-bmg-dark transition enabled:hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus
                                  size={17}
                                  aria-hidden="true"
                                />
                              </button>

                              <span className="min-w-10 text-center text-sm font-bold text-bmg-dark">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                  )
                                }
                                aria-label={`Aumentar cantidad de ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-bmg-dark transition hover:bg-neutral-100"
                              >
                                <Plus
                                  size={17}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            {canViewPrice ? (
                              <>
                                <p className="text-sm text-neutral-500">
                                  {currencyFormatter.format(
                                    itemPrice,
                                  )}{' '}
                                  por unidad
                                </p>

                                <p className="mt-1 text-2xl font-bold text-bmg-dark">
                                  {currencyFormatter.format(
                                    itemTotal,
                                  )}
                                </p>
                              </>
                            ) : (
                              <div>
                                <p className="text-lg font-bold text-bmg-blue">
                                  Precio a cotizar
                                </p>

                                <p className="mt-1 max-w-xs text-sm leading-6 text-neutral-500">
                                  Nuestro equipo informará
                                  el valor al responder la
                                  solicitud.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <aside aria-label="Resumen de la cotización">
              <div className="sticky top-28 rounded-3xl bg-bmg-dark p-6 text-white shadow-xl sm:p-8">
                <p className="font-semibold text-bmg-blue">
                  Resumen
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Resumen de la cotización
                </h2>

                <dl className="mt-7 space-y-4">
                  <div className="flex items-center justify-between gap-4 text-neutral-300">
                    <dt>Unidades</dt>

                    <dd className="font-bold text-white">
                      {totalItems}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-neutral-300">
                    <dt>Productos diferentes</dt>

                    <dd className="font-bold text-white">
                      {cartItems.length}
                    </dd>
                  </div>

                  {hasVisiblePrices ? (
                    <div className="border-t border-white/15 pt-5">
                      <div className="flex items-end justify-between gap-4">
                        <dt className="font-semibold text-neutral-300">
                          {allPricesVisible
                            ? 'Subtotal'
                            : 'Subtotal parcial'}
                        </dt>

                        <dd className="text-3xl font-bold text-white">
                          {currencyFormatter.format(
                            Number(subtotal) || 0,
                          )}
                        </dd>
                      </div>

                      {!allPricesVisible && (
                        <p className="mt-3 text-sm leading-6 text-neutral-400">
                          Algunos productos no tienen
                          precio disponible y serán
                          cotizados por nuestro equipo.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border-t border-white/15 pt-5">
                      <p className="font-semibold leading-7 text-bmg-blue">
                        Los precios serán informados al
                        responder tu solicitud.
                      </p>
                    </div>
                  )}
                </dl>

                <Link
                  to="/solicitar-cotizacion"
                  className="mt-7 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-bmg-blue px-6 py-3 text-center font-bold text-bmg-dark transition hover:brightness-95"
                >
                  Solicitar cotización
                </Link>

                <Link
                  to="/productos"
                  className="mt-3 inline-flex min-h-13 w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-center font-bold text-white transition hover:border-bmg-blue hover:text-bmg-blue"
                >
                  Agregar más productos
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}

export default Cart