export default function RafflesPrivacyPage() {
  return (
    <section className="bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-12">

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Política de Privacidad
          </h1>

          <p className="text-slate-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>

        </div>

        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold mb-3">
              1. Información recopilada
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Podemos recopilar información proporcionada durante el proceso
              de compra, participación, contacto o navegación dentro de la
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              2. Datos que podemos solicitar
            </h2>

            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Nombre.</li>
              <li>Correo electrónico.</li>
              <li>Teléfono.</li>
              <li>País de residencia.</li>
              <li>Información necesaria para entregar premios.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              3. Finalidad del tratamiento
            </h2>

            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Procesar compras.</li>
              <li>Asignar participaciones.</li>
              <li>Enviar tickets digitales.</li>
              <li>Contactar ganadores.</li>
              <li>Prevenir fraude.</li>
              <li>Mejorar la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              4. Seguridad
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Aplicamos medidas razonables de seguridad para proteger la
              información almacenada contra accesos no autorizados,
              modificaciones o divulgaciones indebidas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              5. Compartición de información
            </h2>

            <p className="text-slate-300 leading-relaxed">
              La información podrá compartirse únicamente con proveedores
              tecnológicos, procesadores de pago, autoridades competentes o
              terceros necesarios para la operación legítima de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              6. Participación internacional
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Debido a la naturaleza global de internet, algunos datos podrán
              ser procesados o almacenados fuera del país de residencia del
              participante utilizando proveedores tecnológicos internacionales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              7. Derechos del usuario
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Los usuarios podrán solicitar acceso, corrección o actualización
              de la información personal que hayan proporcionado, sujeto a las
              limitaciones legales aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              8. Modificaciones
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Esta política podrá actualizarse periódicamente. Las nuevas
              versiones serán publicadas dentro de la plataforma.
            </p>
          </section>

        </div>

      </div>

    </section>
  )
}