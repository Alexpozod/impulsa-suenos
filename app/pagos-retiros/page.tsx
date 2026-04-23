export default function PagosRetirosPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
        Política de Pagos y Retiros
      </h1>

      <p className="text-sm text-gray-500 mb-10">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Procesamiento de pagos
          </h2>
          <p>
            Los pagos realizados en la plataforma son procesados a través de proveedores externos. 
            ImpulsaSueños no almacena información financiera sensible de los usuarios.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Comisiones
          </h2>

          <p>Las comisiones aplicables son:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Comisión de plataforma: <strong>$300 CLP + IVA</strong> por aporte</li>
            <li>Comisión de pasarela de pago: según proveedor utilizado</li>
          </ul>

          <p className="mt-3">
            Estas condiciones pueden ser modificadas con previo aviso.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. Saldos
          </h2>
          <p>
            Los fondos acumulados en cada campaña pertenecen al usuario creador de la misma, 
            sujeto a las condiciones establecidas en la plataforma.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Retiros
          </h2>

          <p>Los retiros de fondos estarán sujetos a las siguientes condiciones:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Verificación de identidad aprobada (KYC)</li>
            <li>Ausencia de bloqueos o alertas de riesgo</li>
            <li>No tener retiros pendientes en proceso</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            5. Plazos
          </h2>
          <p>
            Los retiros pueden tardar entre <strong>24 a 72 horas hábiles</strong>, 
            dependiendo del proveedor de pago y validaciones internas.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. Reversos
          </h2>
          <p>
            En caso de fraude, error o solicitud válida del proveedor de pago, 
            los fondos podrán ser revertidos total o parcialmente.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            7. Responsabilidad tributaria
          </h2>
          <p>
            El usuario es responsable de declarar los ingresos obtenidos a través de la plataforma 
            conforme a la legislación vigente.
          </p>
        </section>

      </div>

    </main>
  )
}