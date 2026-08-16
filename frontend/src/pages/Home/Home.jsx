import {
  CarFront,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Filter,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'

import castrolLogo from '../../assets/brands/castrol.svg'
import motulLogo from '../../assets/brands/motul.svg'
import petronasLogo from '../../assets/brands/petronas.svg'
import shellLogo from '../../assets/brands/shell.svg'
import totalEnergiesLogo from '../../assets/brands/totalenergies.svg'
import walkerLogo from '../../assets/brands/walker.png'

import homeHero from '../../assets/home/home-hero.jpeg'
import homeDeposito from '../../assets/home/home-deposito.jpeg'
import destacado01 from '../../assets/home/destacado-01.jpeg'

const categories = [
  {
    name: 'Lubricantes',
    slug: 'lubricants',
    icon: Droplets,
  },
  {
    name: 'Filtros',
    slug: 'filters',
    icon: Filter,
  },
  {
    name: 'Aditivos',
    slug: 'additives',
    icon: ShieldCheck,
  },
  {
    name: 'Cosmética',
    slug: 'cosmetics',
    icon: Sparkles,
  },
  {
    name: 'Accesorios',
    slug: 'accessories',
    icon: CarFront,
  },
]

const brands = [
  {
    name: 'Shell',
    logo: shellLogo,
    imageClassName:
      'max-h-24 max-w-[150px]',
  },
  {
    name: 'Motul',
    logo: motulLogo,
    imageClassName:
      'max-h-28 max-w-[240px]',
  },
  {
    name: 'TotalEnergies',
    logo: totalEnergiesLogo,
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    name: 'Castrol',
    logo: castrolLogo,
    imageClassName:
      'max-h-20 max-w-[170px]',
  },
  {
    name: 'Petronas',
    logo: petronasLogo,
    imageClassName:
      'max-h-24 max-w-[190px]',
  },
  {
    name: 'Walker',
    logo: walkerLogo,
    imageClassName:
      'max-h-28 max-w-[180px]',
  },
]

const benefits = [
  {
    title: 'Amplio catálogo',
    description:
      'Lubricantes, filtros, aditivos, cosmética y productos para el sector automotor.',
    icon: PackageCheck,
  },
  {
    title: 'Entregas confiables',
    description:
      'Coordinamos cada solicitud de forma clara y eficiente para nuestros clientes.',
    icon: Truck,
  },
  {
    title: 'Atención personalizada',
    description:
      'Acompañamos a talleres, comercios y distribuidores durante todo el proceso comercial.',
    icon: Headphones,
  },
]

const highlights = [
  {
    id: 1,
    image: destacado01,
    alt: 'Novedad destacada de BMG',
  },
  {
    id: 2,
    image: null,
    alt: 'Próximo destacado de BMG',
  },
  {
    id: 3,
    image: null,
    alt: 'Próximo destacado de BMG',
  },
]

function getCategoryPath(categorySlug) {
  return `/productos?categoryGroup=${encodeURIComponent(
    categorySlug,
  )}`
}

function getBrandPath(brandName) {
  return `/productos?brand=${encodeURIComponent(
    brandName,
  )}`
}

function Home() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth()

  const [
    activeHighlight,
    setActiveHighlight,
  ] = useState(0)

  function showPreviousHighlight() {
    setActiveHighlight((current) =>
      current === 0
        ? highlights.length - 1
        : current - 1,
    )
  }

  function showNextHighlight() {
    setActiveHighlight((current) =>
      current === highlights.length - 1
        ? 0
        : current + 1,
    )
  }

  return (
    <>

             {/* HERO */}
      <section className="bg-bmg-light">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-bmg-blue/15 px-4 py-2 text-sm font-semibold text-bmg-dark">
              Distribución para el sector automotor
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl lg:text-6xl">
              Todo para tu vehículo, en un solo lugar.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              Lubricantes, filtros, aditivos,
              cosmética y accesorios de marcas
              reconocidas del sector.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/productos"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-dark px-7 py-3.5 font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
              >
                Ver catálogo
              </Link>

              <Link
                to="/marcas"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-green px-7 py-3.5 font-semibold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-green focus-visible:ring-offset-2"
              >
                Conocer marcas
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-bmg-dark shadow-xl">
            <img
              src={homeHero}
              alt="Depósito y productos de BMG Distribuidora"
              className="h-[380px] w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* DESTACADOS BMG */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <p className="font-semibold text-bmg-blue">
              Novedades y promociones
            </p>

            <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
              Destacados BMG
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
              Conocé nuestras novedades,
              promociones y recomendaciones
              destacadas.
            </p>
          </div>

          <div className="relative mx-auto mt-10 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-black shadow-lg">
              <div className="flex aspect-[16/7] items-center justify-center">
                {highlights[
                  activeHighlight
                ].image ? (
                  <img
                    src={
                      highlights[
                        activeHighlight
                      ].image
                    }
                    alt={
                      highlights[
                        activeHighlight
                      ].alt
                    }
                    className="h-full w-full object-contain object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white">
                    <p className="text-lg font-semibold text-neutral-300">
                      Próximamente
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={showPreviousHighlight}
              aria-label="Ver destacado anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-bmg-dark/90 text-white shadow-lg transition hover:bg-bmg-blue hover:text-bmg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 sm:left-5"
            >
              <ChevronLeft
                size={24}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={showNextHighlight}
              aria-label="Ver siguiente destacado"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-bmg-dark/90 text-white shadow-lg transition hover:bg-bmg-blue hover:text-bmg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 sm:right-5"
            >
              <ChevronRight
                size={24}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {highlights.map(
              (highlight, index) => (
                <button
                  key={highlight.id}
                  type="button"
                  onClick={() =>
                    setActiveHighlight(
                      index,
                    )
                  }
                  aria-label={`Ver destacado ${
                    index + 1
                  }`}
                  aria-current={
                    activeHighlight ===
                    index
                      ? 'true'
                      : undefined
                  }
                  className={`h-2.5 rounded-full transition-all ${
                    activeHighlight ===
                    index
                      ? 'w-8 bg-bmg-blue'
                      : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                />
              ),
            )}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="text-center">
          <p className="font-semibold text-bmg-blue">
            Nuestro catálogo
          </p>

          <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
            Categorías principales
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Encuentra rápidamente los productos
            que necesitas para tu negocio.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon

            return (
              <Link
                key={category.name}
                to={getCategoryPath(
                  category.slug,
                )}
                aria-label={`Ver productos de la categoría ${category.name}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bmg-blue/15 text-bmg-dark transition group-hover:bg-bmg-blue">
                  <Icon
                    size={30}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="mt-5 font-semibold text-bmg-dark">
                  {category.name}
                </h3>

                <span className="mt-3 inline-block text-sm font-semibold text-neutral-500 transition group-hover:text-bmg-blue">
                  Ver productos
                </span>
              </Link>
            )
          })}
        </div>
      </section>

            {/* MARCAS */}
      <section className="bg-bmg-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="text-center">
            <p className="font-semibold text-bmg-blue">
              Calidad y confianza
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Marcas que distribuimos
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
              Trabajamos con marcas reconocidas
              del sector automotor para ofrecer
              productos confiables a nuestros
              clientes.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                to={getBrandPath(
                  brand.name,
                )}
                aria-label={`Ver productos de ${brand.name}`}
                className="group flex min-h-44 items-center justify-center rounded-3xl border border-white/10 bg-white px-8 py-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-bmg-blue hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4 focus-visible:ring-offset-bmg-dark"
              >
                <img
                  src={brand.logo}
                  alt={`Logo de ${brand.name}`}
                  className={`${brand.imageClassName} h-auto w-auto object-contain transition duration-300 group-hover:scale-105`}
                  loading="lazy"
                />
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/marcas"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3.5 font-semibold text-white transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bmg-dark"
            >
              Ver todas las marcas
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE BMG */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-bmg-light shadow-sm">
            <img
              src={homeDeposito}
              alt="Depósito de BMG Distribuidora"
              loading="lazy"
              className="h-[520px] w-full object-cover object-center"
            />
          </div>

          <div>
            <p className="font-semibold text-bmg-blue">
              Sobre BMG
            </p>

            <h2 className="mt-2 text-3xl font-bold leading-tight text-bmg-dark sm:text-4xl">
              Un socio confiable para tu negocio.
            </h2>

            <p className="mt-6 text-lg leading-8 text-neutral-600">
              En BMG acompañamos a nuestros
              clientes con una propuesta simple:
              productos de calidad, atención
              cercana y un proceso comercial ágil.
            </p>

            <p className="mt-4 leading-7 text-neutral-600">
              Trabajamos para que talleres,
              lubricentros, comercios y
              distribuidores puedan encontrar todo
              lo que necesitan en un solo lugar.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon

                return (
                  <article
                    key={benefit.title}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bmg-green/30 text-bmg-dark">
                      <Icon
                        size={24}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-4 font-bold text-bmg-dark">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {benefit.description}
                    </p>
                  </article>
                )
              })}
            </div>

            <Link
              to="/nosotros"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-dark px-7 py-3.5 font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
            >
              Conocer más sobre BMG
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESO CLIENTES */}
      <section className="px-4 pb-14 pt-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-bmg-blue">
          <div className="grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-14 lg:py-12">
            <div>
              <p className="font-semibold text-bmg-dark">
                Acceso para clientes
              </p>

              <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-bmg-dark sm:text-4xl">
                Consulta precios y solicita
                cotizaciones desde tu cuenta.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-bmg-dark/80">
                Inicia sesión para consultar
                precios, agregar productos y
                enviar solicitudes de cotización
                a BMG.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              {!isAuthLoading &&
                !isAuthenticated && (
                  <Link
                    to="/login"
                    className="inline-flex min-h-12 min-w-52 items-center justify-center rounded-full bg-bmg-dark px-7 py-3.5 font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bmg-blue"
                  >
                    Iniciar sesión
                  </Link>
                )}

              <Link
                to="/contacto"
                className="inline-flex min-h-12 min-w-52 items-center justify-center rounded-full border-2 border-bmg-dark px-7 py-3.5 font-semibold text-bmg-dark transition hover:bg-bmg-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bmg-blue"
              >
                Contactar a BMG
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
