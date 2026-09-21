import {
  Bell,
  CheckCircle2,
  ClipboardList,
  Heart,
  Mail,
  MapPin,
  Pencil,
  UserRound,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'
import api from '../../services/api'

const accountSections = [
  {
    title: 'Mis datos',
    description:
      'Consulta tus datos personales y comerciales registrados en BMG.',
    icon: UserRound,
    to: '/mi-cuenta/datos',
  },
  {
    title: 'Editar cuenta',
    description:
      'Actualiza la información editable de tu cuenta.',
    icon: Pencil,
    to: '/mi-cuenta/editar',
  },
  {
    title: 'Mis cotizaciones',
    description:
      'Revisa las solicitudes enviadas y sus respuestas.',
    icon: ClipboardList,
    to: '/mi-cuenta/cotizaciones',
  },
  {
    title: 'Dirección',
    description:
      'Consulta y administra tus direcciones de entrega.',
    icon: MapPin,
    to: '/mi-cuenta/direccion',
  },
  {
    title: 'Favoritos',
    description:
      'Accede rápidamente a los productos que guardaste como favoritos.',
    icon: Heart,
    to: '/mi-cuenta/favoritos',
  },
  {
    title: 'Notificaciones',
    description:
      'Consulta novedades, avisos y beneficios enviados por BMG.',
    icon: Bell,
    to: '/mi-cuenta/notificaciones',
  },
]

function ClientAccount() {
  const {
    user,
    fetchUser,
  } = useAuth()

  const [isResending, setIsResending] =
    useState(false)

  const [verificationMessage, setVerificationMessage] =
    useState('')

  const [verificationError, setVerificationError] =
    useState('')

  useEffect(() => {
    async function refreshUser() {
      try {
        await fetchUser()
      } catch (error) {
        console.error(
          'No se pudo actualizar el usuario:',
          error,
        )
      }
    }

    refreshUser()
  }, [fetchUser])

  async function handleResendVerification() {
    if (isResending) {
      return
    }

    setIsResending(true)
    setVerificationMessage('')
    setVerificationError('')

    try {
      const response = await api.post(
        '/api/email/verification-notification',
      )

      setVerificationMessage(
        response.data?.message ??
          'Te enviamos un nuevo correo de verificación.',
      )
    } catch (error) {
      const message =
        error.response?.data?.message ??
        'No pudimos enviar el correo de verificación. Intenta nuevamente.'

      setVerificationError(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <p className="font-semibold text-bmg-blue">
            Área de clientes
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
            Mi cuenta
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Gestiona tus datos, cotizaciones,
            direcciones, favoritos y notificaciones
            desde un solo lugar.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                <UserRound
                  size={30}
                  aria-hidden="true"
                />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-500">
                  Cliente
                </p>

                <h2 className="mt-1 break-words text-2xl font-bold text-bmg-dark">
                  {user?.name ?? 'Cliente BMG'}
                </h2>

                <p className="mt-1 break-all text-sm text-neutral-600">
                  {user?.email ??
                    'Sin correo registrado'}
                </p>
              </div>
            </div>
          </section>

          {user?.email_verified ? (
            <section className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2
                    size={24}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <h2 className="text-lg font-bold text-green-900">
                    Correo electrónico verificado
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    Tu dirección de correo electrónico
                    está correctamente verificada.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Mail
                      size={23}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <h2 className="text-lg font-bold text-amber-950">
                      Verifica tu correo electrónico
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
                      Te enviamos un enlace de
                      verificación a{' '}
                      <span className="font-semibold">
                        {user?.email}
                      </span>
                      . Abre el correo y confirma tu
                      dirección.
                    </p>

                    {verificationMessage && (
                      <p className="mt-3 text-sm font-semibold text-green-700">
                        {verificationMessage}
                      </p>
                    )}

                    {verificationError && (
                      <p className="mt-3 text-sm font-semibold text-red-700">
                        {verificationError}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-bmg-blue px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending
                    ? 'Enviando...'
                    : 'Reenviar correo'}
                </button>
              </div>
            </section>
          )}

          <section className="mt-10">
            <div>
              <p className="font-semibold text-bmg-blue">
                Gestión de cuenta
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
                Accesos principales
              </h2>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {accountSections.map((section) => {
                const Icon = section.icon

                return (
                  <Link
                    key={section.title}
                    to={section.to}
                    className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
                  >
                    <span className="flex h-13 w-13 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue transition group-hover:bg-bmg-blue group-hover:text-bmg-dark">
                      <Icon
                        size={24}
                        aria-hidden="true"
                      />
                    </span>

                    <h3 className="mt-5 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
                      {section.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {section.description}
                    </p>

                    <p className="mt-6 text-sm font-bold text-bmg-blue">
                      Ver sección
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default ClientAccount