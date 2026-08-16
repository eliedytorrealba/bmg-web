import {
  BadgeCheck,
  Boxes,
  Building2,
  CarFront,
  Handshake,
  HeartHandshake,
  MapPin,
  MessageCircleMore,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import depositoBmg from '../../assets/about/deposito-bmg.jpeg'
import depositoProductosBmg from '../../assets/about/deposito-productos-bmg.jpeg'
import distribucionBmg from '../../assets/about/distribucion-bmg.jpeg'
import filtrosBmg from '../../assets/about/filtros-bmg.jpeg'
import refrigerantesBmg from '../../assets/about/productos-varios-bmg.jpeg'

const values = [
  {
    title: 'Confianza',
    description:
      'Construimos relaciones duraderas con clientes y proveedores.',
    icon: Handshake,
  },
  {
    title: 'Cercanía',
    description:
      'Creemos en una atención directa, ágil y personalizada.',
    icon: HeartHandshake,
  },
  {
    title: 'Compromiso',
    description:
      'Acompañamos a nuestros clientes y sus negocios en cada etapa.',
    icon: BadgeCheck,
  },
  {
    title: 'Respeto',
    description:
      'Promovemos vínculos comerciales basados en el respeto mutuo.',
    icon: UsersRound,
  },
  {
    title: 'Responsabilidad',
    description:
      'Trabajamos para brindar un servicio confiable en cada operación.',
    icon: ShieldCheck,
  },
]

const differentials = [
  {
    title: 'Atención personalizada',
    description:
      'Brindamos un trato cercano y adaptado a las necesidades de cada cliente.',
    icon: MessageCircleMore,
  },
  {
    title: 'Comunicación directa',
    description:
      'Priorizamos una relación comercial simple, clara y sin intermediaciones innecesarias.',
    icon: Handshake,
  },
  {
    title: 'Cobertura nacional',
    description:
      'Distribuimos desde Buenos Aires hacia clientes de todo el país.',
    icon: Truck,
  },
  {
    title: 'Variedad de soluciones',
    description:
      'Trabajamos con distintas líneas de productos para el sector automotor.',
    icon: Boxes,
  },
]

const businessSegments = [
  {
    title: 'Lubricentros',
    icon: Store,
  },
  {
    title: 'Casas de repuestos',
    icon: PackageCheck,
  },
  {
    title: 'Empresas',
    icon: Building2,
  },
  {
    title: 'Flotas',
    icon: CarFront,
  },
]

const productCategories = [
  {
    name: 'Lubricantes',
    to: '/productos?categoryGroup=lubricants',
  },
  {
    name: 'Filtros',
    to: '/productos?categoryGroup=filters',
  },
  {
    name: 'Aditivos',
    to: '/productos?categoryGroup=additives',
  },
  {
    name: 'Cosmética automotor',
    to: '/productos?categoryGroup=cosmetics',
  },
  {
    name: 'Accesorios',
    to: '/productos?categoryGroup=accessories',
  },
]

function About() {
  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-semibold text-bmg-blue">
                Sobre BMG
              </p>

              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl lg:text-6xl">
                Una forma más cercana de acompañar
                al sector automotor.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
                BMG Distribuidora nació en 2023 con
                una idea clara: ofrecer una atención
                más personalizada, directa y cercana
                a cada cliente.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-bmg-blue/20 bg-white px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-500">
                    Desde
                  </p>

                  <p className="mt-1 text-2xl font-bold text-bmg-dark">
                    2023
                  </p>
                </div>

                <div className="rounded-2xl border border-bmg-blue/20 bg-white px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-500">
                    Cobertura
                  </p>

                  <p className="mt-1 text-2xl font-bold text-bmg-dark">
                    Argentina
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <img
                src={depositoBmg}
                alt="Depósito de BMG Distribuidora"
                className="h-[460px] w-full object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-6 pb-6 pt-20 text-white sm:px-8 sm:pb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-bmg-blue">
                  Operación real
                </p>

                <p className="mt-2 text-xl font-bold">
                  Stock, variedad y distribución
                  para acompañar a nuestros clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-semibold text-bmg-blue">
                Nuestra historia
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Crecer a través de la confianza.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-neutral-600">
              <p>
                BMG Distribuidora comenzó en 2023 a
                partir de una necesidad concreta que
                transmitían muchos clientes: contar
                con una atención más personalizada y
                directa que la que encontraban en
                otras empresas del sector.
              </p>

              <p>
                Desde sus primeros pasos, la empresa
                fue creciendo gracias a la confianza
                y el apoyo de clientes y proveedores,
                logrando construir relaciones basadas
                en el respeto, el compromiso y la
                confianza mutua.
              </p>

              <p>
                Con sede en Buenos Aires y
                distribución en todo el territorio
                argentino, BMG acompaña a
                lubricentros, casas de repuestos,
                empresas y flotas con soluciones para
                el mercado automotor.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-bmg-light">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
            <div className="text-center">
              <p className="font-semibold text-bmg-blue">
                Nuestra identidad
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Misión y Visión
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-bmg-blue">
                  Misión
                </p>

                <h3 className="mt-3 text-2xl font-bold text-bmg-dark">
                  Acompañar con soluciones y cercanía.
                </h3>

                <p className="mt-4 leading-7 text-neutral-600">
                  Brindar soluciones para el sector
                  automotor a través de una atención
                  cercana, directa y personalizada,
                  ofreciendo productos de calidad y
                  construyendo relaciones comerciales
                  basadas en la confianza y el
                  compromiso.
                </p>
              </article>

              <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-bmg-blue">
                  Visión
                </p>

                <h3 className="mt-3 text-2xl font-bold text-bmg-dark">
                  Ser una distribuidora referente.
                </h3>

                <p className="mt-4 leading-7 text-neutral-600">
                  Consolidarnos como una distribuidora
                  referente en Argentina, reconocida
                  por la calidad y variedad de sus
                  productos y por una forma de
                  relacionarnos con los clientes más
                  cercana, ágil y personalizada.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <p className="font-semibold text-bmg-blue">
              Lo que nos diferencia
            </p>

            <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
              Una relación comercial más directa.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-neutral-600">
              La atención personalizada no es un
              complemento de nuestro servicio: es
              una de las razones por las que nació
              BMG.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {differentials.map((item) => {
              const Icon = item.icon

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-13 w-13 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                    <Icon
                      size={24}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="mt-5 text-xl font-bold text-bmg-dark">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {item.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="bg-bmg-dark text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="font-semibold text-bmg-blue">
                  Qué comercializamos
                </p>

                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Soluciones para el sector
                  automotor.
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-neutral-300">
                  Trabajamos con diferentes líneas
                  de productos para acompañar las
                  necesidades de nuestros clientes.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {productCategories.map(
                    (category) => (
                      <Link
                        key={category.name}
                        to={category.to}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white transition hover:border-bmg-blue hover:bg-white/10 hover:text-bmg-blue"
                      >
                        {category.name}
                      </Link>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <img
                  src={depositoProductosBmg}
                  alt="Productos almacenados en BMG Distribuidora"
                  loading="lazy"
                  className="h-80 w-full rounded-3xl object-cover"
                />

                <img
                  src={refrigerantesBmg}
                  alt="Refrigerantes disponibles en BMG Distribuidora"
                  loading="lazy"
                  className="mt-10 h-80 w-full rounded-3xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="font-semibold text-bmg-blue">
                Nuestros clientes
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Acompañamos diferentes negocios y
                organizaciones.
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-neutral-600">
                Nuestro servicio está orientado a
                clientes que necesitan un proveedor
                confiable y una atención comercial
                cercana.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {businessSegments.map(
                  (segment) => {
                    const Icon =
                      segment.icon

                    return (
                      <article
                        key={segment.title}
                        className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bmg-green/30 text-bmg-dark">
                          <Icon
                            size={22}
                            aria-hidden="true"
                          />
                        </span>

                        <h3 className="font-bold text-bmg-dark">
                          {segment.title}
                        </h3>
                      </article>
                    )
                  },
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-neutral-100 shadow-sm">
              <img
                src={filtrosBmg}
                alt="Sector de filtros del depósito de BMG Distribuidora"
                loading="lazy"
                className="h-[520px] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-bmg-light">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <img
                src={distribucionBmg}
                alt="Vehículo utilizado para distribución de productos"
                loading="lazy"
                className="h-[500px] w-full object-cover"
              />
            </div>

            <div>
              <p className="font-semibold text-bmg-blue">
                Cobertura nacional
              </p>

              <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
                Desde Buenos Aires hacia todo el
                país.
              </h2>

              <p className="mt-5 text-lg leading-8 text-neutral-600">
                Nuestra sede se encuentra en Buenos
                Aires y distribuimos productos a
                clientes de todo el territorio
                argentino.
              </p>

              <p className="mt-4 leading-7 text-neutral-600">
                Trabajamos para mantener una
                comunicación directa durante todo el
                proceso comercial y acompañar a cada
                cliente según sus necesidades.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                  <MapPin
                    size={22}
                    aria-hidden="true"
                    className="shrink-0 text-bmg-blue"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Sede
                    </p>

                    <p className="mt-1 font-bold text-bmg-dark">
                      Buenos Aires
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                  <Truck
                    size={22}
                    aria-hidden="true"
                    className="shrink-0 text-bmg-blue"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Distribución
                    </p>

                    <p className="mt-1 font-bold text-bmg-dark">
                      Todo el país
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <p className="font-semibold text-bmg-blue">
              Nuestros valores
            </p>

            <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
              La forma en la que elegimos trabajar.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((value) => {
              const Icon = value.icon

              return (
                <article
                  key={value.title}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bmg-blue/10 text-bmg-blue">
                    <Icon
                      size={22}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="mt-5 text-lg font-bold text-bmg-dark">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {value.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="bg-bmg-dark text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-semibold text-bmg-blue">
                  Marcas
                </p>

                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Trabajamos con marcas reconocidas
                  del sector.
                </h2>

                <p className="mt-5 max-w-2xl leading-7 text-neutral-300">
                  Nuestro catálogo reúne diferentes
                  fabricantes y líneas de productos
                  para responder a las necesidades de
                  cada cliente.
                </p>
              </div>

              <Link
                to="/marcas"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3.5 font-semibold text-white transition hover:border-bmg-blue hover:text-bmg-blue"
              >
                Ver todas las marcas
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 lg:px-8 lg:py-20">
  <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-bmg-blue">
    <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14 lg:py-12">
      <div>
        <p className="font-semibold text-bmg-dark">
          Hablemos
        </p>

        <h2 className="mt-2 text-3xl font-bold text-bmg-dark sm:text-4xl">
          Sumate a nuestra cartera de clientes
        </h2>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-bmg-dark/80">
          Si tenés un lubricentro, una casa de
          repuestos, una empresa o administrás una
          flota, contactanos para conocer cómo podemos
          acompañar a tu negocio.
        </p>

        <p className="mt-3 max-w-2xl leading-7 text-bmg-dark/80">
          Nuestro equipo está disponible de 9:00 a
          18:00 para brindarte una atención
          personalizada y responder tus consultas.
        </p>

        <div className="mt-6 space-y-2 text-sm font-semibold text-bmg-dark">
          <p>
            WhatsApp / Teléfono:{' '}
            +54 9 11 3341-5962
          </p>

          <p>
            Email:{' '}
            Lubricantesbmg@gmail.com
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
        <a
          href="https://wa.me/5491133415962"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 min-w-52 items-center justify-center rounded-full bg-bmg-dark px-7 py-3.5 font-semibold text-white transition hover:bg-neutral-700"
        >
          Escribir por WhatsApp
        </a>

        <Link
          to="/contacto"
          className="inline-flex min-h-12 min-w-52 items-center justify-center rounded-full border-2 border-bmg-dark px-7 py-3.5 font-semibold text-bmg-dark transition hover:bg-bmg-dark hover:text-white"
        >
          Contactar a BMG
        </Link>
      </div>
    </div>
  </div>
</section>
      </main>
    </>
  )
}

export default About