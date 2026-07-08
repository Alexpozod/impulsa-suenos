"use client";

import { useEffect, useState } from "react";

export default function PublicSitePage() {

  const [settings, setSettings] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    load();

  }, []);

  async function load() {

    try {

      const res =
        await fetch(
          "/api/admin/raffles/public-site"
        );

      const json =
        await res.json();

      setSettings(json);

    }

    catch (error) {

      console.error(error);

    }

    finally {

      setLoading(false);

    }

  }

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

  {loading ? (

    <div className="mt-6 text-slate-500">

      Cargando configuración...

    </div>

  ) : (

    <div className="mt-6 rounded-xl bg-slate-950 p-4">

      <pre className="text-xs overflow-auto">

        {JSON.stringify(
          settings,
          null,
          2
        )}

      </pre>

    </div>

  )}

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