"use client";

import { useEffect, useState } from "react";

export default function PublicSitePage() {

  const [settings, setSettings] =
    useState<any>(null);

    const [form, setForm] =
  useState<any>(null);

  const [loading, setLoading] =
    useState(true);

    const [saving, setSaving] =
  useState(false);

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

      setForm(json);

    }

    catch (error) {

      console.error(error);

    }

    finally {

      setLoading(false);

    }

  }

  async function save() {

  try {

    setSaving(true);

    const res =
      await fetch(
        "/api/admin/raffles/public-site",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(form)
        }
      );

    if (!res.ok) {

      throw new Error();

    }

    alert(
      "Configuración guardada."
    );

    setSettings(form);

  }

  catch {

    alert(
      "No fue posible guardar."
    );

  }

  finally {

    setSaving(false);

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

  <div className="pt-2">

  <button

    onClick={save}

    disabled={saving}

    className="
      px-5
      py-3
      rounded-xl
      bg-cyan-600
      hover:bg-cyan-500
      disabled:opacity-50
      font-semibold
    "

  >

    {

      saving

      ? "Guardando..."

      : "Guardar cambios"

    }

  </button>

</div>

</div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

  <h2 className="text-xl font-semibold">
    Contenido
  </h2>

  <p className="text-slate-400 mt-2">
    Personaliza los textos visibles en la landing pública.
  </p>

  {loading ? (

    <div className="mt-6 text-slate-500">

      Cargando...

    </div>

  ) : (

    <div className="mt-6 space-y-5">

      <div>

        <label className="block text-sm mb-2">
          Título
        </label>

        <input
          value={form?.title ?? ""}
            onChange={(e)=>
            setForm({
                ...form,
                title:e.target.value
            })
            }          
          className="
            w-full
            rounded-xl
            bg-slate-950
            border
            border-slate-700
            px-4
            py-3
          "
        />

      </div>

      <div>

        <label className="block text-sm mb-2">
          Subtítulo
        </label>

        <input
          value={form?.subtitle ?? ""}
            onChange={(e)=>
            setForm({
                ...form,
                subtitle:e.target.value
            })
            }
          className="
            w-full
            rounded-xl
            bg-slate-950
            border
            border-slate-700
            px-4
            py-3
          "
        />

      </div>

      <div>

        <label className="block text-sm mb-2">
          Descripción
        </label>

        <textarea
          value={form?.description ?? ""}
            onChange={(e)=>
            setForm({
                ...form,
                description:e.target.value
            })
            }          
          rows={4}
          className="
            w-full
            rounded-xl
            bg-slate-950
            border
            border-slate-700
            px-4
            py-3
          "
        />

      </div>

    </div>

  )}

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