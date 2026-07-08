export default function PublicSitePage() {

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          🌐 Sitio Público
        </h1>

        <p className="text-slate-400 mt-2">
          Administra la página pública de Sorteos sin afectar el sistema de Campañas.
        </p>

      </div>

      <div
        className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-8
        "
      >

        <h2 className="text-xl font-semibold">
          Próximamente
        </h2>

        <p className="text-slate-400 mt-3">
          Aquí podrás controlar la landing pública, el modo lanzamiento,
          mantenimiento, próximo sorteo y otras experiencias para los visitantes.
        </p>

      </div>

    </div>

  )

}