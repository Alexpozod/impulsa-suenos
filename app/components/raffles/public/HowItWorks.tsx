export default function HowItWorks() {

  return (

    <section className="py-24 bg-slate-900/30">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <h2 className="text-4xl font-black text-white mb-4">
            ¿Cómo funciona?
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Participar toma menos de un minuto y recibirás tus tickets automáticamente.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-5xl mb-6">
              🎟️
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">
              Compra tus tickets
            </h3>

            <p className="text-slate-400">
              Selecciona la cantidad de tickets y realiza tu pago de forma segura.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-5xl mb-6">
              📧
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">
              Recíbelos por correo
            </h3>

            <p className="text-slate-400">
              Tus tickets son asignados automáticamente y enviados a tu email.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-5xl mb-6">
              🏆
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">
              Revisa los resultados
            </h3>

            <p className="text-slate-400">
              Publicamos resultados, ganadores y evidencias de forma transparente.
            </p>

          </div>

        </div>

      </div>

    </section>

  )
}