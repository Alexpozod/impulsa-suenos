export default function AMLKYCPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
        Política AML / KYC
      </h1>

      <p className="text-sm text-gray-500 mb-10">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Objetivo
          </h2>
          <p>
            La presente política tiene como objetivo prevenir el uso de la plataforma 
            para actividades ilícitas, incluyendo el lavado de activos y financiamiento ilegal.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Identificación de usuarios
          </h2>
          <p>
            ImpulsaSueños podrá requerir verificación de identidad (KYC) a los usuarios, 
            especialmente previo a la habilitación de retiros de fondos.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. Monitoreo de transacciones
          </h2>
          <p>
            La plataforma monitorea continuamente las transacciones con el fin de detectar 
            patrones de comportamiento inusuales o potencialmente fraudulentos.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Señales de alerta
          </h2>

          <p>Se consideran señales de alerta, entre otras:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Múltiples transacciones sospechosas o inusuales</li>
            <li>Uso de identidades falsas o inconsistentes</li>
            <li>Movimientos de fondos sin justificación clara</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            5. Acciones
          </h2>

          <p>En caso de detección de actividad sospechosa, ImpulsaSueños podrá:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Bloquear temporal o permanentemente la cuenta</li>
            <li>Retener fondos asociados</li>
            <li>Reportar la actividad a las autoridades competentes</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. Cumplimiento normativo
          </h2>
          <p>
            ImpulsaSueños cumple con la normativa chilena vigente y estándares internacionales 
            en materia de prevención de lavado de activos (AML) y conocimiento del cliente (KYC).
          </p>
        </section>

      </div>

    </main>
  )
}