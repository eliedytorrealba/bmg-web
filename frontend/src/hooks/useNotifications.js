import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import api from '../services/api'
import useAuth from './useAuth'

function useNotifications() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isClient,
  } = useAuth()

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0)

  const canUseNotifications =
    !isAuthLoading &&
    isAuthenticated &&
    isClient

  const loadUnreadCount =
    useCallback(async () => {
      if (!canUseNotifications) {
        setUnreadCount(0)
        return
      }

      try {
        const response = await api.get(
          '/api/my/notifications',
        )

        const notifications =
          Array.isArray(response.data.data)
            ? response.data.data
            : []

        setUnreadCount(
          notifications.filter(
            (notification) =>
              !notification.is_read,
          ).length,
        )
      } catch {
        setUnreadCount(0)
      }
    }, [canUseNotifications])

  useEffect(() => {
    let isMounted = true

    async function loadInitialUnreadCount() {
      if (!canUseNotifications) {
        return
      }

      try {
        const response = await api.get(
          '/api/my/notifications',
        )

        if (!isMounted) {
          return
        }

        const notifications =
          Array.isArray(response.data.data)
            ? response.data.data
            : []

        setUnreadCount(
          notifications.filter(
            (notification) =>
              !notification.is_read,
          ).length,
        )
      } catch {
        if (isMounted) {
          setUnreadCount(0)
        }
      }
    }

    loadInitialUnreadCount()

    return () => {
      isMounted = false
    }
  }, [canUseNotifications])

  useEffect(() => {
    function handleNotificationsUpdated() {
      loadUnreadCount()
    }

    window.addEventListener(
      'notifications-updated',
      handleNotificationsUpdated,
    )

    return () => {
      window.removeEventListener(
        'notifications-updated',
        handleNotificationsUpdated,
      )
    }
  }, [loadUnreadCount])

  return {
    unreadCount,
    loadUnreadCount,
  }
}

export default useNotifications