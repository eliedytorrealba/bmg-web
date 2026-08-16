import {
  ArrowLeft,
  Building2,
  CreditCard,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

function ClientData() {
  const { user } = useAuth()

  const contactData = [
    {
      label: 'Nombre / Razón social',
      value: user?.name ?? 'No informado',
      icon: UserRound,
    },
    {
      label: 'Correo electrónico',
      value: user?.email ?? 'No informado',
      icon: Mail,
    },
    {
      label: 'Teléfono',
      value: user?.phone ?? 'No informado',
      icon: Phone,
    },
    {
      label: 'Empresa',
      value: user?.company ?? 'No informado',
      icon: Building2,
    },
  ]

  const commercialData = [
    {
      label: 'Tipo de documento',
      value:
        user?.document_type ??
        'No informado',
      icon: CreditCard,
    },
    {
      label: 'Número de documento',
      value:
        user?.document_number ??
        'No informado',
      icon: CreditCard,
    },
  ]

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
            Mis datos
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Consulta la información personal y
            comercial asociada a tu cuenta.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
          <section>
            <div>
              <p className="font-semibold text-bmg-blue">
                Información personal
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
                Datos de contacto
              </h2>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              {contactData.map(
                (item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className={`flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${
                        index !==
                        contactData.length - 1
                          ? 'border-b border-neutral-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                          <Icon
                            size={20}
                            aria-hidden="true"
                          />
                        </span>

                        <p className="font-semibold text-bmg-dark">
                          {item.label}
                        </p>
                      </div>

                      <p className="break-words text-neutral-600 sm:max-w-[55%] sm:text-right">
                        {item.value}
                      </p>
                    </div>
                  )
                },
              )}
            </div>
          </section>

          <section className="mt-12">
            <div>
              <p className="font-semibold text-bmg-blue">
                Información comercial
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
                Datos comerciales
              </h2>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              {commercialData.map(
                (item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className={`flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${
                        index !==
                        commercialData.length - 1
                          ? 'border-b border-neutral-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                          <Icon
                            size={20}
                            aria-hidden="true"
                          />
                        </span>

                        <p className="font-semibold text-bmg-dark">
                          {item.label}
                        </p>
                      </div>

                      <p className="break-words text-neutral-600 sm:max-w-[55%] sm:text-right">
                        {item.value}
                      </p>
                    </div>
                  )
                },
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default ClientData