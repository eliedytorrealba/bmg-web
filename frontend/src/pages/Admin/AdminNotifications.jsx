import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import api from '../../services/api'

import {
  createAdminNotification,
  deleteAdminNotification,
  deleteBulkAdminNotifications,
  getAdminNotifications,
} from '../../services/adminNotificationService'

import {
  getAdminClients,
} from '../../services/adminClientService'

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

const CONTROL_TEXT_CLASS =
  'text-sm font-bold leading-5'

const CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
}

const NORMAL_CONTROL_TEXT_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '20px',
}

function AdminNotifications() {
  const [
    notifications,
    setNotifications,
  ] = useState([])

  const [
    clients,
    setClients,
  ] = useState([])

  const [
    selectedClientIds,
    setSelectedClientIds,
  ] = useState([])

  const [
    selectedNotificationIds,
    setSelectedNotificationIds,
  ] = useState([])

  const [
    clientSearch,
    setClientSearch,
  ] = useState('')

  const [
    sendToAll,
    setSendToAll,
  ] = useState(false)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    isDeletingSelected,
    setIsDeletingSelected,
  ] = useState(false)

  const [
    isDeleteSelectedModalOpen,
    setIsDeleteSelectedModalOpen,
  ] = useState(false)

  const [
    isDeletingAll,
    setIsDeletingAll,
  ] = useState(false)

  const [
    isDeleteAllModalOpen,
    setIsDeleteAllModalOpen,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    notificationSearch,
    setNotificationSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    clientFilter,
    setClientFilter,
  ] = useState('all')

  const [
    formData,
    setFormData,
  ] = useState({
    title: '',
    message: '',
    expires_at: '',
  })

  const totalUnread = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.is_read,
      ).length,
    [notifications],
  )

  const totalRead =
    notifications.length -
    totalUnread

  const filteredClients = useMemo(
    () => {
      const search =
        clientSearch
          .trim()
          .toLowerCase()

      if (!search) {
        return clients
      }

      return clients.filter(
        (client) => {
          const searchableText = [
            client.name,
            client.email,
            client.company,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchableText.includes(
            search,
          )
        },
      )
    },
    [
      clients,
      clientSearch,
    ],
  )

  const filteredNotifications =
    useMemo(
      () => {
        const search =
          notificationSearch
            .trim()
            .toLowerCase()

        return notifications.filter(
          (notification) => {
            const matchesSearch =
              !search ||
              [
                notification.title,
                notification.message,
                notification.user?.name,
                notification.user?.email,
                notification.user?.company,
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(search)

            const matchesStatus =
              statusFilter === 'all' ||
              (
                statusFilter === 'unread' &&
                !notification.is_read
              ) ||
              (
                statusFilter === 'read' &&
                notification.is_read
              )

            const matchesClient =
              clientFilter === 'all' ||
              String(
                notification.user_id,
              ) === clientFilter

            return (
              matchesSearch &&
              matchesStatus &&
              matchesClient
            )
          },
        )
      },
      [
        notifications,
        notificationSearch,
        statusFilter,
        clientFilter,
      ],
    )

  const hasActiveFilters =
    notificationSearch.trim() !== '' ||
    statusFilter !== 'all' ||
    clientFilter !== 'all'

  const allVisibleClientsSelected =
    filteredClients.length > 0 &&
    filteredClients.every(
      (client) =>
        selectedClientIds.includes(
          client.id,
        ),
    )

  const allVisibleNotificationsSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every(
      (notification) =>
        selectedNotificationIds.includes(
          notification.id,
        ),
    )

  const selectedNotificationsCount =
    selectedNotificationIds.length

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [
          notificationsData,
          clientsResponse,
        ] = await Promise.all([
          getAdminNotifications(),
          getAdminClients(),
        ])

        if (!isMounted) {
          return
        }

        setNotifications(
          notificationsData,
        )

        setClients(
          Array.isArray(
            clientsResponse.data,
          )
            ? clientsResponse.data
            : [],
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos cargar la información de notificaciones.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  function resetForm() {
    setFormData({
      title: '',
      message: '',
      expires_at: '',
    })

    setSelectedClientIds([])
    setClientSearch('')
    setSendToAll(false)
    setErrorMessage('')
  }

  function openForm() {
    resetForm()
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    if (isSubmitting) {
      return
    }

    setIsFormOpen(false)
    resetForm()
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function toggleClient(clientId) {
    setSelectedClientIds(
      (current) => {
        if (
          current.includes(clientId)
        ) {
          return current.filter(
            (id) =>
              id !== clientId,
          )
        }

        return [
          ...current,
          clientId,
        ]
      },
    )
  }

  function selectAllVisibleClients() {
    const visibleIds =
      filteredClients.map(
        (client) =>
          client.id,
      )

    setSelectedClientIds(
      (current) =>
        Array.from(
          new Set([
            ...current,
            ...visibleIds,
          ]),
        ),
    )
  }

  function removeVisibleClients() {
    const visibleIds =
      new Set(
        filteredClients.map(
          (client) =>
            client.id,
        ),
      )

    setSelectedClientIds(
      (current) =>
        current.filter(
          (id) =>
            !visibleIds.has(id),
        ),
    )
  }

  function clearSelectedClients() {
    setSelectedClientIds([])
  }

  function clearFilters() {
    setNotificationSearch('')
    setStatusFilter('all')
    setClientFilter('all')
  }

  function handleSendToAllChange(
    event,
  ) {
    const checked =
      event.target.checked

    setSendToAll(checked)

    if (checked) {
      setSelectedClientIds([])
      setClientSearch('')
    }
  }

  function toggleNotification(
    notificationId,
  ) {
    setSelectedNotificationIds(
      (current) => {
        if (
          current.includes(
            notificationId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== notificationId,
          )
        }

        return [
          ...current,
          notificationId,
        ]
      },
    )
  }

  function selectReadNotifications() {
    const readIds =
      notifications
        .filter(
          (notification) =>
            notification.is_read,
        )
        .map(
          (notification) =>
            notification.id,
        )

    setSelectedNotificationIds(
      readIds,
    )
  }

  function selectVisibleNotifications() {
    const visibleIds =
      filteredNotifications.map(
        (notification) =>
          notification.id,
      )

    setSelectedNotificationIds(
      (current) =>
        Array.from(
          new Set([
            ...current,
            ...visibleIds,
          ]),
        ),
    )
  }

  function removeVisibleNotifications() {
    const visibleIds =
      new Set(
        filteredNotifications.map(
          (notification) =>
            notification.id,
        ),
      )

    setSelectedNotificationIds(
      (current) =>
        current.filter(
          (id) =>
            !visibleIds.has(id),
        ),
    )
  }

  function clearSelectedNotifications() {
    setSelectedNotificationIds([])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (
      !sendToAll &&
      selectedClientIds.length === 0
    ) {
      setErrorMessage(
        'Selecciona al menos un cliente.',
      )

      setIsSubmitting(false)

      return
    }

    try {
      const payload = {
        send_to_all:
          sendToAll,

        user_ids:
          sendToAll
            ? []
            : selectedClientIds,

        title:
          formData.title.trim(),

        message:
          formData.message.trim(),

        expires_at:
          formData.expires_at ||
          null,
      }

      const response =
        await createAdminNotification(
          payload,
        )

      const newNotifications =
        Array.isArray(
          response.data
            ?.notifications,
        )
          ? response.data
              .notifications
          : []

      if (
        newNotifications.length > 0
      ) {
        setNotifications(
          (current) => [
            ...newNotifications,
            ...current,
          ],
        )
      }

      setSuccessMessage(
        response.message ??
          'Notificación enviada correctamente.',
      )

      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      const validationErrors =
        error.response?.data
          ?.errors

      if (
        validationErrors &&
        typeof validationErrors ===
          'object'
      ) {
        const firstError =
          Object.values(
            validationErrors,
          )
            .flat()
            .find(Boolean)

        setErrorMessage(
          firstError ??
            'No pudimos enviar la notificación.',
        )
      } else {
        setErrorMessage(
          error.response?.data
            ?.message ??
            'No pudimos enviar la notificación.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(
    notificationId,
  ) {
    const confirmed =
      window.confirm(
        '¿Seguro que deseas eliminar esta notificación del historial administrativo?',
      )

    if (!confirmed) {
      return
    }

    setDeletingId(
      notificationId,
    )

    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await deleteAdminNotification(
          notificationId,
        )

      setNotifications(
        (current) =>
          current.filter(
            (notification) =>
              notification.id !==
              notificationId,
          ),
      )

      setSelectedNotificationIds(
        (current) =>
          current.filter(
            (id) =>
              id !== notificationId,
          ),
      )

      setSuccessMessage(
        response.message ??
          'Notificación eliminada del historial administrativo.',
      )
    } catch (error) {
      setErrorMessage(
        error.response?.data
          ?.message ??
          'No pudimos eliminar la notificación.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteSelected() {
    if (
      selectedNotificationIds.length ===
      0
    ) {
      return
    }

    setIsDeletingSelected(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await deleteBulkAdminNotifications(
          selectedNotificationIds,
        )

      const selectedIds =
        new Set(
          selectedNotificationIds,
        )

      setNotifications(
        (current) =>
          current.filter(
            (notification) =>
              !selectedIds.has(
                notification.id,
              ),
          ),
      )

      setSelectedNotificationIds([])

      setSuccessMessage(
        response.message ??
          'Las notificaciones seleccionadas fueron eliminadas del historial administrativo.',
      )

      setIsDeleteSelectedModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error.response?.data
          ?.message ??
          'No pudimos eliminar las notificaciones seleccionadas.',
      )
    } finally {
      setIsDeletingSelected(false)
    }
  }

  async function handleDeleteAll() {
    setIsDeletingAll(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await api.delete(
          '/api/admin/notifications/all',
        )

      setNotifications([])
      setSelectedNotificationIds([])
      clearFilters()

      setSuccessMessage(
        response.data?.message ??
          'Todas las notificaciones fueron eliminadas del historial administrativo.',
      )

      setIsDeleteAllModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error.response?.data
          ?.message ??
          'No pudimos eliminar todas las notificaciones.',
      )
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 transition hover:text-bmg-blue"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Volver al Panel
        </Link>

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <Bell
                  size={26}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-semibold text-bmg-blue">
                  Administración
                </p>

                <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                  Notificaciones
                </h1>

                <p className="mt-3 text-neutral-600">
                  Administra avisos,
                  promociones y novedades
                  enviados a tus clientes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openForm}
              style={
                CONTROL_TEXT_STYLE
              }
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-bmg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2`}
            >
              <Plus
                size={18}
                aria-hidden="true"
              />

              Nueva notificación
            </button>
          </div>
        </section>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          >
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700"
          >
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <p>
              {successMessage}
            </p>
          </div>
        )}

        {isFormOpen && (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-bmg-blue">
                  Nueva notificación
                </p>

                <h2 className="mt-1 text-2xl font-bold text-bmg-dark">
                  Crear mensaje
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-50"
                aria-label="Cerrar formulario"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid gap-6"
            >
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block font-bold text-bmg-dark">
                    Destinatarios
                  </label>

                  {!sendToAll &&
                    selectedClientIds.length >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          clearSelectedClients
                        }
                        className="text-sm font-semibold text-neutral-500 transition hover:text-bmg-blue"
                      >
                        Limpiar selección
                      </button>
                    )}
                </div>

                <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-bmg-blue/30 bg-bmg-blue/5 p-4">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={
                      handleSendToAllChange
                    }
                    className="mt-1 h-4 w-4 accent-bmg-blue"
                  />

                  <span>
                    <span className="flex items-center gap-2 font-bold text-bmg-dark">
                      <Users
                        size={18}
                        aria-hidden="true"
                      />

                      Enviar a todos los clientes
                    </span>

                    <span className="mt-1 block text-sm text-neutral-600">
                      La notificación será enviada a{' '}
                      {clients.length}{' '}
                      {clients.length === 1
                        ? 'cliente'
                        : 'clientes'}
                      .
                    </span>
                  </span>
                </label>

                {!sendToAll && (
                  <>
                    <div className="relative mt-4">
                      <Search
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        type="search"
                        value={
                          clientSearch
                        }
                        onChange={(
                          event,
                        ) =>
                          setClientSearch(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Nombre, email, empresa..."
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`min-h-11 w-full rounded-full border border-neutral-300 bg-white py-2 pl-11 pr-4 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition placeholder:font-normal placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15`}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-neutral-500">
                        {selectedClientIds.length ===
                        0
                          ? 'Ningún cliente seleccionado.'
                          : selectedClientIds.length ===
                              1
                            ? '1 cliente seleccionado.'
                            : `${selectedClientIds.length} clientes seleccionados.`}
                      </p>

                      {filteredClients.length >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            allVisibleClientsSelected
                              ? removeVisibleClients
                              : selectAllVisibleClients
                          }
                          className="text-sm font-bold text-bmg-blue transition hover:text-bmg-dark"
                        >
                          {allVisibleClientsSelected
                            ? 'Deseleccionar resultados'
                            : 'Seleccionar resultados'}
                        </button>
                      )}
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-neutral-200 bg-white">
                      {filteredClients.length ===
                      0 ? (
                        <p className="px-5 py-8 text-center text-sm text-neutral-500">
                          No encontramos clientes con esa búsqueda.
                        </p>
                      ) : (
                        filteredClients.map(
                          (
                            client,
                          ) => {
                            const isSelected =
                              selectedClientIds.includes(
                                client.id,
                              )

                            return (
                              <label
                                key={
                                  client.id
                                }
                                className={`flex cursor-pointer items-start gap-3 border-b border-neutral-100 px-5 py-4 transition last:border-b-0 ${
                                  isSelected
                                    ? 'bg-bmg-blue/5'
                                    : 'hover:bg-neutral-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    isSelected
                                  }
                                  onChange={() =>
                                    toggleClient(
                                      client.id,
                                    )
                                  }
                                  className="mt-1 h-4 w-4 accent-bmg-blue"
                                />

                                <span className="min-w-0">
                                  <span className="block font-bold text-bmg-dark">
                                    {
                                      client.name
                                    }
                                  </span>

                                  <span className="mt-1 block text-sm text-neutral-500">
                                    {
                                      client.email
                                    }
                                  </span>

                                  {client.company && (
                                    <span className="mt-1 block text-sm text-neutral-600">
                                      {
                                        client.company
                                      }
                                    </span>
                                  )}
                                </span>
                              </label>
                            )
                          },
                        )
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block font-bold text-bmg-dark"
                >
                  Título
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={150}
                  required
                  style={
                    NORMAL_CONTROL_TEXT_STYLE
                  }
                  className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  placeholder="Ej. Nueva promoción disponible"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-bold text-bmg-dark"
                >
                  Mensaje
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={
                    formData.message
                  }
                  onChange={
                    handleChange
                  }
                  required
                  rows={6}
                  style={
                    NORMAL_CONTROL_TEXT_STYLE
                  }
                  className="w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                  placeholder="Escribe el mensaje que recibirá el cliente."
                />
              </div>

              <div>
                <label
                  htmlFor="expires_at"
                  className="mb-2 block font-bold text-bmg-dark"
                >
                  Fecha de vencimiento

                  <span className="ml-2 font-normal text-neutral-500">
                    Opcional
                  </span>
                </label>

                <input
                  id="expires_at"
                  name="expires_at"
                  type="datetime-local"
                  value={
                    formData.expires_at
                  }
                  onChange={
                    handleChange
                  }
                  style={
                    NORMAL_CONTROL_TEXT_STYLE
                  }
                  className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15 sm:max-w-md"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={
                    isSubmitting
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-wait disabled:opacity-50`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  style={
                    CONTROL_TEXT_STYLE
                  }
                  className={`inline-flex min-h-10 items-center justify-center rounded-full bg-bmg-blue px-4 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-bmg-dark disabled:cursor-wait disabled:opacity-60`}
                >
                  {isSubmitting
                    ? 'Enviando...'
                    : 'Enviar notificación'}
                </button>
              </div>
            </form>
          </section>
        )}

        {isLoading && (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando notificaciones...
            </p>
          </section>
        )}

        {!isLoading &&
          notifications.length === 0 && (
            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <Bell
                  size={26}
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-5 text-2xl font-bold text-bmg-dark">
                No hay notificaciones
              </h2>

              <p className="mt-3 text-neutral-600">
                Las notificaciones enviadas aparecerán aquí.
              </p>
            </section>
          )}

        {!isLoading &&
          notifications.length > 0 && (
            <>
              <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="shrink-0">
                    <p className="text-sm font-semibold text-neutral-500">
                      Notificaciones disponibles
                    </p>

                    <p className="mt-1 text-lg font-bold text-bmg-dark">
                      {
                        filteredNotifications.length
                      }{' '}
                      {filteredNotifications.length ===
                      1
                        ? 'notificación'
                        : 'notificaciones'}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {totalUnread} sin leer ·{' '}
                      {totalRead} leídas
                    </p>
                  </div>

                  <div className="grid w-full gap-4 sm:grid-cols-2 xl:max-w-4xl xl:grid-cols-[minmax(280px,1fr)_220px_220px]">
                    <div>
                      <label
                        htmlFor="notification-search"
                        className="text-sm font-bold text-bmg-dark"
                      >
                        Buscar notificación
                      </label>

                      <div className="relative mt-2">
                        <Search
                          size={17}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          id="notification-search"
                          type="search"
                          value={
                            notificationSearch
                          }
                          onChange={(
                            event,
                          ) =>
                            setNotificationSearch(
                              event.target
                                .value,
                            )
                          }
                          placeholder="Cliente, email, título..."
                          style={
                            CONTROL_TEXT_STYLE
                          }
                          className={`min-h-11 w-full rounded-full border border-neutral-300 bg-white py-2 pl-11 pr-4 ${CONTROL_TEXT_CLASS} text-bmg-dark outline-none transition placeholder:font-normal placeholder:text-neutral-400 hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15`}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="notification-client-filter"
                        className="text-sm font-bold text-bmg-dark"
                      >
                        Cliente
                      </label>

                      <select
                        id="notification-client-filter"
                        value={
                          clientFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setClientFilter(
                            event.target
                              .value,
                          )
                        }
                        style={
                          NORMAL_CONTROL_TEXT_STYLE
                        }
                        className="mt-2 min-h-11 w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-normal leading-5 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                      >
                        <option value="all">
                          Todos los clientes
                        </option>

                        {clients.map(
                          (client) => (
                            <option
                              key={
                                client.id
                              }
                              value={
                                client.id
                              }
                            >
                              {
                                client.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="notification-status-filter"
                        className="text-sm font-bold text-bmg-dark"
                      >
                        Estado
                      </label>

                      <select
                        id="notification-status-filter"
                        value={
                          statusFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setStatusFilter(
                            event.target
                              .value,
                          )
                        }
                        style={
                          NORMAL_CONTROL_TEXT_STYLE
                        }
                        className="mt-2 min-h-11 w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-normal leading-5 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                      >
                        <option value="all">
                          Todos los estados
                        </option>

                        <option value="unread">
                          Sin leer
                        </option>

                        <option value="read">
                          Leídas
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      style={
                        CONTROL_TEXT_STYLE
                      }
                      className="text-sm font-bold text-bmg-blue transition hover:text-bmg-dark"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </section>

              {filteredNotifications.length ===
              0 ? (
                <section className="mt-6 rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-bmg-dark">
                    No encontramos notificaciones
                  </h2>

                  <p className="mt-2 text-neutral-600">
                    Prueba con otro cliente, estado o término de búsqueda.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    style={
                      CONTROL_TEXT_STYLE
                    }
                    className={`mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
                  >
                    Limpiar filtros
                  </button>
                </section>
              ) : (
                <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm font-normal text-neutral-500">
                      {selectedNotificationsCount >
                      0
                        ? `${selectedNotificationsCount} ${
                            selectedNotificationsCount ===
                            1
                              ? 'notificación seleccionada'
                              : 'notificaciones seleccionadas'
                          }`
                        : 'Selecciona las notificaciones que deseas administrar.'}
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={
                          selectReadNotifications
                        }
                        disabled={
                          totalRead === 0
                        }
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`inline-flex min-h-10 items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        Seleccionar leídas
                      </button>

                      <button
                        type="button"
                        onClick={
                          allVisibleNotificationsSelected
                            ? removeVisibleNotifications
                            : selectVisibleNotifications
                        }
                        disabled={
                          filteredNotifications.length ===
                          0
                        }
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`inline-flex min-h-10 items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {allVisibleNotificationsSelected
                          ? 'Deseleccionar visibles'
                          : 'Seleccionar visibles'}
                      </button>

                      {selectedNotificationsCount >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            clearSelectedNotifications
                          }
                          style={
                            CONTROL_TEXT_STYLE
                          }
                          className={`inline-flex min-h-10 items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
                        >
                          Deseleccionar todas
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setIsDeleteSelectedModalOpen(
                            true,
                          )
                        }
                        disabled={
                          selectedNotificationsCount ===
                          0
                        }
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <Trash2
                          size={16}
                          aria-hidden="true"
                        />

                        Eliminar seleccionadas
                        {selectedNotificationsCount >
                          0 &&
                          ` (${selectedNotificationsCount})`}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setIsDeleteAllModalOpen(
                            true,
                          )
                        }
                        disabled={
                          notifications.length ===
                            0 ||
                          isDeletingAll
                        }
                        style={
                          CONTROL_TEXT_STYLE
                        }
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <Trash2
                          size={16}
                          aria-hidden="true"
                        />

                        Eliminar todas
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="w-12 px-5 py-4">
                            <span className="sr-only">
                              Selección
                            </span>
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Cliente
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Notificación
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Estado
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Enviada
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Vence
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Acción
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-neutral-200">
                        {filteredNotifications.map(
                          (
                            notification,
                          ) => {
                            const isSelected =
                              selectedNotificationIds.includes(
                                notification.id,
                              )

                            return (
                              <tr
                                key={
                                  notification.id
                                }
                                className={`transition hover:bg-neutral-50 ${
                                  isSelected
                                    ? 'bg-bmg-blue/5'
                                    : ''
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <input
                                    type="checkbox"
                                    checked={
                                      isSelected
                                    }
                                    onChange={() =>
                                      toggleNotification(
                                        notification.id,
                                      )
                                    }
                                    className="h-4 w-4 accent-bmg-blue"
                                    aria-label={`Seleccionar ${notification.title}`}
                                  />
                                </td>

                                <td className="px-5 py-4">
                                  <p className="font-bold text-bmg-dark">
                                    {notification
                                      .user
                                      ?.name ??
                                      'Cliente'}
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-500">
                                    {notification
                                      .user
                                      ?.email ??
                                      'Sin email'}
                                  </p>
                                </td>

                                <td className="max-w-md px-5 py-4">
                                  <p className="font-bold text-bmg-dark">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-sm font-normal leading-5 text-neutral-600">
                                    {
                                      notification.message
                                    }
                                  </p>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                      notification.is_read
                                        ? 'bg-neutral-100 text-neutral-600'
                                        : 'bg-bmg-blue/15 text-bmg-dark'
                                    }`}
                                  >
                                    {notification.is_read
                                      ? 'Leída'
                                      : 'Sin leer'}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-neutral-600">
                                  {notification.created_at
                                    ? dateTimeFormatter.format(
                                        new Date(
                                          notification.created_at,
                                        ),
                                      )
                                    : 'Sin fecha'}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm font-normal text-neutral-600">
                                  {notification.expires_at
                                    ? dateFormatter.format(
                                        new Date(
                                          notification.expires_at,
                                        ),
                                      )
                                    : 'Sin vencimiento'}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        notification.id,
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      notification.id
                                    }
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                                    aria-label={`Eliminar ${notification.title}`}
                                    title="Eliminar del historial administrativo"
                                  >
                                    <Trash2
                                      size={17}
                                      aria-hidden="true"
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
      </div>

      {isDeleteSelectedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-selected-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-red-600">
                  Confirmar eliminación
                </p>

                <h2
                  id="delete-selected-title"
                  className="mt-1 text-2xl font-bold text-bmg-dark"
                >
                  ¿Eliminar las notificaciones seleccionadas?
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsDeleteSelectedModalOpen(
                    false,
                  )
                }
                disabled={
                  isDeletingSelected
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            <p className="mt-5 leading-7 text-neutral-600">
              Se quitarán del historial administrativo{' '}
              <strong>
                {
                  selectedNotificationsCount
                }{' '}
                {selectedNotificationsCount ===
                1
                  ? 'notificación'
                  : 'notificaciones'}
              </strong>
              .
            </p>

            <p className="mt-3 leading-7 text-neutral-600">
              Las notificaciones seguirán disponibles en la cuenta de cada cliente.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setIsDeleteSelectedModalOpen(
                    false,
                  )
                }
                disabled={
                  isDeletingSelected
                }
                style={
                  CONTROL_TEXT_STYLE
                }
                className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-50`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteSelected
                }
                disabled={
                  isDeletingSelected
                }
                style={
                  CONTROL_TEXT_STYLE
                }
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60`}
              >
                <Trash2
                  size={17}
                  aria-hidden="true"
                />

                {isDeletingSelected
                  ? 'Eliminando...'
                  : `Eliminar (${selectedNotificationsCount})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-all-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-red-600">
                  Confirmar eliminación
                </p>

                <h2
                  id="delete-all-title"
                  className="mt-1 text-2xl font-bold text-bmg-dark"
                >
                  ¿Eliminar todas las notificaciones?
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsDeleteAllModalOpen(
                    false,
                  )
                }
                disabled={isDeletingAll}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            <p className="mt-5 leading-7 text-neutral-600">
              Se quitarán todas las notificaciones del historial administrativo.
            </p>

            <p className="mt-3 leading-7 text-neutral-600">
              Esta acción no elimina las notificaciones de las cuentas de los clientes.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setIsDeleteAllModalOpen(
                    false,
                  )
                }
                disabled={isDeletingAll}
                style={
                  CONTROL_TEXT_STYLE
                }
                className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-50`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                style={
                  CONTROL_TEXT_STYLE
                }
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60`}
              >
                <Trash2
                  size={17}
                  aria-hidden="true"
                />

                {isDeletingAll
                  ? 'Eliminando...'
                  : 'Eliminar todas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminNotifications