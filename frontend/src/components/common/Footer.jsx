import logoBmg from '../../assets/logos/logo-bmg.png'

function Footer() {
  return (
    <footer className="bg-bmg-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <img
            src={logoBmg}
            alt="BMG Distribuidora"
            className="h-20 w-auto rounded-lg bg-white p-2"
          />

          <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-300">
            Distribución de lubricantes, filtros, aditivos, cosmética y
            productos para el sector automotor.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Navegación</h2>

          <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-300">
            <a href="/productos" className="hover:text-bmg-blue">
              Productos
            </a>
            <a href="/marcas" className="hover:text-bmg-blue">
              Marcas
            </a>
            <a href="/nosotros" className="hover:text-bmg-blue">
              Nosotros
            </a>
            <a href="/contacto" className="hover:text-bmg-blue">
              Contacto
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-semibold">Contacto</h2>

          <div className="mt-4 space-y-3 text-sm text-neutral-300">
            <p>Buenos Aires, Argentina</p>
            <p>ventas@bmgdistribuidora.com</p>
            <p>WhatsApp: pendiente</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} BMG Distribuidora. Todos los derechos
        reservados.
      </div>
    </footer>
  )
}

export default Footer