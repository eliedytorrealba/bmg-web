import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import api from '../services/api'
import useAuth from './useAuth'

function useFavorites() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isClient,
  } = useAuth()

  const [favoriteIds, setFavoriteIds] =
    useState(new Set())

  const [busyIds, setBusyIds] =
    useState(new Set())

  const [errorMessage, setErrorMessage] =
    useState('')

  const canUseFavorites =
    !isAuthLoading &&
    isAuthenticated &&
    isClient

  const loadFavorites =
    useCallback(async () => {
      if (!canUseFavorites) {
        setFavoriteIds(new Set())
        return
      }

      try {
        const response = await api.get(
          '/api/my/favorites',
        )

        const products = Array.isArray(
          response.data.data,
        )
          ? response.data.data
          : []

        setFavoriteIds(
          new Set(
            products.map(
              (product) => product.id,
            ),
          ),
        )
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos consultar tus favoritos.',
        )
      }
    }, [canUseFavorites])

  useEffect(() => {
    let isMounted = true

    async function loadInitialFavorites() {
      if (!canUseFavorites) {
        return
      }

      try {
        const response = await api.get(
          '/api/my/favorites',
        )

        if (!isMounted) {
          return
        }

        const products = Array.isArray(
          response.data.data,
        )
          ? response.data.data
          : []

        setFavoriteIds(
          new Set(
            products.map(
              (product) => product.id,
            ),
          ),
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos consultar tus favoritos.',
        )
      }
    }

    loadInitialFavorites()

    return () => {
      isMounted = false
    }
  }, [canUseFavorites])

  useEffect(() => {
    function handleFavoritesUpdated() {
      loadFavorites()
    }

    window.addEventListener(
      'favorites-updated',
      handleFavoritesUpdated,
    )

    return () => {
      window.removeEventListener(
        'favorites-updated',
        handleFavoritesUpdated,
      )
    }
  }, [loadFavorites])

  const isFavorite = useCallback(
    (productId) =>
      favoriteIds.has(productId),
    [favoriteIds],
  )

  const isBusy = useCallback(
    (productId) =>
      busyIds.has(productId),
    [busyIds],
  )

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!canUseFavorites) {
        return
      }

      setErrorMessage('')

      setBusyIds((current) => {
        const next = new Set(current)
        next.add(productId)
        return next
      })

      try {
        if (favoriteIds.has(productId)) {
          await api.delete(
            `/api/my/favorites/${productId}`,
          )

          setFavoriteIds((current) => {
            const next = new Set(current)
            next.delete(productId)
            return next
          })
        } else {
          await api.post(
            `/api/my/favorites/${productId}`,
          )

          setFavoriteIds((current) => {
            const next = new Set(current)
            next.add(productId)
            return next
          })
        }

        window.dispatchEvent(
          new Event('favorites-updated'),
        )
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos actualizar tus favoritos.',
        )
      } finally {
        setBusyIds((current) => {
          const next = new Set(current)
          next.delete(productId)
          return next
        })
      }
    },
    [
      canUseFavorites,
      favoriteIds,
    ],
  )

  const favoriteCount =
    favoriteIds.size

  return {
    canUseFavorites,
    favoriteCount,
    isFavorite,
    isBusy,
    toggleFavorite,
    errorMessage,
    loadFavorites,
  }
}

export default useFavorites