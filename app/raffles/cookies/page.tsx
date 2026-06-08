export default function RafflesCookiesPage() {
  return (
    <section className="bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-12">

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Política de Cookies
          </h1>

          <p className="text-slate-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>

        </div>

        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold mb-3">
              1. ¿Qué son las cookies?
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Las cookies son pequeños archivos almacenados en el dispositivo
              del usuario que permiten recordar preferencias, mejorar la
              navegación y recopilar información estadística sobre el uso de
              la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              2. Cookies esenciales
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Algunas cookies son necesarias para el correcto funcionamiento
              del sitio, incluyendo navegación, seguridad y procesamiento de
              compras.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              3. Cookies analíticas
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Podemos utilizar herramientas analíticas para comprender cómo
              interactúan los usuarios con la plataforma y mejorar la
              experiencia general.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              4. Cookies de rendimiento
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Estas cookies ayudan a optimizar tiempos de carga, estabilidad
              y funcionamiento general del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              5. Administración de cookies
            </h2>

            <p className="text-slate-300 leading-relaxed">
              El usuario puede configurar su navegador para bloquear o
              eliminar cookies. Sin embargo, algunas funcionalidades podrían
              dejar de funcionar correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              6. Modificaciones
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Esta política puede actualizarse periódicamente. Las versiones
              vigentes estarán siempre disponibles dentro de la plataforma.
            </p>
          </section>

        </div>

      </div>

    </section>
  )
}