export default function RafflesFAQPage() {
  const faqs = [
    {
      q: "¿Qué es ImpulsaSueños Sorteos?",
      a: "ImpulsaSueños Sorteos es una plataforma digital donde los usuarios pueden adquirir productos digitales y obtener participaciones promocionales asociadas a sorteos publicados dentro de la plataforma."
    },
    {
      q: "¿Qué estoy comprando?",
      a: "Estás adquiriendo un producto digital. Dependiendo de la promoción vigente, tu compra puede incluir una o más participaciones asociadas a un sorteo."
    },
    {
      q: "¿Cómo obtengo mis participaciones?",
      a: "Las participaciones son asignadas automáticamente una vez que el pago es confirmado correctamente."
    },
    {
      q: "¿Dónde recibo mis tickets?",
      a: "Los tickets son enviados automáticamente al correo electrónico registrado durante la compra."
    },
    {
      q: "¿Puedo consultar mis tickets después?",
      a: "Sí. Puedes consultar tus tickets en cualquier momento desde la sección 'Mis Tickets' utilizando el correo electrónico registrado en tu compra."
    },
    {
      q: "¿Cómo se elige al ganador?",
      a: "Dependiendo del sorteo, la selección podrá realizarse mediante algoritmos aleatorios, plataformas externas, procesos certificados, mecanismos notariales u otros sistemas previamente informados."
    },
    {
      q: "¿Dónde se publican los resultados?",
      a: "Los resultados podrán publicarse en la sección Ganadores de la plataforma, en redes sociales oficiales y mediante otros canales de comunicación habilitados."
    },
    {
      q: "¿Puedo participar desde otro país?",
      a: "Sí. La plataforma puede aceptar participantes internacionales, salvo restricciones específicas informadas en determinadas promociones."
    },
    {
      q: "¿Los productos digitales tienen devolución?",
      a: "No. Debido a la naturaleza digital de los productos comercializados, todas las compras son finales y no existen cambios, devoluciones ni reembolsos."
    },
    {
      q: "¿La compra garantiza ganar?",
      a: "No. La adquisición de un producto digital y sus participaciones asociadas no garantiza la obtención de premios."
    },
    {
      q: "¿Qué ocurre si un sorteo es reprogramado?",
      a: "La organización podrá modificar fechas o cronogramas cuando existan razones técnicas, operativas, comerciales o de fuerza mayor."
    },
    {
      q: "¿Qué ocurre si no se alcanza la participación mínima requerida?",
      a: "Las condiciones aplicables serán informadas en cada promoción y podrán incluir modificaciones previamente establecidas para ese sorteo."
    },
    {
      q: "¿Cómo me contactan si gano?",
      a: "La organización contactará al ganador utilizando el correo electrónico registrado durante la compra."
    },
    {
      q: "¿Qué ocurre si no respondo al aviso de ganador?",
      a: "El ganador dispondrá de 15 días corridos para responder. Si no existe respuesta dentro del plazo establecido, podrá realizarse un nuevo sorteo extraordinario entre los participantes válidos."
    },
    {
      q: "¿Qué ocurre si gano un premio físico y vivo en otro país?",
      a: "Cuando un premio físico no pueda ser entregado razonablemente en el país de residencia del ganador, la organización podrá sustituir dicho premio por una compensación económica equivalente de hasta un 60% del valor referencial del premio expresado en dólares estadounidenses."
    }
  ]

  return (
    <section className="bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-12">

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Preguntas Frecuentes
          </h1>

          <p className="text-slate-400 text-lg max-w-3xl">
            Resolvemos las dudas más comunes relacionadas con la compra de
            productos digitales, participaciones, sorteos, ganadores y
            funcionamiento general de la plataforma.
          </p>

        </div>

        <div className="space-y-6">

          {faqs.map((faq, index) => (

            <div
              key={index}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >

              <h2 className="text-lg font-bold mb-3">
                {faq.q}
              </h2>

              <p className="text-slate-300 leading-relaxed">
                {faq.a}
              </p>

            </div>

          ))}

        </div>

        <div className="mt-12 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">

          <h3 className="font-bold text-lg mb-3">
            ¿No encontraste tu respuesta?
          </h3>

          <p className="text-slate-300 leading-relaxed">
            Te recomendamos revisar nuestros Términos y Condiciones o
            contactarnos mediante los canales oficiales publicados en la
            plataforma.
          </p>

        </div>

      </div>

    </section>
  )
}