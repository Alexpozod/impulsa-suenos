import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            ImpulsaSueños
          </h3>
          <p className="text-sm text-gray-400">
            Plataforma para recaudar fondos y participar en sorteos
            ayudando a otros.
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Navegación
          </h4>

          <ul className="space-y-2 text-sm">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/campaigns">Campañas</Link></li>
            <li><Link href="/raffles">Sorteos</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Legal
          </h4>

          <ul className="space-y-2 text-sm">
            <li><Link href="/terms">Términos y condiciones</Link></li>
            <li><Link href="/privacy">Política de privacidad</Link></li>
            <li><Link href="/cookies">Política de cookies</Link></li>
            <Link href="/aml-kyc">AML / KYC</Link>
            <Link href="/pagos-retiros">Pagos y Retiros</Link>
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

      <div className="border-t border-gray-800 text-center text-xs py-4 text-gray-500">
        © {new Date().getFullYear()} ImpulsaSueños — Todos los derechos reservados
      </div>

{/* 🔒 AVISO LEGAL */}
<div className="mt-10 border-t pt-6 text-center">
  <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
    ImpulsaSueños es una plataforma de intermediación tecnológica. 
    Los aportes realizados no constituyen donaciones legales ni generan beneficios tributarios. 
    Cada creador de campaña es responsable por el uso de los fondos recibidos.
  </p>
</div>

    </footer>
  )
}
