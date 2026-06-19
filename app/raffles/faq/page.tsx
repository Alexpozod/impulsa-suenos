export default function RafflesFAQPage() {

  const faqs = [
    {
      q: "¿Qué es ImpulsaSueños Sorteos?",
      a: "ImpulsaSueños Sorteos es una plataforma digital donde los usuarios pueden adquirir productos digitales y obtener participaciones promocionales asociadas a iniciativas y sorteos publicados dentro de la plataforma."
    },
    {
      q: "¿Qué estoy comprando?",
      a: "Estás adquiriendo un producto digital. Dependiendo de la promoción vigente, tu compra puede incluir una o más participaciones asociadas a un sorteo o iniciativa publicada en la plataforma."
    },
    {
      q: "¿Cómo obtengo mis participaciones?",
      a: "Las participaciones son asignadas automáticamente una vez que el pago es confirmado correctamente. El detalle queda registrado dentro de nuestros sistemas."
    },
    {
      q: "¿Dónde puedo ver mis participaciones?",
      a: "Puedes consultar todas tus participaciones utilizando el mismo correo electrónico registrado durante la compra desde la sección 'Mis Participaciones'."
    },
    {
      q: "¿Recibiré una confirmación de mi compra?",
      a: "Sí. Una vez confirmado el pago recibirás una notificación con el detalle de tu compra y de las participaciones asociadas cuando corresponda."
    },
    {
      q: "¿Cómo se elige al ganador?",
      a: "Dependiendo de la iniciativa, la selección podrá realizarse mediante algoritmos aleatorios, plataformas externas, procesos certificados, mecanismos notariales u otros sistemas previamente informados en las bases correspondientes."
    },
    {
      q: "¿Dónde se publican los resultados?",
      a: "Los resultados podrán publicarse en la sección de Ganadores de la plataforma, en los canales oficiales de comunicación y en cualquier otro medio informado por la organización."
    },
    {
      q: "¿Los resultados son públicos?",
      a: "Sí. Cuando corresponda, los resultados, ganadores y evidencias de entrega podrán ser publicados con fines de transparencia, respetando la normativa aplicable."
    },
    {
      q: "¿Puedo participar desde otro país?",
      a: "Sí. La plataforma puede aceptar participantes internacionales, salvo restricciones específicas indicadas en determinadas promociones o exigidas por la normativa aplicable."
    },
    {
      q: "¿La compra garantiza ganar?",
      a: "No. La adquisición de un producto digital y las participaciones asociadas no garantizan la obtención de premios ni beneficios específicos."
    },
    {
      q: "¿Los productos digitales tienen devolución?",
      a: "No. Debido a la naturaleza digital de los productos comercializados, las compras son finales y no contemplan cambios, devoluciones ni reembolsos, salvo obligación legal expresa."
    },
    {
      q: "¿Qué ocurre si una iniciativa cambia de fecha?",
      a: "La organización podrá modificar fechas, plazos o cronogramas cuando existan razones técnicas, operativas, comerciales, regulatorias o de fuerza mayor."
    },
    {
      q: "¿Qué ocurre si no se alcanza la participación esperada?",
      a: "Las condiciones aplicables a cada iniciativa estarán definidas en sus respectivas bases y podrán contemplar ajustes, reprogramaciones o mecanismos alternativos previamente informados."
    },
    {
      q: "¿Cómo me contactarán si resulto ganador?",
      a: "La organización utilizará los datos de contacto proporcionados durante la compra para informar cualquier resultado relevante o condición asociada a la entrega del premio."
    },
    {
      q: "¿Qué ocurre si no respondo al contacto de la organización?",
      a: "Los plazos, requisitos y procedimientos para reclamar premios estarán definidos en las bases aplicables a cada iniciativa. El incumplimiento de dichos requisitos podrá generar la pérdida del derecho al premio."
    },
    {
      q: "¿Qué ocurre si el premio no puede ser entregado físicamente?",
      a: "Cuando existan limitaciones logísticas, geográficas, regulatorias o de cualquier otra naturaleza, la organización podrá aplicar las alternativas contempladas en las bases específicas de la iniciativa."
    },
    {
      q: "¿Dónde puedo revisar las bases de cada iniciativa?",
      a: "Cada iniciativa podrá contar con sus propias bases, condiciones, requisitos, fechas y mecanismos de selección. Estas estarán disponibles en la publicación correspondiente cuando aplique."
    },
    {
      q: "¿Cómo sé que mis participaciones quedaron registradas?",
      a: "Una vez confirmada la compra, las participaciones quedan registradas dentro de la plataforma y pueden ser consultadas posteriormente utilizando el correo electrónico asociado a la operación."
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
            Resolvemos las dudas más comunes relacionadas con compras,
            participaciones, sorteos, resultados, premios y funcionamiento
            general de la plataforma.
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

        <div
          className="
            mt-12
            rounded-2xl
            border
            border-cyan-500/30
            bg-cyan-500/10
            p-6
          "
        >

          <h3 className="font-bold text-lg mb-3">
            ¿No encontraste tu respuesta?
          </h3>

          <p className="text-slate-300 leading-relaxed">
            Te recomendamos revisar nuestros Términos y Condiciones,
            Bases Generales o contactarnos mediante los canales oficiales
            publicados en la plataforma.
          </p>

        </div>

      </div>

    </section>
  )
}