import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import PublicLayout from './layouts/PublicLayout'

import About from './pages/About/About'
import Brands from './pages/Brands/Brands'
import Cart from './pages/Cart/Cart'
import ClientAddresses from './pages/Profile/ClientAddresses'
import Contact from './pages/Contact/Contact'
import ClientFavorites from './pages/Profile/ClientFavorites'
import ClientNotifications from './pages/Profile/ClientNotifications'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import ClientAccount from './pages/Profile/ClientAccount'
import ClientData from './pages/Profile/ClientData'
import ClientEditAccount from './pages/Profile/ClientEditAccount'
import ClientQuoteDetail from './pages/Profile/ClientQuoteDetail'
import ClientQuotes from './pages/Profile/ClientQuotes'
import ProductDetail from './pages/Products/ProductDetail'
import Products from './pages/Products/Products'
import QuoteRequest from './pages/Quotes/QuoteRequest'

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

          <Route
            path="/login"
            element={<Login />}
          />

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