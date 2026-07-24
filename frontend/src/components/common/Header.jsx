import { Menu, Search, ShoppingCart, UserRound } from 'lucide-react'
import logoBmg from '../../assets/logos/logo-bmg.png'

function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 lg:px-8">
        <a href="/" aria-label="Ir al inicio">
          <img
            src={logoBmg}
            alt="BMG Distribuidora"
            className="h-16 w-auto object-contain"
          />
        </a>

        <div className="hidden max-w-xl flex-1 md:block">
          <form className="relative">
            <label htmlFor="product-search" className="sr-only">
              Buscar productos
            </label>

            <input
              id="product-search"
              type="search"
              placeholder="Buscar por producto, marca o código..."
              className="h-12 w-full rounded-full border border-neutral-300 bg-neutral-50 px-5 pr-12 text-sm outline-none transition focus:border-bmg-blue focus:bg-white focus:ring-4 focus:ring-bmg-blue/15"
            />

            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-bmg-dark text-white transition hover:bg-neutral-700"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Iniciar sesión"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 transition hover:border-bmg-blue hover:bg-bmg-blue/10"
          >
            <UserRound size={21} />
          </button>

          <button
            type="button"
            aria-label="Abrir carrito"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-bmg-dark text-white transition hover:bg-neutral-700"
          >
            <ShoppingCart size={20} />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bmg-green px-1 text-xs font-bold text-bmg-dark">
              0
            </span>
          </button>

          <button
            type="button"
            aria-label="Abrir menú"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-neutral-100 bg-bmg-dark text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-8 py-4 text-sm font-semibold">
          <a href="/" className="transition hover:text-bmg-blue">
            Inicio
          </a>

          <a href="/productos" className="transition hover:text-bmg-blue">
            Productos
          </a>

          <a href="/marcas" className="transition hover:text-bmg-blue">
            Marcas
          </a>

          <a href="/promociones" className="transition hover:text-bmg-blue">
            Promociones
          </a>

          <a href="/nosotros" className="transition hover:text-bmg-blue">
            Nosotros
          </a>

          <a href="/contacto" className="transition hover:text-bmg-blue">
            Contacto
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Header