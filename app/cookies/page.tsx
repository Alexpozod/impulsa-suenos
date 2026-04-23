export default function CookiesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
        Política de Cookies
      </h1>

      <p className="text-sm text-gray-500 mb-10">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Uso de cookies
          </h2>
          <p>
            ImpulsaSueños utiliza cookies y tecnologías similares para mejorar la experiencia 
            del usuario, optimizar el funcionamiento de la plataforma y analizar el uso del servicio.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Tipos de cookies utilizadas
          </h2>

          <p>Utilizamos los siguientes tipos de cookies:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>
              <strong>Cookies esenciales:</strong> necesarias para el funcionamiento básico de la plataforma.
            </li>
            <li>
              <strong>Cookies de rendimiento:</strong> permiten mejorar el rendimiento y funcionamiento del sitio.
            </li>
            <li>
              <strong>Cookies de análisis:</strong> ayudan a entender cómo los usuarios interactúan con la plataforma.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. Gestión de cookies
          </h2>
          <p>
            El usuario puede configurar su navegador para rechazar o eliminar cookies. 
            Sin embargo, esto podría afectar el correcto funcionamiento de algunas funcionalidades del sitio.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Cambios en la política
          </h2>
          <p>
            ImpulsaSueños se reserva el derecho de modificar esta política en cualquier momento. 
            Los cambios serán publicados en esta misma página.
          </p>
        </section>

      </div>

    </main>
  )
}