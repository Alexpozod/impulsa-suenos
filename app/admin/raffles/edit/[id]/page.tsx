"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { supabase } from "@/src/lib/supabase"

export default function EditRafflePage() {

  const params = useParams()
  const router = useRouter()

  const raffleId =
    params?.id as string

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [form, setForm] =
    useState<any>(null)

  useEffect(() => {

    if (raffleId) {
      loadRaffle()
    }

  }, [raffleId])

  async function loadRaffle() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          `/api/admin/raffles/${raffleId}`,
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      if (!json?.raffle) {

        alert("No se encontró el sorteo")

        return
      }

      setForm({

        title:
          json.raffle.title || "",

        slug:
          json.raffle.slug || "",

        description:
          json.raffle.description || "",

        prize_title:
          json.raffle.prize_title || "",

        prize_description:
          json.raffle.prize_description || "",

        cover_image:
          json.raffle.cover_image || "",

        gallery:
          json.raffle.gallery || [],

        promo_video:
          json.raffle.promo_video || "",

        ticket_price:
          json.raffle.ticket_price ||
          json.raffle.ticket_price_clp ||
          "",

        ticket_prefix:
          json.raffle.ticket_prefix || "RAF",

        ticket_min_number:
          json.raffle.ticket_min_number || 1,

        ticket_max_number:
          json.raffle.ticket_max_number || 999999,

        min_tickets_goal:
          json.raffle.min_tickets_goal || 1,

        start_date:
          json.raffle.start_date
            ?.slice(0,16) || "",

        end_date:
          json.raffle.end_date
            ?.slice(0,16) || "",

        draw_date:
  json.raffle.draw_date
    ?.slice(0,16) || "",

legal_terms:
  json.raffle.legal_terms || "",

rules:
  json.raffle.rules || ""

      })

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  async function uploadGalleryImage(
  file: File
) {

  try {

    const extension =
      file.name
        .split(".")
        .pop()

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`

    const path =
      `raffles/${fileName}`

    const {
      error
    } =
      await supabase.storage
        .from("raffle-media")
        .upload(
          path,
          file
        )

    if (error) {

      alert(
        "Error subiendo imagen"
      )

      return
    }

    const { data } =
      supabase.storage
        .from("raffle-media")
        .getPublicUrl(path)

    setForm((prev:any)=>({

      ...prev,

      gallery: [

        ...(prev.gallery || []),

        data.publicUrl

      ]

    }))

  } catch (error) {

    console.error(error)

  }

}

<div>

  <input

    type="file"

    accept="image/*"

    multiple

    onChange={async e => {

      const files =
        Array.from(
          e.target.files || []
        )

      for (const file of files) {

        await uploadGalleryImage(
          file
        )

      }

    }}

  />

</div>

  async function save() {

    try {

      setSaving(true)

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          `/api/admin/raffles/${raffleId}/update`,
          {

            method: "PUT",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session?.access_token}`

            },

            body:
              JSON.stringify(form)

          }
        )

      const json =
        await res.json()

      if (!res.ok) {

        alert(
          json?.error ||
          "Error actualizando"
        )

        return
      }

      alert(
        "Sorteo actualizado"
      )

      router.push(
        "/admin/raffles/manage"
      )

    } catch (error) {

      console.error(error)

      alert(
        "Error inesperado"
      )

    } finally {

      setSaving(false)

    }

  }

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    )

  }

  if (!form) {

    return (
      <div className="p-6">
        Sorteo no encontrado
      </div>
    )

  }

  return (

    <div
      className="
        max-w-4xl
        mx-auto
        p-6
        space-y-4
      "
    >

      <h1
        className="
          text-3xl
          font-bold
        "
      >
        Editar Sorteo
      </h1>

      <Input
        label="Título"
        value={form.title}
        onChange={(v:string)=>
          setForm({
            ...form,
            title:v
          })
        }
      />

      <Input
        label="Slug"
        value={form.slug}
        onChange={(v:string)=>
          setForm({
            ...form,
            slug:v
          })
        }
      />

      <Textarea
        label="Descripción"
        value={form.description}
        onChange={(v:string)=>
          setForm({
            ...form,
            description:v
          })
        }
      />

      <Input
        label="Premio"
        value={form.prize_title}
        onChange={(v:string)=>
          setForm({
            ...form,
            prize_title:v
          })
        }
      />

      <Textarea
        label="Descripción Premio"
        value={form.prize_description}
        onChange={(v:string)=>
          setForm({
            ...form,
            prize_description:v
          })
        }
      />

<Textarea
  label="Bases Legales"
  value={form.legal_terms}
  onChange={(v:string)=>
    setForm({
      ...form,
      legal_terms:v
    })
  }
/>

<Textarea
  label="Reglas"
  value={form.rules}
  onChange={(v:string)=>
    setForm({
      ...form,
      rules:v
    })
  }
/>

<div className="space-y-4">

  <p className="font-semibold">
    Galería
  </p>

  {form.gallery?.length > 0 && (

    <div
      className="
        grid
        grid-cols-3
        gap-4
      "
    >

      {form.gallery.map(
        (
          image:string,
          index:number
        ) => (

          <div
            key={index}
            className="space-y-2"
          >

            <img
              src={image}
              alt=""
              className="
                w-full
                h-32
                object-cover
                rounded-xl
                border
              "
            />

            <button
              type="button"
              onClick={() => {

                setForm({

                  ...form,

                  gallery:
                    form.gallery.filter(
                      (_:any,i:number)=>
                        i !== index
                    )

                })

              }}
              className="
                w-full
                bg-red-600
                text-white
                py-2
                rounded-xl
              "
            >
              Eliminar Imagen
            </button>

          </div>

        )
      )}

    </div>

  )}

</div>

      <Input
        label="Valor Ticket"
        type="number"
        value={form.ticket_price}
        onChange={(v:string)=>
          setForm({
            ...form,
            ticket_price:v
          })
        }
      />

      <Input
        label="Fecha Inicio"
        type="datetime-local"
        value={form.start_date}
        onChange={(v:string)=>
          setForm({
            ...form,
            start_date:v
          })
        }
      />

      <Input
        label="Fecha Cierre"
        type="datetime-local"
        value={form.end_date}
        onChange={(v:string)=>
          setForm({
            ...form,
            end_date:v
          })
        }
      />

      <Input
        label="Fecha Sorteo"
        type="datetime-local"
        value={form.draw_date}
        onChange={(v:string)=>
          setForm({
            ...form,
            draw_date:v
          })
        }
      />

      <button
        onClick={save}
        disabled={saving}
        className="
          bg-blue-600
          text-white
          px-6
          py-3
          rounded-xl
        "
      >
        {saving
          ? "Guardando..."
          : "Guardar Cambios"}
      </button>

    </div>

  )

}

function Input({
  label,
  value,
  onChange,
  type="text"
}:any) {

  return (

    <div>

      <p className="mb-2">
        {label}
      </p>

      <input
        type={type}
        value={value}
        onChange={(e)=>
          onChange(
            e.target.value
          )
        }
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
        "
      />

    </div>

  )

}

function Textarea({
  label,
  value,
  onChange
}:any) {

  return (

    <div>

      <p className="mb-2">
        {label}
      </p>

      <textarea
        rows={5}
        value={value}
        onChange={(e)=>
          onChange(
            e.target.value
          )
        }
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
        "
      />

    </div>

  )

}