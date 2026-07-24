function Home() {
  return (
    <>
      <section className="bg-bmg-light">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex rounded-full bg-bmg-blue/15 px-4 py-2 text-sm font-semibold text-bmg-dark">
              Distribución para el sector automotor
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-bmg-dark sm:text-5xl lg:text-6xl">
              Todo para tu vehículo, en un solo lugar.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              Lubricantes, filtros, aditivos, cosmética y accesorios de las
              mejores marcas.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/productos"
  className="inline-flex items-center justify-center rounded-full bg-bmg-dark px-7 py-3.5 font-semibold text-white transition hover:bg-neutral-700"
              >
                Ver catálogo
              </a>

              <a
                href="/marcas"
                className="rounded-full bg-bmg-green px-7 py-3.5 font-semibold text-bmg-dark transition hover:brightness-95"
              >
                Conocer marcas
              </a>
            </div>
          </div>

          <div className="flex min-h-80 items-center justify-center rounded-3xl bg-bmg-dark p-10 text-center text-white shadow-xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-bmg-blue">
                Imagen principal
              </p>

              <p className="mt-4 text-xl font-semibold">
                Aquí colocaremos una fotografía de lubricantes y productos
                automotores.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="text-center">
          <p className="font-semibold text-bmg-blue">Nuestro catálogo</p>

          <h2 className="mt-2 text-3xl font-bold text-bmg-dark">
            Categorías principales
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[
            'Lubricantes',
            'Filtros',
            'Aditivos',
            'Cosmética',
            'Accesorios',
          ].map((category) => (
            <article
              key={category}
              className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-bmg-blue hover:shadow-lg"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-bmg-blue/15" />

              <h3 className="mt-5 font-semibold text-bmg-dark">{category}</h3>

              <a
                href="/productos"
                className="mt-3 inline-block text-sm font-semibold text-neutral-500 hover:text-bmg-blue"
              >
                Ver productos
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home