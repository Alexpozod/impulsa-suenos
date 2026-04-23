export default function ComoFunciona() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          ¿Cómo funciona ImpulsaSueños?
        </h1>

        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          ImpulsaSueños es una plataforma donde puedes apoyar causas reales o crear tu propia campaña.
          Todo funciona de forma simple, transparente y segura.
        </p>

        {/* PASOS */}
        <div className="space-y-8">

          {/* PASO 1 */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="font-bold text-lg mb-2">
              1. Crea o apoya una campaña
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Puedes crear una campaña para recaudar fondos o apoyar causas existentes con un aporte voluntario.
              Cada campaña es gestionada por su creador, quien es responsable de la información y uso de los fondos.
            </p>
          </div>

          {/* PASO 2 */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="font-bold text-lg mb-2">
              2. Realiza aportes de forma segura
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Los pagos se procesan mediante proveedores externos seguros.
              ImpulsaSueños no almacena datos financieros sensibles.
            </p>
          </div>

          {/* PASO 3 */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="font-bold text-lg mb-2">
              3. Participa en sorteos (opcional)
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Algunas campañas incluyen sorteos como incentivo para aumentar el alcance.
              La participación es opcional y depende de cada campaña.
            </p>
          </div>

          {/* PASO 4 */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="font-bold text-lg mb-2">
              4. Transparencia y seguimiento
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Todas las transacciones quedan registradas.
              Puedes seguir el progreso de cada campaña en tiempo real.
            </p>
          </div>

          {/* PASO 5 */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="font-bold text-lg mb-2">
              5. Retiro de fondos
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Los creadores pueden retirar los fondos una vez completadas las verificaciones de seguridad (KYC),
              sujeto a validaciones internas y políticas de la plataforma.
            </p>
          </div>

        </div>

        {/* AVISO LEGAL (CLAVE) */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 p-6 rounded-2xl text-sm text-yellow-800">
          <p className="font-semibold mb-2">
            ⚠️ Información importante
          </p>
          <p>
            ImpulsaSueños es una plataforma de intermediación tecnológica.
            Los aportes realizados no constituyen donaciones legales ni generan beneficios tributarios.
            Cada creador de campaña es responsable por el uso de los fondos recaudados.
          </p>
        </div>

      </div>

    </main>
  )
}