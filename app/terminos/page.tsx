export default function TerminosPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
        Términos y Condiciones
      </h1>

      <p className="text-sm text-gray-500 mb-10">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Identificación del prestador
          </h2>
          <p>
            ImpulsaSueños es una plataforma digital operada por <strong>VERQON GROUP SPA</strong>, 
            RUT 76.865.186-8.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Naturaleza del servicio
          </h2>
          <p>
            ImpulsaSueños es una plataforma tecnológica que permite a usuarios crear campañas de recaudación de fondos 
            y a terceros realizar aportes voluntarios.
          </p>
          <p>
            La plataforma actúa exclusivamente como intermediario tecnológico y no es beneficiaria de los fondos recaudados.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. No constitución de donación legal
          </h2>
          <p>
            Los aportes realizados a través de la plataforma no constituyen donaciones acogidas a beneficios tributarios 
            según la legislación chilena.
          </p>
          <p>
            ImpulsaSueños no es una fundación ni entidad sin fines de lucro.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Usuarios y registro
          </h2>
          <p>
            Los usuarios deberán registrarse con información veraz, completa y actualizada.
          </p>
          <p>
            ImpulsaSueños podrá solicitar verificación de identidad (KYC) antes de permitir retiros de fondos.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            5. Responsabilidad del creador de campaña
          </h2>

          <p>El creador de la campaña es el único responsable de:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>La veracidad de la información publicada</li>
            <li>El destino de los fondos recaudados</li>
            <li>El cumplimiento de obligaciones legales y tributarias</li>
          </ul>

          <p className="mt-3">
            ImpulsaSueños no garantiza el uso de los fondos ni la veracidad de las campañas.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. Comisiones
          </h2>
          <p>
            La plataforma cobrará una comisión fija de <strong>$300 CLP + IVA</strong> por cada aporte recibido, 
            además de las comisiones de la pasarela de pago.
          </p>
          <p>
            Estas comisiones podrán ser modificadas con previo aviso.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            7. Procesamiento de pagos
          </h2>
          <p>
            Los pagos son procesados por terceros proveedores. ImpulsaSueños no almacena datos financieros sensibles.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            8. Retiros de fondos
          </h2>

          <p>Los retiros estarán sujetos a:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Verificación de identidad (KYC)</li>
            <li>Validaciones de riesgo</li>
            <li>Ausencia de retiros pendientes</li>
          </ul>

          <p className="mt-3">
            ImpulsaSueños podrá retener fondos en caso de sospecha de fraude o incumplimiento.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            9. Prohibiciones
          </h2>

          <p>Se prohíbe el uso de la plataforma para:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Actividades ilegales</li>
            <li>Lavado de dinero</li>
            <li>Fraudes o estafas</li>
            <li>Financiamiento ilícito</li>
          </ul>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            10. Limitación de responsabilidad
          </h2>
          <p>
            ImpulsaSueños no será responsable por pérdidas, daños o perjuicios derivados del uso de la plataforma 
            o del incumplimiento de los usuarios.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            11. Terminación de cuenta
          </h2>
          <p>
            La plataforma podrá suspender o eliminar cuentas sin previo aviso en caso de incumplimiento.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            12. Legislación aplicable
          </h2>
          <p>
            Estos términos se rigen por las leyes de la República de Chile.
          </p>
        </section>

      </div>

    </main>
  )
}