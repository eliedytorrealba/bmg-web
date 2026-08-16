import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCheck,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import api from '../../services/api'

const dateTimeFormatter =
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const dateFormatter =
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

function ClientNotifications() {
  const [notifications, setNotifications] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [readingId, setReadingId] =
    useState(null)

  const [
    isMarkingAll,
    setIsMarkingAll,
  ] = useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.is_read,
      ).length,
    [notifications],
  )

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await api.get(
          '/api/my/notifications',
        )

        setNotifications(
          Array.isArray(response.data.data)
            ? response.data.data
            : [],
        )
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos cargar tus notificaciones.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  async function markAsRead(
    notificationId,
  ) {
    setReadingId(notificationId)
    setErrorMessage('')

    try {
      const response = await api.patch(
        `/api/my/notifications/${notificationId}/read`,
      )

      const updatedNotification =
        response.data.data.notification

      setNotifications((current) =>
        current.map((notification) =>
          notification.id ===
          notificationId
            ? updatedNotification
            : notification,
        ),
      )

      window.dispatchEvent(
        new Event(
          'notifications-updated',
        ),
      )
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
          'No pudimos actualizar la notificación.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } finally {
      setReadingId(null)
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return
    }

    setIsMarkingAll(true)
    setErrorMessage('')

    try {
      await api.patch(
        '/api/my/notifications/read-all',
      )

      const readAt =
        new Date().toISOString()

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at:
            notification.read_at ??
            readAt,
        })),
      )

      window.dispatchEvent(
        new Event(
          'notifications-updated',
        ),
      )
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
          'No pudimos marcar todas las notificaciones como leídas.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } finally {
      setIsMarkingAll(false)
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
            Notificaciones
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Consulta novedades, promociones y
            mensajes enviados por BMG.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
          {errorMessage && (
            <p
              role="alert"
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {isLoading ? (
            <div className="py-20 text-center">
              <p className="font-semibold text-neutral-600">
                Cargando notificaciones...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <section className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <Bell
                  size={30}
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-6 text-2xl font-bold text-bmg-dark">
                No tienes notificaciones
              </h2>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-600">
                Cuando BMG envíe una promoción,
                aviso o novedad, aparecerá aquí.
              </p>
            </section>
          ) : (
            <section>
              <div className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-bmg-blue">
                    Mensajes recientes
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-bmg-dark">
                    Tus notificaciones
                  </h2>

                  <p className="mt-2 text-sm text-neutral-500">
                    {unreadCount === 0
                      ? 'No tienes notificaciones sin leer.'
                      : unreadCount === 1
                        ? '1 notificación sin leer.'
                        : `${unreadCount} notificaciones sin leer.`}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={isMarkingAll}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-bmg-dark bg-white px-4 text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                  >
                    <CheckCheck
                      size={16}
                      aria-hidden="true"
                    />

                    <span className="text-sm font-bold leading-none">
                      {isMarkingAll
                        ? 'Actualizando...'
                        : 'Marcar todas como leídas'}
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-8 space-y-5">
                {notifications.map(
                  (notification) => {
                    const isUnread =
                      !notification.is_read

                    return (
                      <article
                        key={notification.id}
                        className={`rounded-3xl border p-6 shadow-sm sm:p-7 ${
                          isUnread
                            ? 'border-bmg-blue bg-bmg-blue/5'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                isUnread
                                  ? 'bg-bmg-blue text-bmg-dark'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              {isUnread ? (
                                <BellRing
                                  size={21}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Bell
                                  size={21}
                                  aria-hidden="true"
                                />
                              )}
                            </span>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-bold text-bmg-dark">
                                  {notification.title}
                                </h3>

                                {isUnread && (
                                  <span className="rounded-full bg-bmg-blue px-3 py-1 text-xs font-bold text-bmg-dark">
                                    Nueva
                                  </span>
                                )}
                              </div>

                              <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-600">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-4 text-sm text-neutral-500">
                                {notification.created_at
                                  ? dateTimeFormatter.format(
                                      new Date(
                                        notification.created_at,
                                      ),
                                    )
                                  : 'Sin fecha'}
                              </p>

                              {notification.expires_at && (
                                <p className="mt-2 text-sm font-semibold text-neutral-500">
                                  Válido hasta:{' '}
                                  {dateFormatter.format(
                                    new Date(
                                      notification.expires_at,
                                    ),
                                  )}
                                </p>
                              )}
                            </div>
                          </div>

                          {isUnread && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id,
                                )
                              }
                              disabled={
                                readingId ===
                                  notification.id ||
                                isMarkingAll
                              }
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-bmg-dark bg-white px-4 text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                            >
                              <CheckCheck
                                size={16}
                                aria-hidden="true"
                              />

                              <span className="text-sm font-bold leading-none">
                                {readingId ===
                                notification.id
                                  ? 'Actualizando...'
                                  : 'Marcar como leída'}
                              </span>
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}

export default ClientNotifications