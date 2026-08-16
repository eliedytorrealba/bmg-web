import {
  Bell,
  ClipboardList,
  Heart,
  MapPin,
  Pencil,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

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
  const { user } = useAuth()

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

                if (section.to) {
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
                }

                return (
                  <article
                    key={section.title}
                    className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <span className="flex h-13 w-13 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                      <Icon
                        size={24}
                        aria-hidden="true"
                      />
                    </span>

                    <h3 className="mt-5 text-xl font-bold text-bmg-dark">
                      {section.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {section.description}
                    </p>

                    <p className="mt-6 text-sm font-bold text-neutral-400">
                      Próximamente
                    </p>
                  </article>
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