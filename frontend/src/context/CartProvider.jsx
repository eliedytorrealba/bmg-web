import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import CartContext from './CartContext'

const CART_STORAGE_KEY = 'bmg-shopping-cart'

function getInitialCart() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedCart = window.localStorage.getItem(
      CART_STORAGE_KEY,
    )

    if (!storedCart) {
      return []
    }

    const parsedCart = JSON.parse(storedCart)

    return Array.isArray(parsedCart)
      ? parsedCart
      : []
  } catch {
    return []
  }
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] =
    useState(getInitialCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems),
      )
    } catch {
      // El carrito continúa funcionando.
    }
  }, [cartItems])

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!product || product.id === undefined) {
        return
      }

      const normalizedQuantity = Math.max(
        1,
        Math.floor(Number(quantity) || 1),
      )

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === product.id,
        )

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  ...product,
                  quantity:
                    Number(item.quantity) +
                    normalizedQuantity,
                }
              : item,
          )
        }

        return [
          ...currentItems,
          {
            ...product,
            can_view_price:
              product.can_view_price === true,
            price:
              product.can_view_price === true
                ? Number(product.price)
                : null,
            quantity: normalizedQuantity,
          },
        ]
      })
    },
    [],
  )

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const normalizedQuantity = Math.floor(
        Number(quantity),
      )

      if (!Number.isFinite(normalizedQuantity)) {
        return
      }

      if (normalizedQuantity <= 0) {
        setCartItems((currentItems) =>
          currentItems.filter(
            (item) => item.id !== productId,
          ),
        )

        return
      }

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: normalizedQuantity,
              }
            : item,
        ),
      )
    },
    [],
  )

  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== productId,
        ),
      )
    },
    [],
  )

  const clearCart = useCallback(() => {
    setCartItems([])

    try {
      window.localStorage.removeItem(
        CART_STORAGE_KEY,
      )
    } catch {
      // El carrito se limpia igualmente.
    }
  }, [])

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  )

  const hasVisiblePrices = useMemo(
    () =>
      cartItems.some(
        (item) => item.can_view_price === true,
      ),
    [cartItems],
  )

  const allPricesVisible = useMemo(
    () =>
      cartItems.length > 0 &&
      cartItems.every(
        (item) => item.can_view_price === true,
      ),
    [cartItems],
  )

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        if (item.can_view_price !== true) {
          return total
        }

        return (
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0)
        )
      }, 0),
    [cartItems],
  )

  const value = useMemo(
    () => ({
      cartItems,
      totalItems,
      subtotal,
      hasVisiblePrices,
      allPricesVisible,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cartItems,
      totalItems,
      subtotal,
      hasVisiblePrices,
      allPricesVisible,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider