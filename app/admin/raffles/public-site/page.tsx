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

      <div className="mt-4 space-y-4">

  <div className="flex items-center justify-between">

    <span className="font-medium">
      Modo del sitio
    </span>

    <span
      className={`
        px-3
        py-1
        rounded-full
        text-sm
        font-semibold

        ${
          settings?.site_mode === "active"

            ? "bg-emerald-600 text-white"

            : "bg-amber-500 text-black"

        }
      `}
    >

      {

        settings?.site_mode === "active"

        ? "Sitio Activo"

        : "Landing Especial"

      }

    </span>

  </div>

  <div>

    <div className="text-sm text-slate-400">

      Título

    </div>

    <div className="mt-1 font-semibold">

      {settings?.title || "-"}

    </div>

  </div>

  <div>

    <div className="text-sm text-slate-400">

      Subtítulo

    </div>

    <div className="mt-1">

      {settings?.subtitle || "-"}

    </div>

  </div>

</div>

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