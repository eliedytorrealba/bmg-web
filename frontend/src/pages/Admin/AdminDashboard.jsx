import {
  BadgeDollarSign,
  Bell,
  FileText,
  Images,
  LayoutDashboard,
  PackageSearch,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

function AdminDashboard() {
  const {
    user,
  } = useAuth()

  return (
    <main className="bg-neutral-50 px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
              <LayoutDashboard
                size={26}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-semibold text-bmg-blue">
                Panel administrativo
              </p>

              <h1 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Bienvenido,{' '}
                {user?.name ??
                  'Administrador'}
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
                Desde este panel podrás
                administrar clientes, catálogo,
                cotizaciones, listas de precios,
                notificaciones y destacados.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/clientes"
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
          >
            <Users
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
              Clientes
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Administra usuarios y sus listas
              de precios.
            </p>
          </Link>

          <Link
            to="/admin/catalogo"
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
          >
            <PackageSearch
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
              Catálogo
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Gestiona los productos y sus
              imágenes.
            </p>
          </Link>

          <Link
            to="/admin/cotizaciones"
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
          >
            <FileText
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
              Cotizaciones
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Consulta y gestiona solicitudes
              de clientes.
            </p>
          </Link>

          <Link
            to="/admin/listas-precios"
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
          >
            <BadgeDollarSign
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
              Listas de precios
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Administra la Lista General y las
              listas personalizadas.
            </p>
          </Link>

          <Link
            to="/admin/notificaciones"
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
          >
            <Bell
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
              Notificaciones
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Envía avisos y novedades a
              clientes.
            </p>
          </Link>

          <Link
            to="/admin/destacados"
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
          >
            <Images
              size={24}
              className="text-bmg-blue"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-xl font-bold text-bmg-dark transition group-hover:text-bmg-blue">
              Destacados
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Administra los flyers y
              promociones visibles en la página
              de inicio.
            </p>
          </Link>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard