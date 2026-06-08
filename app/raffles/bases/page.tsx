export default function RafflesBasesPage() {
  return (
    <section className="bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-12">

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Bases Generales de Sorteos
          </h1>

          <p className="text-slate-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>

        </div>

        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold mb-3">
              1. Bases particulares
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Cada sorteo publicado en la plataforma podrá contar con bases
              particulares complementarias que establecerán premios,
              fechas, requisitos de participación, cantidad de participaciones,
              mecanismos de selección y demás condiciones específicas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              2. Participación
            </h2>

            <p className="text-slate-300 leading-relaxed">
              La compra de un producto digital otorga participaciones para el
              sorteo asociado, según las condiciones publicadas para cada
              campaña promocional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              3. Publicación de bases
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Las bases específicas de cada sorteo podrán estar disponibles
              mediante documento adjunto, enlace externo o publicación oficial
              realizada por la administración.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              4. Modificaciones
            </h2>

            <p className="text-slate-300 leading-relaxed">
              La administración podrá modificar fechas, plazos o condiciones
              cuando existan causas justificadas, siempre que dichas
              modificaciones sean informadas oportunamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              5. Documentación oficial
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Cuando corresponda, las bases particulares podrán encontrarse
              protocolizadas, certificadas o respaldadas mediante documentación
              legal adicional.
            </p>
          </section>

        </div>

        <div className="mt-12 border border-blue-500/20 bg-blue-500/10 rounded-2xl p-6">

          <h3 className="font-bold text-lg mb-2">
            Información importante
          </h3>

          <p className="text-slate-300">
            Las bases específicas de cada sorteo serán publicadas junto a la
            campaña correspondiente una vez definidas las condiciones finales,
            premios, plazos y demás requisitos aplicables.
          </p>

        </div>

      </div>

    </section>
  )
}