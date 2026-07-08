export default function PublicSitePage() {

  return (

    <div className="space-y-8">

  <div>

    <h1 className="text-3xl font-bold">
      🌐 Sitio Público
    </h1>

    <p className="text-slate-400 mt-2">
      Administra la experiencia pública de Sorteos.
    </p>

  </div>

  <div className="grid gap-6">

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-semibold">
        Estado del Sitio
      </h2>

      <p className="text-slate-400 mt-2">
        Controla cuándo mostrar el sitio normal o una landing especial.
      </p>

    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-semibold">
        Contenido
      </h2>

      <p className="text-slate-400 mt-2">
        Personaliza títulos, descripciones y botones.
      </p>

    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-semibold">
        Opciones
      </h2>

      <p className="text-slate-400 mt-2">
        Activa contador, formulario, redes sociales y otros elementos.
      </p>

    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-semibold">
        Captación de Leads
      </h2>

      <p className="text-slate-400 mt-2">
        Administra los registros de personas interesadas antes del lanzamiento.
      </p>

    </div>

  </div>

</div>

  )

}