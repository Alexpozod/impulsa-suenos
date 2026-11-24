import Link from "next/link"

export default function RafflesFooter() {

  return (

    <footer className="bg-[#002314] border-t border-[#285143]">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* MARCA */}

          <div>

            <div className="inline-flex rounded-xl bg-[#FAF9F5] px-3 py-2 mb-3">
              <img
                src="/raffles/brand/logo-impulsa.svg"
                alt="ImpulsaSueños"
                className="h-12 w-auto max-w-[190px] object-contain"
              />
            </div>
            <h3 className="text-white text-xl font-black mb-3">
              ImpulsaSueños Sorteos
            </h3>

            <p className="text-[#EDE8FD]/75 leading-relaxed">
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
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Sorteos Activos
</Link>

              <Link
  href="/raffles/winners"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Ganadores
</Link>

              <Link
  href="/raffles/my-tickets"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
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

              <Link
  href="/raffles/como-funciona"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Cómo Funciona
</Link>

              <Link
  href="/raffles/faq"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Preguntas Frecuentes
</Link>

              <a
  href="mailto:contacto@impulsasuenos.com"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
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

              <Link
  href="/raffles/terminos"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Términos y Condiciones
</Link>

              <Link
  href="/raffles/privacidad"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Política de Privacidad
</Link>

              <Link
  href="/raffles/cookies"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
  Política de Cookies
</Link>

              <Link
  href="/raffles/bases"
  className="
    text-[#EDE8FD]/75
    hover:text-[#A8C63A]
    transition-colors
  "
>
                Bases Generales
              </Link>

            </div>

          </div>

        </div>

      </div>
      
      {/* COPYRIGHT */}

      <div className="border-t border-[#285143]">

        <div className="max-w-7xl mx-auto px-6 py-4 text-center">

          <div className="text-[#EDE8FD]/60 text-sm">

            © {new Date().getFullYear()} ImpulsaSueños

          </div>

        </div>

      </div>

      {/* AVISO */}

      <div className="bg-black/20 border-t border-[#285143]">

        <div className="max-w-7xl mx-auto px-6 py-3">

          <p className="text-xs text-[#EDE8FD]/60 text-center leading-relaxed">

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