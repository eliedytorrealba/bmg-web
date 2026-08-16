import {
  Check,
  LogIn,
  ShoppingCart,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useLocation,
} from 'react-router-dom'

import useAuth from '../../hooks/useAuth'
import useCart from '../../hooks/useCart'

function AddToCartButton({
  product,
  quantity = 1,
  className = '',
  showCartLink = true,
}) {
  const { addToCart } = useCart()

  const {
    isAuthenticated,
    isLoading,
    isAdmin,
    user,
  } = useAuth()

  const location = useLocation()

  const [wasAdded, setWasAdded] =
    useState(false)

  useEffect(() => {
    if (!wasAdded) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setWasAdded(false)
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [wasAdded])

  function handleAddToCart() {
    if (
      !isAuthenticated ||
      isAdmin ||
      user?.role !== 'client' ||
      !product
    ) {
      return
    }

    const normalizedQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1),
    )

    addToCart(
      product,
      normalizedQuantity,
    )

    setWasAdded(true)
  }

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex w-full cursor-wait items-center justify-center gap-2 rounded-full bg-neutral-200 px-5 py-3 text-sm font-bold text-neutral-500 ${className}`}
      >
        Verificando acceso...
      </button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-bmg-blue px-5 py-3 text-sm font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 ${className}`}
      >
        <LogIn
          size={18}
          aria-hidden="true"
        />

        Iniciar sesión
      </Link>
    )
  }

  if (
    isAdmin ||
    user?.role !== 'client'
  ) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-neutral-200 px-5 py-3 text-sm font-bold text-neutral-500 ${className}`}
      >
        Cotización disponible para clientes
      </button>
    )
  }

  if (!product) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-neutral-200 px-5 py-3 text-sm font-bold text-neutral-500 ${className}`}
      >
        Producto no disponible
      </button>
    )
  }

  if (wasAdded && showCartLink) {
    return (
      <div
        className={`grid gap-2 ${className}`}
        aria-live="polite"
      >
        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bmg-green px-5 py-3 text-sm font-bold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-green focus-visible:ring-offset-2"
        >
          <Check
            size={18}
            aria-hidden="true"
          />

          Producto agregado
        </button>

        <Link
          to="/carrito"
          className="text-center text-sm font-bold text-bmg-dark transition hover:text-bmg-blue"
        >
          Ver carrito
        </Link>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      aria-label={`Agregar ${product.name} al carrito`}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-bmg-dark px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 ${className}`}
    >
      <ShoppingCart
        size={18}
        aria-hidden="true"
      />

      Agregar al carrito
    </button>
  )
}

export default AddToCartButton