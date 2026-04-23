export default function PrivacidadPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
        Política de Privacidad
      </h1>

      <p className="text-sm text-gray-500 mb-10">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Datos recolectados
          </h2>

          <p>Podemos recopilar la siguiente información:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Nombre, correo electrónico y RUT</li>
            <li>Información relacionada con pagos</li>
            <li>Datos de uso de la plataforma</li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Finalidad del tratamiento
          </h2>

          <p>Los datos recopilados serán utilizados para:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Operar y mejorar el servicio</li>
            <li>Prevenir fraudes y actividades ilícitas</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. KYC y verificación
          </h2>

          <p>
            ImpulsaSueños podrá solicitar documentos de identidad y validar información 
            mediante terceros para cumplir procesos de verificación (KYC).
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Compartición de datos
          </h2>

          <p>Los datos podrán ser compartidos con:</p>

          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>Pasarelas de pago</li>
            <li>Autoridades competentes cuando sea requerido por ley</li>
            <li>Proveedores tecnológicos necesarios para operar la plataforma</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            5. Seguridad
          </h2>

          <p>
            Se aplican medidas técnicas y organizativas adecuadas para proteger la información 
            personal contra accesos no autorizados, pérdida o alteración.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. Derechos del usuario
          </h2>

          <p>
            El usuario podrá solicitar el acceso, rectificación o eliminación de sus datos 
            personales conforme a la legislación vigente.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            7. Transferencia internacional de datos
          </h2>

          <p>
            Los datos pueden ser almacenados o procesados fuera de Chile, cumpliendo con 
            estándares adecuados de seguridad y protección.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            8. Modificaciones
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