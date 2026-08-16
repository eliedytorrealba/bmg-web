import {
  Search,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import bardahlLogo from '../../assets/brands/bardahl.svg'
import castrolLogo from '../../assets/brands/castrol.svg'
import colorinLogo from '../../assets/brands/colorin.png'
import framLogo from '../../assets/brands/fram.svg'
import fullCarLogo from '../../assets/brands/full-car.jpg'
import gulfLogo from '../../assets/brands/gulf.svg'
import ikeLogo from '../../assets/brands/ike.png'
import koboLogo from '../../assets/brands/kobo.png'
import liquiMolyLogo from '../../assets/brands/liqui-moly.svg'
import mahleLogo from '../../assets/brands/mahle.svg'
import marenoLogo from '../../assets/brands/mareno.png'
import molykoteLogo from '../../assets/brands/molykote.png'
import motulLogo from '../../assets/brands/motul.svg'
import petronasLogo from '../../assets/brands/petronas.svg'
import qklLogo from '../../assets/brands/qkl.png'
import saphirusLogo from '../../assets/brands/saphirus.png'
import shellLogo from '../../assets/brands/shell.svg'
import sundeyLogo from '../../assets/brands/sundey.jpg'
import totalEnergiesLogo from '../../assets/brands/totalenergies.svg'
import valvolineLogo from '../../assets/brands/valvoline.png'
import wagnerLogo from '../../assets/brands/wagner.png'
import walkerLogo from '../../assets/brands/walker.png'
import wegaLogo from '../../assets/brands/wega.png'
import westLogo from '../../assets/brands/west.png'
import ypfLogo from '../../assets/brands/ypf.png'

const brands = [
  {
    id: 1,
    name: 'Shell',
    logo: shellLogo,
    description:
      'Lubricantes y fluidos para vehículos y aplicaciones profesionales.',
    imageClassName:
      'max-h-28 max-w-[170px]',
  },
  {
    id: 2,
    name: 'Motul',
    logo: motulLogo,
    description:
      'Lubricantes de alto rendimiento para automóviles y motocicletas.',
    imageClassName:
      'max-h-28 max-w-[240px]',
  },
  {
    id: 3,
    name: 'Total',
    displayName: 'TotalEnergies',
    logo: totalEnergiesLogo,
    description:
      'Aceites y soluciones para motores, transmisiones y aplicaciones industriales.',
    imageClassName:
      'max-h-28 max-w-[210px]',
  },
  {
    id: 4,
    name: 'Castrol',
    logo: castrolLogo,
    description:
      'Lubricantes para motores, transmisiones y aplicaciones pesadas.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 5,
    name: 'Petronas',
    logo: petronasLogo,
    description:
      'Lubricantes desarrollados para brindar protección y rendimiento.',
    imageClassName:
      'max-h-28 max-w-[190px]',
  },
  {
    id: 6,
    name: 'Walker',
    logo: walkerLogo,
    description:
      'Productos para cosmética, limpieza y cuidado automotor.',
    imageClassName:
      'max-h-32 max-w-[210px]',
  },
  {
    id: 7,
    name: 'Bardahl',
    logo: bardahlLogo,
    description:
      'Aditivos, lubricantes y soluciones para el mantenimiento del motor.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 8,
    name: 'Gulf',
    logo: gulfLogo,
    description:
      'Lubricantes para automóviles, motos, transporte e industria.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 9,
    name: 'Fram',
    logo: framLogo,
    description:
      'Filtros de aceite, aire y combustible para múltiples vehículos.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 10,
    name: 'Liqui Moly',
    logo: liquiMolyLogo,
    description:
      'Aceites, aditivos y productos especializados para el mantenimiento automotor.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 11,
    name: 'Mahle',
    logo: mahleLogo,
    description:
      'Filtros y componentes para motores y sistemas automotores.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 12,
    name: 'Wega',
    logo: wegaLogo,
    description:
      'Filtros para automóviles, utilitarios, camiones y maquinaria.',
    imageClassName:
      'max-h-28 max-w-[210px]',
  },
  {
    id: 13,
    name: 'Colorin',
    logo: colorinLogo,
    description:
      'Productos y soluciones para mantenimiento y aplicaciones automotrices.',
    imageClassName:
      'max-h-24 max-w-[210px]',
  },
  {
    id: 14,
    name: 'IKE',
    logo: ikeLogo,
    description:
      'Fluidos y productos destinados al mantenimiento de sistemas automotores.',
    imageClassName:
      'max-h-28 max-w-[180px]',
  },
  {
    id: 15,
    name: 'Kobo',
    logo: koboLogo,
    description:
      'Productos y accesorios para distintas aplicaciones del sector automotor.',
    imageClassName:
      'max-h-24 max-w-[200px] scale-[1.6]',
  },
  {
    id: 16,
    name: 'Mareno',
    logo: marenoLogo,
    description:
      'Filtros para aire, aceite y diferentes aplicaciones automotrices.',
    imageClassName:
      'max-h-24 max-w-[210px] scale-[1.7]',
  },
  {
    id: 17,
    name: 'Molykote',
    logo: molykoteLogo,
    description:
      'Lubricantes especiales y soluciones para protección y mantenimiento.',
    imageClassName:
      'max-h-24 max-w-[220px]',
  },
  {
    id: 18,
    name: 'QKL',
    logo: qklLogo,
    description:
      'Accesorios y productos destinados al equipamiento y mantenimiento vehicular.',
    imageClassName:
      'max-h-24 max-w-[210px] scale-[1.6]',
  },
  {
    id: 19,
    name: 'Sundey',
    logo: sundeyLogo,
    description:
      'Productos para reparación, mantenimiento y cuidado del automóvil.',
    imageClassName:
      'max-h-28 max-w-[190px]',
  },
  {
    id: 20,
    name: 'Full Car',
    logo: fullCarLogo,
    description:
      'Productos orientados al mantenimiento y cuidado del vehículo.',
    imageClassName:
      'max-h-24 max-w-[210px] scale-[1.6]',
  },
  {
    id: 21,
    name: 'Valvoline',
    logo: valvolineLogo,
    description:
      'Lubricantes, fluidos y productos para protección y rendimiento del motor.',
    imageClassName:
      'max-h-28 max-w-[190px]',
  },
  {
    id: 22,
    name: 'Wagner',
    logo: wagnerLogo,
    description:
      'Fluidos para sistemas de frenos y aplicaciones automotrices.',
    imageClassName:
      'max-h-24 max-w-[200px]',
  },
  {
    id: 23,
    name: 'West',
    logo: westLogo,
    description:
      'Lubricantes y productos para distintas aplicaciones automotrices.',
    imageClassName:
      'max-h-24 max-w-[200px]',
  },
  {
    id: 24,
    name: 'YPF',
    logo: ypfLogo,
    description:
      'Lubricantes y fluidos para automóviles, transporte y aplicaciones profesionales.',
    imageClassName:
      'max-h-24 max-w-[190px]',
  },
  {
    id: 25,
    name: 'Saphirus',
    logo: saphirusLogo,
    description:
      'Productos aromáticos y soluciones complementarias para vehículos.',
    imageClassName:
      'max-h-24 max-w-[200px]',
  },
]

function getBrandProductsPath(brandName) {
  return `/productos?brand=${encodeURIComponent(
    brandName,
  )}`
}

function Brands() {
  const [searchTerm, setSearchTerm] =
    useState('')

  const filteredBrands = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLocaleLowerCase('es')

    if (!normalizedSearch) {
      return brands
    }

    return brands.filter((brand) => {
      const searchableText = [
        brand.name,
        brand.displayName,
        brand.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es')

      return searchableText.includes(
        normalizedSearch,
      )
    })
  }, [searchTerm])

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
  }

  function clearSearch() {
    setSearchTerm('')
  }

  return (
    <>
      <section className="border-b border-neutral-200 bg-bmg-light">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
          <div className="text-center">
            <p className="font-semibold text-bmg-blue">
              Calidad y confianza
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl">
              Todas nuestras marcas
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-600">
              Trabajamos con fabricantes
              reconocidos del sector automotor
              para ofrecer productos confiables
              y adaptados a las necesidades de
              nuestros clientes.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <label
              htmlFor="brand-search"
              className="sr-only"
            >
              Buscar una marca
            </label>

            <div className="relative">
              <Search
                size={21}
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                id="brand-search"
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                maxLength={100}
                autoComplete="off"
                placeholder="Buscar una marca..."
                className="min-h-14 w-full rounded-full border border-neutral-300 bg-white py-3 pl-14 pr-6 text-bmg-dark shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-bmg-blue focus:ring-4 focus:ring-bmg-blue/15"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="bg-bmg-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-semibold text-bmg-blue">
                Marcas disponibles
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Fabricantes destacados
              </h2>
            </div>

            <p
              className="text-sm text-neutral-400"
              aria-live="polite"
            >
              {filteredBrands.length}{' '}
              {filteredBrands.length === 1
                ? 'marca encontrada'
                : 'marcas encontradas'}
            </p>
          </div>

          {filteredBrands.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBrands.map((brand) => (
                <article
                  key={brand.id}
                  className="group min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-bmg-blue hover:shadow-2xl"
                >
                  <Link
                    to={getBrandProductsPath(
                      brand.name,
                    )}
                    aria-label={`Ver productos de ${
                      brand.displayName ??
                      brand.name
                    }`}
                    className="flex min-h-48 items-center justify-center px-8 py-8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-bmg-blue"
                  >
                    <img
                      src={brand.logo}
                      alt={`Logo de ${
                        brand.displayName ??
                        brand.name
                      }`}
                      loading="lazy"
                      className={`${brand.imageClassName} h-auto w-auto object-contain transition duration-300 group-hover:scale-105`}
                    />
                  </Link>

                  <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-5">
                    <h3 className="break-words text-lg font-bold text-bmg-dark">
                      {brand.displayName ??
                        brand.name}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-neutral-600">
                      {brand.description}
                    </p>

                    <Link
                      to={getBrandProductsPath(
                        brand.name,
                      )}
                      className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-bmg-dark transition hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                    >
                      Ver productos

                      <span
                        aria-hidden="true"
                        className="ml-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-white">
                No encontramos esa marca
              </h3>

              <p className="mt-3 text-neutral-400">
                Prueba escribiendo otro nombre
                o elimina el texto del buscador.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bmg-dark"
              >
                Mostrar todas
              </button>
            </div>
          )}

          <section className="mt-12 rounded-3xl border border-bmg-blue/30 bg-bmg-blue/10 px-6 py-8 text-center sm:px-10">
            <h2 className="text-2xl font-bold text-white">
              ¿Buscas una marca o producto
              específico?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl leading-7 text-neutral-300">
              Contacta a nuestro equipo para
              consultar disponibilidad,
              presentaciones y alternativas para
              tu negocio.
            </p>

            <Link
              to="/contacto"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-bmg-blue px-7 py-3.5 font-semibold text-bmg-dark transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bmg-dark"
            >
              Contactar a BMG
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}

export default Brands