export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Preguntas frecuentes
        </h1>

        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          Resolvemos las dudas más comunes sobre cómo funciona ImpulsaSueños,
          pagos, seguridad y uso de la plataforma.
        </p>

        <div className="space-y-6">

          {/* BLOQUE */}
          {[
            {
              q: "¿Qué es ImpulsaSueños?",
              a: "ImpulsaSueños es una plataforma tecnológica que permite crear campañas para recaudar fondos y a otros usuarios realizar aportes voluntarios."
            },
            {
              q: "¿ImpulsaSueños es una fundación?",
              a: "No. ImpulsaSueños no es una fundación ni entidad sin fines de lucro. Es una plataforma de intermediación tecnológica."
            },
            {
              q: "¿Los aportes son donaciones legales?",
              a: "No. Los aportes realizados no constituyen donaciones acogidas a beneficios tributarios según la legislación chilena."
            },
            {
              q: "¿Cómo funcionan las campañas?",
              a: "Cualquier usuario puede crear una campaña. Otros usuarios pueden aportar dinero para ayudar a cumplir el objetivo definido por el creador."
            },
            {
              q: "¿Quién recibe el dinero?",
              a: "El dinero recaudado pertenece al creador de la campaña, quien es responsable del uso de los fondos."
            },
            {
              q: "¿Cómo se realizan los pagos?",
              a: "Los pagos se procesan mediante proveedores externos como MercadoPago. ImpulsaSueños no almacena datos financieros sensibles."
            },
            {
              q: "¿Es seguro pagar en la plataforma?",
              a: "Sí. Utilizamos proveedores de pago certificados y sistemas de validación para reducir riesgos y proteger las transacciones."
            },
            {
              q: "¿Hay comisiones?",
              a: "Sí. Se cobra una comisión fija de $300 CLP + IVA por aporte, además de la comisión del proveedor de pago."
            },
            {
              q: "¿Puedo participar en sorteos?",
              a: "Sí, algunas campañas incluyen sorteos como incentivo. La participación depende de cada campaña específica."
            },
            {
              q: "¿Cómo recibo confirmación de mi aporte?",
              a: "Recibirás un correo electrónico con el detalle de tu aporte una vez que el pago sea aprobado."
            },
            {
              q: "¿Qué pasa si una campaña es fraudulenta?",
              a: "ImpulsaSueños aplica controles y monitoreo, pero el creador es responsable del contenido. En casos sospechosos, podemos bloquear cuentas y retener fondos."
            },
            {
              q: "¿Se puede solicitar reembolso?",
              a: "Los reembolsos dependen del caso. En situaciones de fraude o error, pueden aplicarse reversos según políticas internas."
            },
            {
              q: "¿Cómo retiro el dinero de mi campaña?",
              a: "Debes completar la verificación de identidad (KYC) y cumplir con las validaciones de seguridad antes de solicitar retiros."
            },
            {
              q: "¿Cuánto tarda un retiro?",
              a: "Los retiros pueden tardar entre 24 y 72 horas hábiles, dependiendo de validaciones internas."
            },
            {
              q: "¿Por qué me pueden bloquear una cuenta?",
              a: "Por actividad sospechosa, incumplimiento de términos o posibles riesgos de fraude."
            },
            {
              q: "¿Qué datos recopilan?",
              a: "Recopilamos datos como nombre, email, RUT y actividad dentro de la plataforma para operar el servicio y prevenir fraude."
            },
            {
              q: "¿ImpulsaSueños paga impuestos por mí?",
              a: "No. Cada usuario es responsable de declarar los ingresos recibidos según la legislación vigente."
            },
            {
              q: "¿Puedo usar la plataforma para cualquier tipo de campaña?",
              a: "No. Está prohibido el uso para actividades ilegales, fraudes o financiamiento ilícito."
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow border"
            >
              <h2 className="font-semibold mb-2">
                {item.q}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}

        </div>

        {/* AVISO LEGAL */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 p-6 rounded-2xl text-sm text-yellow-800">
          <p className="font-semibold mb-2">
            ⚠️ Importante
          </p>
          <p>
            ImpulsaSueños es una plataforma de intermediación tecnológica.
            Los aportes no constituyen donaciones legales ni generan beneficios tributarios.
            Cada creador de campaña es responsable del uso de los fondos.
          </p>
        </div>

      </div>

    </main>
  )
}