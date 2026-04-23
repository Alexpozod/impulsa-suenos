import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">

      {/* TOP */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            ImpulsaSueños
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Plataforma para recaudar fondos y ayudar a personas reales.
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Navegación
          </h4>

          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/campaigns" className="hover:text-white transition">
                Campañas
              </Link>
            </li>
            <li>
              <Link href="/sorteos" className="hover:text-white transition">
                Sorteos
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Legal
          </h4>

          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/terminos" className="hover:text-white transition">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-white transition">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-white transition">
                Política de cookies
              </Link>
            </li>
            <li>
              <Link href="/aml-kyc" className="hover:text-white transition">
                AML / KYC
              </Link>
            </li>
            <li>
              <Link href="/pagos-retiros" className="hover:text-white transition">
                Pagos y Retiros
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACTO */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Contacto
          </h4>

          <ul className="space-y-2 text-sm">
            <li>contacto@impulsasuenos.com</li>
            <li>soporte@impulsasuenos.com</li>
          </ul>
        </div>

      </div>

      {/* DIVISOR */}
      <div className="border-t border-gray-800" />

      {/* COPYRIGHT */}
      <div className="text-center text-xs py-4 text-gray-500">
        © {new Date().getFullYear()} ImpulsaSueños — Todos los derechos reservados
      </div>

      {/* ⚖️ AVISO LEGAL PRO */}
      <div className="bg-gray-950 text-center text-xs text-gray-400 px-6 py-4 leading-relaxed">
        ImpulsaSueños es una plataforma de intermediación tecnológica. 
        Los aportes realizados no constituyen donaciones legales ni generan beneficios tributarios. 
        Cada creador de campaña es responsable por el uso de los fondos recibidos.
      </div>

    </footer>
  )
}