import { Outlet } from 'react-router-dom'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default PublicLayout