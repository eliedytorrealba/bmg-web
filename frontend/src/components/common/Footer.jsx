import bmgWhiteLogo from '../../assets/logos/bmg-white.png'
import {
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'

const currentYear = new Date().getFullYear()

const footerLinks = [
  {
    title: 'Empresa',
    links: [
      { label: 'Inicio', href: '/' },
      { label: 'Nosotros', href: '/nosotros' },
      { label: 'Marcas', href: '/marcas' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },
  {
    title: 'Catálogo',
    links: [
      { label: 'Productos', href: '/productos' },
      {
        label: 'Lubricantes',
        href: '/productos?categoria=lubricantes',
      },
      {
        label: 'Filtros',
        href: '/productos?categoria=filtros',
      },
      {
        label: 'Aditivos',
        href: '/productos?categoria=aditivos',
      },
    ],
  },
  {
    title: 'Clientes',
    links: [
      { label: 'Iniciar sesión', href: '/login' },
      { label: 'Mi cuenta', href: '/perfil' },
      { label: 'Mi carrito', href: '/carrito' },
      {
        label: 'Preguntas frecuentes',
        href: '/preguntas-frecuentes',
      },
    ],
  },
]

function Footer() {
  return (
    <footer className="bg-bmg-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex flex-col items-start">
            <a
              href="/"
              className="inline-flex items-center"
              aria-label="Ir al inicio de BMG Distribuidora"
            >
              <img
                src={bmgWhiteLogo}
                alt="BMG Distribuidora"
                className="h-16 w-auto object-contain"
              />
            </a>

            <p className="mt-6 max-w-md leading-7 text-neutral-300">
              Distribuimos lubricantes, filtros, aditivos, cosmética y
              accesorios para talleres, lubricentros, comercios y
              distribuidores.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="tel:+540000000000"
                className="flex items-center gap-3 text-neutral-300 transition hover:text-bmg-blue"
              >
                <Phone
                  size={19}
                  aria-hidden="true"
                  className="shrink-0"
                />

                <span>+54 0000 0000</span>
              </a>

              <a
                href="mailto:ventas@bmgdistribuidora.com"
                className="flex items-center gap-3 text-neutral-300 transition hover:text-bmg-blue"
              >
                <Mail
                  size={19}
                  aria-hidden="true"
                  className="shrink-0"
                />

                <span>ventas@bmgdistribuidora.com</span>
              </a>

              <div className="flex items-center gap-3 text-neutral-300">
                <MapPin
                  size={19}
                  aria-hidden="true"
                  className="shrink-0"
                />

                <span>Argentina</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#"
                aria-label="Visitar Facebook de BMG Distribuidora"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-bmg-blue hover:bg-bmg-blue hover:text-bmg-dark"
              >
                Facebook
              </a>

              <a
                href="#"
                aria-label="Visitar Instagram de BMG Distribuidora"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-bmg-blue hover:bg-bmg-blue hover:text-bmg-dark"
              >
                Instagram
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h2 className="font-bold text-white">
                  {group.title}
                </h2>

                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-neutral-300 transition hover:text-bmg-blue"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} BMG Distribuidora. Todos los derechos reservados.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a
                href="/privacidad"
                className="transition hover:text-bmg-blue"
              >
                Política de privacidad
              </a>

              <a
                href="/terminos"
                className="transition hover:text-bmg-blue"
              >
                Términos y condiciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer