import {
  Bell,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShoppingCart,
  UserRound,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom'

import bmgColorLogo from '../../assets/logos/bmg-color.png'
import useAuth from '../../hooks/useAuth'
import useCart from '../../hooks/useCart'
import useFavorites from '../../hooks/useFavorites'
import useNotifications from '../../hooks/useNotifications'

const navigationLinks = [
  {
    label: 'Inicio',
    to: '/',
    end: true,
  },
  {
    label: 'Productos',
    to: '/productos',
  },
  {
    label: 'Marcas',
    to: '/marcas',
  },
  {
    label: 'Nosotros',
    to: '/nosotros',
  },
  {
    label: 'Contacto',
    to: '/contacto',
  },
]

function getDesktopNavigationClass({
  isActive,
}) {
  const baseClasses =
    'relative py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4'

  if (isActive) {
    return `${baseClasses} text-bmg-blue after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-bmg-blue`
  }

  return `${baseClasses} text-neutral-700 hover:text-bmg-blue`
}

function getMobileNavigationClass({
  isActive,
}) {
  const baseClasses =
    'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2'

  if (isActive) {
    return `${baseClasses} bg-bmg-blue/10 text-bmg-blue`
  }

  return `${baseClasses} text-neutral-700 hover:bg-neutral-100 hover:text-bmg-blue`
}

function Header() {
  const {
    totalItems,
    clearCart,
  } = useCart()

  const {
    favoriteCount,
  } = useFavorites()

  const {
    unreadCount,
  } = useNotifications()

  const {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth()

  const navigate = useNavigate()

  const [
    isAccountMenuOpen,
    setIsAccountMenuOpen,
  ] = useState(false)

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false)

  const accountMenuRef = useRef(null)

  const isClient =
    !isLoading &&
    isAuthenticated &&
    !isAdmin &&
    user?.role === 'client'

  useEffect(() => {
    function handleDocumentClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target,
        )
      ) {
        setIsAccountMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleDocumentClick,
    )

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleDocumentClick,
      )

      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()

      clearCart()

      setIsAccountMenuOpen(false)

      navigate('/', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'No se pudo cerrar la sesión:',
        error,
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  const accountPath = isAdmin
    ? '/admin'
    : '/mi-cuenta'

  const accountLabel = isAdmin
    ? 'Panel administrativo'
    : 'Mi cuenta'

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-24 max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-4"
          aria-label="Ir al inicio de BMG Distribuidora"
        >
          <img
            src={bmgColorLogo}
            alt="BMG Distribuidora"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <nav
          className="hidden items-center gap-9 lg:flex"
          aria-label="Navegación principal"
        >
          {navigationLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={
                getDesktopNavigationClass
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading &&
            !isAuthenticated && (
              <Link
                to="/login"
                className="hidden items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 sm:inline-flex"
              >
                <LogIn
                  size={17}
                  aria-hidden="true"
                  className="shrink-0"
                />

                <span>
                  Iniciar sesión
                </span>
              </Link>
            )}

          {!isLoading &&
            isAuthenticated && (
              <div
                ref={accountMenuRef}
                className="relative hidden sm:block"
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsAccountMenuOpen(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  aria-expanded={
                    isAccountMenuOpen
                  }
                  aria-haspopup="menu"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold leading-none text-bmg-dark transition hover:border-bmg-blue hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2"
                >
                  <UserRound
                    size={18}
                    aria-hidden="true"
                    className="shrink-0"
                  />

                  <span className="max-w-36 truncate text-sm font-semibold leading-none">
                    {user?.name ??
                      'Mi cuenta'}
                  </span>

                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 transition ${
                      isAccountMenuOpen
                        ? 'rotate-180'
                        : ''
                    }`}
                  />
                </button>

                {isAccountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl"
                  >
                    <div className="border-b border-neutral-100 px-3 py-3">
                      <p className="truncate text-sm font-bold text-bmg-dark">
                        {user?.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {user?.email}
                      </p>

                      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-bmg-blue">
                        {isAdmin
                          ? 'Administrador'
                          : 'Cliente'}
                      </p>
                    </div>

                    <Link
                      to={accountPath}
                      role="menuitem"
                      onClick={() =>
                        setIsAccountMenuOpen(
                          false,
                        )
                      }
                      className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-bmg-dark transition hover:bg-neutral-100 hover:text-bmg-blue"
                    >
                      {isAdmin ? (
                        <LayoutDashboard
                          size={18}
                          aria-hidden="true"
                        />
                      ) : (
                        <UserRound
                          size={18}
                          aria-hidden="true"
                        />
                      )}

                      {accountLabel}
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-bmg-dark transition hover:bg-neutral-100 hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut
                        size={18}
                        aria-hidden="true"
                        className="shrink-0"
                      />

                      {isLoggingOut
                        ? 'Cerrando sesión...'
                        : 'Cerrar sesión'}
                    </button>
                  </div>
                )}
              </div>
            )}

          {isClient && (
  <NavLink
    to="/mi-cuenta/favoritos"
    aria-label={
      favoriteCount > 0
        ? `Favoritos, ${favoriteCount} productos guardados`
        : 'Favoritos'
    }
    className={({ isActive }) => {
      const baseClasses =
        'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2'

      if (isActive) {
        return `${baseClasses} border-bmg-blue bg-bmg-blue/10 text-bmg-blue`
      }

      return `${baseClasses} border-neutral-300 bg-white text-bmg-dark hover:border-bmg-blue hover:text-bmg-blue`
    }}
  >
    <Heart
      size={20}
      fill="none"
      aria-hidden="true"
    />

    {favoriteCount > 0 && (
      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-bmg-blue px-1 text-[11px] font-bold leading-none text-bmg-dark ring-2 ring-white">
        {favoriteCount > 99
          ? '99+'
          : favoriteCount}
      </span>
    )}
  </NavLink>
)}

{isClient && (
  <NavLink
    to="/mi-cuenta/notificaciones"
    aria-label={
      unreadCount > 0
        ? `Notificaciones, ${unreadCount} sin leer`
        : 'Notificaciones'
    }
    className={({ isActive }) => {
      const baseClasses =
        'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2'

      if (isActive) {
        return `${baseClasses} border-bmg-blue bg-bmg-blue/10 text-bmg-blue`
      }

      return `${baseClasses} border-neutral-300 bg-white text-bmg-dark hover:border-bmg-blue hover:text-bmg-blue`
    }}
  >
    <Bell
      size={20}
      aria-hidden="true"
    />

    {unreadCount > 0 && (
      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-bmg-blue px-1 text-[11px] font-bold leading-none text-bmg-dark ring-2 ring-white">
        {unreadCount > 99
          ? '99+'
          : unreadCount}
      </span>
    )}
  </NavLink>
)}
          {isClient && (
            <NavLink
              to="/carrito"
              className={({ isActive }) => {
                const baseClasses =
                  'relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 sm:px-5'

                if (isActive) {
                  return `${baseClasses} bg-bmg-blue text-bmg-dark`
                }

                return `${baseClasses} bg-bmg-dark text-white hover:bg-neutral-700`
              }}
            >
              <span className="relative">
                <ShoppingCart
                  size={18}
                  aria-hidden="true"
                  className="shrink-0"
                />

                {totalItems > 0 && (
                  <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-bmg-blue px-1 text-[11px] font-bold leading-none text-bmg-dark ring-2 ring-white sm:hidden">
                    {totalItems > 99
                      ? '99+'
                      : totalItems}
                  </span>
                )}
              </span>

              <span className="hidden sm:inline">
                Mi carrito
              </span>

              {totalItems > 0 && (
                <span className="hidden min-w-6 items-center justify-center rounded-full bg-bmg-blue px-2 py-1 text-xs font-bold leading-none text-bmg-dark sm:inline-flex">
                  {totalItems > 99
                    ? '99+'
                    : totalItems}
                </span>
              )}

              <span className="sr-only sm:hidden">
                Ir al carrito
                {totalItems > 0
                  ? `, ${totalItems} ${
                      totalItems === 1
                        ? 'unidad agregada'
                        : 'unidades agregadas'
                    }`
                  : ''}
              </span>
            </NavLink>
          )}
        </div>
      </div>

      <nav
        className="border-t border-neutral-100 bg-white px-4 py-3 lg:hidden"
        aria-label="Navegación móvil"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={
                getMobileNavigationClass
              }
            >
              {link.label}
            </NavLink>
          ))}

          {!isLoading &&
            !isAuthenticated && (
              <NavLink
                to="/login"
                className={
                  getMobileNavigationClass
                }
              >
                Iniciar sesión
              </NavLink>
            )}

          {!isLoading &&
            isAuthenticated && (
              <>
                <NavLink
                  to={accountPath}
                  className={
                    getMobileNavigationClass
                  }
                >
                  {accountLabel}
                </NavLink>

                {isClient && (
                  <NavLink
                    to="/carrito"
                    className={
                      getMobileNavigationClass
                    }
                  >
                    Mi carrito
                    {totalItems > 0
                      ? ` (${totalItems > 99 ? '99+' : totalItems})`
                      : ''}
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-bmg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmg-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut
                  ? 'Cerrando...'
                  : 'Cerrar sesión'}
                </button>
              </>
            )}
        </div>
      </nav>
    </header>
  )
}

export default Header