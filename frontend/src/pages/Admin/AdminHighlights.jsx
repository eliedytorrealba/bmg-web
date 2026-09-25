import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  createHighlight,
  deleteHighlight,
  getAdminHighlights,
  updateHighlight,
} from '../../services/featuredHighlightService'

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

function AdminHighlights() {
  const [
    highlights,
    setHighlights,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false)

  const [
    editingHighlight,
    setEditingHighlight,
  ] = useState(null)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    imagePreview,
    setImagePreview,
  ] = useState('')

  const [
    formData,
    setFormData,
  ] = useState({
    title: '',
    alt_text: '',
    link_url: '',
    is_active: true,
    sort_order: 0,
    starts_at: '',
    ends_at: '',
    image: null,
  })

  const activeCount =
    useMemo(
      () =>
        highlights.filter(
          (highlight) =>
            highlight.is_active,
        ).length,
      [highlights],
    )

  useEffect(() => {
    let isMounted = true

    async function loadHighlights() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data =
          await getAdminHighlights()

        if (!isMounted) {
          return
        }

        setHighlights(data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos cargar los destacados.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHighlights()

    return () => {
      isMounted = false
    }
  }, [])

  function resetForm() {
    if (
      imagePreview &&
      imagePreview.startsWith(
        'blob:',
      )
    ) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    setFormData({
      title: '',
      alt_text: '',
      link_url: '',
      is_active: true,
      sort_order: 0,
      starts_at: '',
      ends_at: '',
      image: null,
    })

    setImagePreview('')
    setEditingHighlight(null)
    setErrorMessage('')
  }

  function openCreateForm() {
    resetForm()
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(
    highlight,
  ) {
    resetForm()
    setSuccessMessage('')

    setEditingHighlight(
      highlight,
    )

    setFormData({
      title:
        highlight.title ?? '',

      alt_text:
        highlight.alt_text ?? '',

      link_url:
        highlight.link_url ?? '',

      is_active:
        Boolean(
          highlight.is_active,
        ),

      sort_order:
        highlight.sort_order ?? 0,

      starts_at:
        formatDateForInput(
          highlight.starts_at,
        ),

      ends_at:
        formatDateForInput(
          highlight.ends_at,
        ),

      image: null,
    })

    setImagePreview(
      highlight.image_url ?? '',
    )

    setIsFormOpen(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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
      checked,
      type,
    } = event.target

    setFormData(
      (current) => ({
        ...current,

        [name]:
          type === 'checkbox'
            ? checked
            : value,
      }),
    )
  }

  function handleImageChange(
    event,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (
      imagePreview &&
      imagePreview.startsWith(
        'blob:',
      )
    ) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    setFormData(
      (current) => ({
        ...current,
        image: file,
      }),
    )

    setImagePreview(
      URL.createObjectURL(
        file,
      ),
    )
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (
      !editingHighlight &&
      !formData.image
    ) {
      setErrorMessage(
        'Selecciona una imagen para el destacado.',
      )

      setIsSubmitting(false)

      return
    }

    try {
      const payload = {
        ...formData,

        sort_order:
          Number(
            formData.sort_order,
          ) || 0,
      }

      const response =
        editingHighlight
          ? await updateHighlight(
              editingHighlight.id,
              payload,
            )
          : await createHighlight(
              payload,
            )

      const refreshed =
        await getAdminHighlights()

      setHighlights(
        refreshed,
      )

      setSuccessMessage(
        response.message ??
          (
            editingHighlight
              ? 'Destacado actualizado correctamente.'
              : 'Destacado creado correctamente.'
          ),
      )

      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors

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
            'No pudimos guardar el destacado.',
        )
      } else {
        setErrorMessage(
          error.response?.data?.message ??
            'No pudimos guardar el destacado.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(
    highlight,
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar "${highlight.title}"?`,
      )

    if (!confirmed) {
      return
    }

    setDeletingId(
      highlight.id,
    )

    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response =
        await deleteHighlight(
          highlight.id,
        )

      setHighlights(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              highlight.id,
          ),
      )

      setSuccessMessage(
        response.message ??
          'Destacado eliminado correctamente.',
      )

      if (
        editingHighlight?.id ===
        highlight.id
      ) {
        setIsFormOpen(false)
        resetForm()
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
          'No pudimos eliminar el destacado.',
      )
    } finally {
      setDeletingId(null)
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
                <Images
                  size={26}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-semibold text-bmg-blue">
                  Administración
                </p>

                <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                  Destacados
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
                  Administra los flyers,
                  promociones y novedades
                  que se muestran en la
                  página de inicio.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openCreateForm
              }
              style={
                CONTROL_TEXT_STYLE
              }
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-bmg-dark`}
            >
              <Plus
                size={18}
                aria-hidden="true"
              />

              Nuevo destacado
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
                  {editingHighlight
                    ? 'Editar destacado'
                    : 'Nuevo destacado'}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-bmg-dark">
                  {editingHighlight
                    ? 'Actualizar flyer'
                    : 'Subir flyer'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={
                  isSubmitting
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-50"
                aria-label="Cerrar formulario"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]"
            >
              <div className="grid gap-6">
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
                    required
                    maxLength={150}
                    style={
                      NORMAL_CONTROL_TEXT_STYLE
                    }
                    className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                    placeholder="Ej. Nuevo ingreso Stark"
                  />
                </div>

                <div>
                  <label
                    htmlFor="alt_text"
                    className="mb-2 block font-bold text-bmg-dark"
                  >
                    Texto alternativo
                  </label>

                  <input
                    id="alt_text"
                    name="alt_text"
                    type="text"
                    value={
                      formData.alt_text
                    }
                    onChange={
                      handleChange
                    }
                    required
                    maxLength={200}
                    style={
                      NORMAL_CONTROL_TEXT_STYLE
                    }
                    className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                    placeholder="Describe brevemente el flyer"
                  />

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Este texto ayuda a
                    accesibilidad y se usa
                    si la imagen no puede
                    mostrarse.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="link_url"
                    className="mb-2 block font-bold text-bmg-dark"
                  >
                    Enlace

                    <span className="ml-2 font-normal text-neutral-500">
                      Opcional
                    </span>
                  </label>

                  <input
                    id="link_url"
                    name="link_url"
                    type="text"
                    value={
                      formData.link_url
                    }
                    onChange={
                      handleChange
                    }
                    style={
                      NORMAL_CONTROL_TEXT_STYLE
                    }
                    className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                    placeholder="/productos o https://..."
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sort_order"
                      className="mb-2 block font-bold text-bmg-dark"
                    >
                      Orden
                    </label>

                    <input
                      id="sort_order"
                      name="sort_order"
                      type="number"
                      min="0"
                      max="9999"
                      value={
                        formData.sort_order
                      }
                      onChange={
                        handleChange
                      }
                      required
                      style={
                        NORMAL_CONTROL_TEXT_STYLE
                      }
                      className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={
                          formData.is_active
                        }
                        onChange={
                          handleChange
                        }
                        className="h-4 w-4 accent-bmg-blue"
                      />

                      <span className="font-bold text-bmg-dark">
                        Destacado activo
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="starts_at"
                      className="mb-2 block font-bold text-bmg-dark"
                    >
                      Mostrar desde

                      <span className="ml-2 font-normal text-neutral-500">
                        Opcional
                      </span>
                    </label>

                    <input
                      id="starts_at"
                      name="starts_at"
                      type="datetime-local"
                      value={
                        formData.starts_at
                      }
                      onChange={
                        handleChange
                      }
                      style={
                        NORMAL_CONTROL_TEXT_STYLE
                      }
                      className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ends_at"
                      className="mb-2 block font-bold text-bmg-dark"
                    >
                      Mostrar hasta

                      <span className="ml-2 font-normal text-neutral-500">
                        Opcional
                      </span>
                    </label>

                    <input
                      id="ends_at"
                      name="ends_at"
                      type="datetime-local"
                      value={
                        formData.ends_at
                      }
                      onChange={
                        handleChange
                      }
                      style={
                        NORMAL_CONTROL_TEXT_STYLE
                      }
                      className="min-h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-bmg-dark outline-none transition hover:border-bmg-blue focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="image"
                    className="mb-2 block font-bold text-bmg-dark"
                  >
                    Flyer

                    {editingHighlight && (
                      <span className="ml-2 font-normal text-neutral-500">
                        Deja vacío para conservar la imagen actual
                      </span>
                    )}
                  </label>

                  <label
                    htmlFor="image"
                    className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 transition hover:border-bmg-blue hover:bg-bmg-blue/5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                      <ImagePlus
                        size={24}
                        aria-hidden="true"
                      />
                    </span>

                    <span>
                      <span className="block font-bold text-bmg-dark">
                        Seleccionar imagen
                      </span>

                      <span className="mt-1 block text-sm text-neutral-500">
                        JPG, PNG o WEBP.
                        Máximo 8 MB.
                      </span>
                    </span>
                  </label>

                  <input
                    id="image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    className="sr-only"
                  />

                  {formData.image && (
                    <p className="mt-2 text-sm text-neutral-600">
                      Archivo:{' '}
                      <strong>
                        {
                          formData.image.name
                        }
                      </strong>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={
                      isSubmitting
                    }
                    style={
                      CONTROL_TEXT_STYLE
                    }
                    className={`inline-flex min-h-10 items-center justify-center rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue disabled:opacity-50`}
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
                    className={`inline-flex min-h-10 items-center justify-center rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-bmg-dark disabled:cursor-wait disabled:opacity-60`}
                  >
                    {isSubmitting
                      ? 'Guardando...'
                      : editingHighlight
                        ? 'Guardar cambios'
                        : 'Crear destacado'}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 font-bold text-bmg-dark">
                  Vista previa
                </p>

                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-black shadow-sm">
                  <div className="flex aspect-[16/7] items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={
                          imagePreview
                        }
                        alt={
                          formData.alt_text ||
                          'Vista previa del destacado'
                        }
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-50 px-6 text-center">
                        <Images
                          size={34}
                          className="text-neutral-300"
                          aria-hidden="true"
                        />

                        <p className="mt-3 text-sm font-semibold text-neutral-400">
                          Selecciona un flyer para previsualizarlo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  La vista previa utiliza
                  la misma proporción
                  aproximada del carrusel
                  de la página de inicio.
                </p>
              </div>
            </form>
          </section>
        )}

        {isLoading ? (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-bold text-bmg-dark">
              Cargando destacados...
            </p>
          </section>
        ) : highlights.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <Images
                size={26}
                aria-hidden="true"
              />
            </span>

            <h2 className="mt-5 text-2xl font-bold text-bmg-dark">
              No hay destacados
            </h2>

            <p className="mt-3 text-neutral-600">
              Sube el primer flyer para comenzar a mostrar novedades en la página de inicio.
            </p>

            <button
              type="button"
              onClick={
                openCreateForm
              }
              style={
                CONTROL_TEXT_STYLE
              }
              className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bmg-blue px-5 py-2 ${CONTROL_TEXT_CLASS} text-white transition hover:bg-bmg-dark`}
            >
              <Plus
                size={18}
                aria-hidden="true"
              />

              Nuevo destacado
            </button>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">
                    Destacados disponibles
                  </p>

                  <p className="mt-1 text-lg font-bold text-bmg-dark">
                    {highlights.length}{' '}
                    {highlights.length === 1
                      ? 'destacado'
                      : 'destacados'}
                  </p>
                </div>

                <div className="flex gap-4 text-sm text-neutral-600">
                  <span>
                    <strong className="text-bmg-dark">
                      {activeCount}
                    </strong>{' '}
                    activos
                  </span>

                  <span>
                    <strong className="text-bmg-dark">
                      {highlights.length -
                        activeCount}
                    </strong>{' '}
                    inactivos
                  </span>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {highlights.map(
                (highlight) => (
                  <article
                    key={
                      highlight.id
                    }
                    className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="aspect-[16/7] bg-black">
                      <img
                        src={
                          highlight.image_url
                        }
                        alt={
                          highlight.alt_text
                        }
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-bmg-dark">
                            {
                              highlight.title
                            }
                          </h2>

                          <p className="mt-1 text-sm text-neutral-500">
                            Orden:{' '}
                            {
                              highlight.sort_order
                            }
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            highlight.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {highlight.is_active ? (
                            <Eye
                              size={14}
                              aria-hidden="true"
                            />
                          ) : (
                            <EyeOff
                              size={14}
                              aria-hidden="true"
                            />
                          )}

                          {highlight.is_active
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-600">
                        {
                          highlight.alt_text
                        }
                      </p>

                      {(highlight.starts_at ||
                        highlight.ends_at) && (
                        <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-600">
                          {highlight.starts_at && (
                            <p>
                              Desde:{' '}
                              {formatDateForDisplay(
                                highlight.starts_at,
                              )}
                            </p>
                          )}

                          {highlight.ends_at && (
                            <p>
                              Hasta:{' '}
                              {formatDateForDisplay(
                                highlight.ends_at,
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              highlight,
                            )
                          }
                          style={
                            CONTROL_TEXT_STYLE
                          }
                          className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-bmg-dark bg-white px-4 py-2 ${CONTROL_TEXT_CLASS} text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue`}
                        >
                          <Pencil
                            size={16}
                            aria-hidden="true"
                          />

                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              highlight,
                            )
                          }
                          disabled={
                            deletingId ===
                            highlight.id
                          }
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                          aria-label={`Eliminar ${highlight.title}`}
                        >
                          <Trash2
                            size={17}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function formatDateForInput(
  value,
) {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  const offset =
    date.getTimezoneOffset()

  const localDate =
    new Date(
      date.getTime() -
        offset * 60000,
    )

  return localDate
    .toISOString()
    .slice(0, 16)
}

function formatDateForDisplay(
  value,
) {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'es-AR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)
}

export default AdminHighlights