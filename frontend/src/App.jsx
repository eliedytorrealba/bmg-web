import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import PublicLayout from './layouts/PublicLayout'

import About from './pages/About/About'
import AdminCatalog from './pages/Admin/AdminCatalog'
import AdminClientDetail from './pages/Admin/AdminClientDetail'
import AdminClients from './pages/Admin/AdminClients'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminHighlights from './pages/Admin/AdminHighlights'
import AdminNotifications from './pages/Admin/AdminNotifications'
import AdminPriceListDetail from './pages/Admin/AdminPriceListDetail'
import AdminPriceLists from './pages/Admin/AdminPriceLists'
import AdminQuoteDetail from './pages/Admin/AdminQuoteDetail'
import AdminQuotes from './pages/Admin/AdminQuotes'
import Brands from './pages/Brands/Brands'
import Cart from './pages/Cart/Cart'
import Contact from './pages/Contact/Contact'
import EmailVerification from './pages/EmailVerification/EmailVerification'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import ProductDetail from './pages/Products/ProductDetail'
import Products from './pages/Products/Products'
import ClientAccount from './pages/Profile/ClientAccount'
import ClientAddresses from './pages/Profile/ClientAddresses'
import ClientData from './pages/Profile/ClientData'
import ClientEditAccount from './pages/Profile/ClientEditAccount'
import ClientFavorites from './pages/Profile/ClientFavorites'
import ClientNotifications from './pages/Profile/ClientNotifications'
import ClientQuoteDetail from './pages/Profile/ClientQuoteDetail'
import ClientQuotes from './pages/Profile/ClientQuotes'
import QuoteRequest from './pages/Quotes/QuoteRequest'
import Register from './pages/Register/Register'

import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/productos"
            element={<Products />}
          />

          <Route
            path="/productos/:productId"
            element={<ProductDetail />}
          />

          <Route
            path="/marcas"
            element={<Brands />}
          />

          <Route
            path="/contacto"
            element={<Contact />}
          />

          <Route
            path="/nosotros"
            element={<About />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Autenticación
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/registro"
            element={<Register />}
          />

          <Route
            path="/verificar-email"
            element={<EmailVerification />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Cliente
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/carrito"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/solicitar-cotizacion"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <QuoteRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientAccount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/datos"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientData />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/editar"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientEditAccount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/favoritos"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientFavorites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/notificaciones"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/direccion"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientAddresses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/cotizaciones"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientQuotes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-cuenta/cotizaciones/:quoteId"
            element={
              <ProtectedRoute
                allowedRoles={['client']}
              >
                <ClientQuoteDetail />
              </ProtectedRoute>
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Administración
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/catalogo"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminCatalog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminClients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clientes/:clientId"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminClientDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/listas-precios"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminPriceLists />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/listas-precios/:priceListId"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminPriceListDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/destacados"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminHighlights />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/cotizaciones"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminQuotes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/cotizaciones/:quoteId"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminQuoteDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notificaciones"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  )
}

export default App