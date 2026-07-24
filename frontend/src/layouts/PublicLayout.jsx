import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}

export default PublicLayout