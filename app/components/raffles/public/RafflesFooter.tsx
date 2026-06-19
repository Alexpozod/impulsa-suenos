import Link from "next/link"

export default function RafflesFooter() {

  return (

    <footer className="bg-slate-950 border-t border-slate-800">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* MARCA */}

          <div>

            <h3 className="text-white text-xl font-black mb-3">
              ImpulsaSueños Sorteos
            </h3>

            <p className="text-slate-400 leading-relaxed">
              Participa en iniciativas transparentes,
sigue cada proceso y consulta
los resultados públicamente.
            </p>

          </div>

          {/* SORTEOS */}

          <div>

            <h4 className="text-white font-bold mb-4">
              Sorteos
            </h4>

            <div className="flex flex-col gap-3">

              <Link
  href="/raffles#sorteos-activos"
  className="
    text-slate-400
    hover:text-cyan-400
    transition-colors
  "
>
  Sorteos Activos
</Link>

              <Link
  href="/raffles/winners"
  className="
    text-slate-400
    hover:text-cyan-400
    transition-colors
  "
>
  Ganadores
</Link>

              <Link
  href="/raffles/my-tickets"
  className="
    text-slate-400
    hover:text-cyan-400
    transition-colors
  "
>
  Mis Participaciones
</Link>

            </div>

          </div>

          {/* INFORMACIÓN */}

          <div>

            <h4 className="text-white font-bold mb-4">
              Información
            </h4>

            <div className="flex flex-col gap-3">

              <Link href="/raffles/como-funciona">
  Cómo Funciona
</Link>

              <Link href="/raffles/faq">
  Preguntas Frecuentes
</Link>

              <a
                href="mailto:contacto@impulsasuenos.com"
              >
                Contacto
              </a>

            </div>

          </div>

          {/* LEGAL */}

          <div>

            <h4 className="text-white font-bold mb-4">
              Legal
            </h4>

            <div className="flex flex-col gap-3">

              <Link href="/raffles/terminos">
  Términos y Condiciones
</Link>

              <Link href="/raffles/privacidad">
  Política de Privacidad
</Link>

              <Link href="/raffles/cookies">
  Política de Cookies
</Link>

              <Link href="/raffles/bases">
                Bases Generales
              </Link>

            </div>

          </div>

        </div>

      </div>
      
      {/* COPYRIGHT */}

      <div className="border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-4 text-center">

          <div className="text-slate-500 text-sm">

            © {new Date().getFullYear()} ImpulsaSueños Sorteos

          </div>

        </div>

      </div>

      {/* AVISO */}

      <div className="bg-black/30 border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-3">

          <p className="text-xs text-slate-500 text-center leading-relaxed">

            ImpulsaSueños Sorteos es una plataforma tecnológica
            de participación en sorteos promocionales. La
            disponibilidad de premios, condiciones, fechas,
            mecanismos de selección y bases legales pueden variar
            según cada sorteo publicado.

          </p>

        </div>

      </div>

    </footer>

  )
}