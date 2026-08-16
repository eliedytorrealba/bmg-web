import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  User,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

import api from '../../services/api'

const MESSAGE_MAX_LENGTH = 1000

const initialFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

function Contact() {
  const [formData, setFormData] =
    useState(initialFormData)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [wasSubmitted, setWasSubmitted] =
    useState(false)

  const [submitError, setSubmitError] =
    useState('')

  useEffect(() => {
    if (!wasSubmitted) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [wasSubmitted])

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    let nextValue = value

    if (name === 'phone') {
      nextValue = value
        .replace(/[^\d+\-()\s]/g, '')
        .slice(0, 20)
    }

    if (name === 'message') {
      nextValue = value.slice(
        0,
        MESSAGE_MAX_LENGTH,
      )
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }))

    if (submitError) {
      setSubmitError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setSubmitError('')

    const contactData = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    }

    try {
      await api.post(
        '/api/contact',
        contactData,
      )

      setFormData(initialFormData)
      setWasSubmitted(true)
    } catch (error) {
      console.error(
        'Error al enviar el formulario de contacto:',
        error,
      )

      const validationErrors =
        error.response?.data?.errors

      const firstValidationError =
        validationErrors
          ? Object.values(
              validationErrors,
            )
              .flat()
              .find(Boolean)
          : null

      setSubmitError(
        firstValidationError ||
          error.response?.data?.message ||
          'No pudimos enviar tu consulta en este momento. Inténtalo nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNewMessage() {
    setWasSubmitted(false)
    setSubmitError('')
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <p className="font-semibold text-bmg-blue">
            Estamos para ayudarte
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
            Contacto
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Comunícate con nuestro equipo para
            consultas comerciales, información
            sobre productos o atención general.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <section aria-label="Formulario de contacto">
              {wasSubmitted ? (
                <div className="rounded-3xl border border-green-200 bg-green-50 px-6 py-14 text-center shadow-sm sm:px-10">
                  <span className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckCircle2
                      size={36}
                      aria-hidden="true"
                    />
                  </span>

                  <h2 className="mt-6 text-3xl font-bold text-bmg-dark">
                    Consulta enviada
                  </h2>

                  <p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-600">
                    Recibimos correctamente tu
                    mensaje. Nuestro equipo se
                    pondrá en contacto contigo.
                  </p>

                  <button
                    type="button"
                    onClick={handleNewMessage}
                    className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-dark px-6 py-3 font-bold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div>
                    <p className="font-semibold text-bmg-blue">
                      Escríbenos
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-bmg-dark">
                      Envíanos tu consulta
                    </h2>

                    <p className="mt-3 leading-7 text-neutral-600">
                      Completa el formulario y
                      nuestro equipo comercial
                      responderá tu mensaje.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-bold text-bmg-dark">
                        Nombre y apellido
                      </span>

                      <span className="relative mt-2 block">
                        <User
                          size={18}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          maxLength={150}
                          disabled={isSubmitting}
                          autoComplete="name"
                          placeholder="Tu nombre"
                          className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-bmg-dark">
                        Empresa
                      </span>

                      <span className="relative mt-2 block">
                        <Building2
                          size={18}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          maxLength={150}
                          disabled={isSubmitting}
                          autoComplete="organization"
                          placeholder="Nombre de la empresa"
                          className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-bmg-dark">
                        Correo electrónico
                      </span>

                      <span className="relative mt-2 block">
                        <Mail
                          size={18}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          maxLength={150}
                          disabled={isSubmitting}
                          autoComplete="email"
                          placeholder="correo@empresa.com"
                          className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-bmg-dark">
                        Teléfono
                      </span>

                      <span className="relative mt-2 block">
                        <Phone
                          size={18}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          maxLength={20}
                          inputMode="tel"
                          disabled={isSubmitting}
                          autoComplete="tel"
                          placeholder="+54 11 1234-5678"
                          className="min-h-13 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
                        />
                      </span>
                    </label>
                  </div>

                  <label className="mt-6 block">
                    <span className="text-sm font-bold text-bmg-dark">
                      Asunto
                    </span>

                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      maxLength={150}
                      disabled={isSubmitting}
                      placeholder="¿En qué podemos ayudarte?"
                      className="mt-2 min-h-13 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
                    />
                  </label>

                  <label className="mt-6 block">
                    <span className="text-sm font-bold text-bmg-dark">
                      Mensaje
                    </span>

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={MESSAGE_MAX_LENGTH}
                      disabled={isSubmitting}
                      rows={6}
                      placeholder="Escribe tu consulta..."
                      className="mt-2 w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-bmg-dark outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-3 focus:ring-bmg-blue/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
                    />

                    <span className="mt-1 block text-right text-xs text-neutral-500">
                      {formData.message.length} /{' '}
                      {MESSAGE_MAX_LENGTH}
                    </span>
                  </label>

                  {submitError && (
                    <p
                      role="alert"
                      className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                    >
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-bmg-blue px-6 py-3 font-bold text-bmg-dark transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 sm:w-auto"
                  >
                    <Send
                      size={18}
                      aria-hidden="true"
                    />

                    {isSubmitting
                      ? 'Enviando consulta...'
                      : 'Enviar consulta'}
                  </button>
                </form>
              )}
            </section>

            <aside aria-label="Información de contacto">
              <div className="space-y-6 lg:sticky lg:top-28">
                <article className="rounded-3xl bg-bmg-dark p-6 text-white shadow-xl sm:p-8">
                  <p className="font-semibold text-bmg-blue">
                    BMG Distribuidora
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Atención comercial
                  </h2>

                  <p className="mt-4 leading-7 text-neutral-300">
                    Nuestro equipo brinda atención
                    personalizada para consultas
                    relacionadas con productos,
                    disponibilidad y servicios.
                  </p>
                </article>

                <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                        <Phone
                          size={19}
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="font-bold text-bmg-dark">
                          Teléfono
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Próximamente agregaremos
                          el número comercial.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                        <Mail
                          size={19}
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="font-bold text-bmg-dark">
                          Correo
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Próximamente agregaremos
                          el correo comercial.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                        <MapPin
                          size={19}
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="font-bold text-bmg-dark">
                          Ubicación
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Buenos Aires, Argentina
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                        <MessageCircle
                          size={19}
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="font-bold text-bmg-dark">
                          Atención
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          Respuesta personalizada
                          para cada consulta.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}

export default Contact