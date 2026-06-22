"use client"

import {
  useState
}
from "react"

import { supabase }
from "@/src/lib/supabase"

function slugify(text: string) {

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function CreateRafflePage() {

  const [loading, setLoading] =
    useState(false)

    const [uploading, setUploading] =
  useState(false)

  const [form, setForm] =
    useState({

      title: "",

      slug: "",

      description: "",

      prize_title: "",

      prize_description: "",

      cover_image: "",

      gallery: [] as string[],
promo_video: "",

      ticket_price: "",

      ticket_prefix: "RAF",

      ticket_min_number: 1,

      ticket_max_number: 999999,

      min_tickets_goal: 1,

      currency: "CLP",

      start_date: "",

      end_date: "",

      draw_date: ""

    })

    const titleValid =
  form.title.trim().length >= 10

const slugValid =
  form.slug.trim().length >= 3

const descriptionValid =
  form.description.trim().length >= 30

const prizeTitleValid =
  form.prize_title.trim().length >= 10

const prizeDescriptionValid =
  form.prize_description.trim().length >= 20

const ticketPriceValid =
  Number(form.ticket_price) > 0

  const ticketRangeValid =
  Number(
    form.ticket_max_number
  ) >
  Number(
    form.ticket_min_number
  )

  const minGoalValid =
  Number(
    form.min_tickets_goal
  ) <=
  (
    Number(
      form.ticket_max_number
    ) -
    Number(
      form.ticket_min_number
    ) +
    1
  )

const datesValid =
  form.start_date &&
  form.end_date &&
  form.draw_date &&
  new Date(form.end_date) >
    new Date(form.start_date) &&
  new Date(form.draw_date) >
    new Date(form.end_date)

const coverImageValid =
  !!form.cover_image

const formValid =
  titleValid &&
  slugValid &&
  descriptionValid &&
  prizeTitleValid &&
  prizeDescriptionValid &&
  ticketPriceValid &&
  ticketRangeValid &&
  minGoalValid &&
  coverImageValid &&
  datesValid

    async function uploadCoverImage(
  file: File
) {

  try {

    setUploading(true)

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
        .from(
          "raffle-media"
        )
        .upload(
          path,
          file
        )

    if (error) {

      console.error(error)

      alert(
        "Error subiendo imagen"
      )

      return
    }

    const {
      data
    } =
      supabase.storage
        .from(
          "raffle-media"
        )
        .getPublicUrl(
          path
        )

    setForm(prev => ({

      ...prev,

      cover_image:
        data.publicUrl

    }))

  } catch (error) {

    console.error(error)

  } finally {

    setUploading(false)

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
        .from(
          "raffle-media"
        )
        .upload(
          path,
          file
        )

    if (error) {

      console.error(error)

      alert(
        "Error subiendo imagen"
      )

      return
    }

    const {
      data
    } =
      supabase.storage
        .from(
          "raffle-media"
        )
        .getPublicUrl(
          path
        )

    setForm(prev => ({

      ...prev,

      gallery: [

        ...prev.gallery,

        data.publicUrl

      ]

    }))

  } catch (error) {

    console.error(error)

  }

}

async function uploadPromoVideo(
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
        .from(
          "raffle-media"
        )
        .upload(
          path,
          file
        )

    if (error) {

      console.error(error)

      alert(
        "Error subiendo video"
      )

      return

    }

    const {
      data
    } =
      supabase.storage
        .from(
          "raffle-media"
        )
        .getPublicUrl(
          path
        )

    setForm(prev => ({

      ...prev,

      promo_video:
        data.publicUrl

    }))

  } catch (error) {

    console.error(error)

  }

}

  async function submit() {

    if (!formValid) {

  alert(
    "Formulario inválido"
  )

  return
}

    try {

      setLoading(true)

      /* =========================
   SESSION
========================= */

const {
  data: { session }
} = await supabase.auth.getSession()

if (!session?.access_token) {

  alert("Sesión inválida")

  return
}

/* =========================
   CREATE
========================= */

console.log(
  "FORM CREATE",
  JSON.stringify(
    form,
    null,
    2
  )
)

const res =
  await fetch(
    "/api/admin/raffles/create",
    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${session.access_token}`

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
          "Error creando sorteo"
        )

        return
      }

      if (json?.ok) {

        alert("Sorteo creado")

        window.location.href =
          "/admin/raffles/manage"
      }

    } catch (error) {

      console.error(error)

      alert("Error inesperado")

    } finally {

      setLoading(false)
    }
  }

  return (

    <div
      className="
        max-w-3xl
        mx-auto
        p-6
        space-y-6
      "
    >

      <div>

  <h1 className="text-3xl font-bold">
    🎟️ Crear Sorteo
  </h1>

  <p className="text-slate-400 mt-2">
    Crea un nuevo sorteo dentro del sistema.
  </p>

</div>

<div
  className="
    bg-blue-950/40
    border
    border-blue-800
    rounded-3xl
    p-5
  "
>

  <p
    className="
      text-blue-300
      font-semibold
    "
  >
    📌 Draft automático
  </p>

  <p
    className="
      text-slate-300
      text-sm
      mt-2
    "
  >
    Todos los sorteos se crean inicialmente en estado Draft.
    Después podrás publicarlos desde Manage cuando estén listos.
  </p>

</div>

      <div className="space-y-4">

        <div>

<div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
  "
>

  <div className="mb-6">

    <h2
      className="
        text-xl
        font-bold
      "
    >
      📝 Datos Generales
    </h2>

    <p
      className="
        text-slate-400
        text-sm
        mt-1
      "
    >
      Información principal del sorteo
    </p>

  </div>

  <div>

  <Input
    label="Título"
    value={form.title}
    onChange={(v: string) =>
      setForm({
        ...form,
        title: v,
        slug: slugify(v)
      })
    }
  />

  {!titleValid && form.title.length > 0 && (

    <p
      className="
        mt-2
        text-sm
        text-red-400
      "
    >
      ⚠ El título debe tener al menos 5 caracteres
    </p>

  )}

</div>

  <div className="mt-2">

    {form.title.length < 10 ? (

      <p
        className="
          text-xs
          text-red-400
        "
      >
        Mínimo 10 caracteres
        ({form.title.length}/10)
      </p>

    ) : (

      <p
        className="
          text-xs
          text-emerald-400
        "
      >
        ✓ Título válido
      </p>

    )}

  </div>

</div>

        <div>

  <Input
    label="Slug"
    value={form.slug}
    onChange={(v: string) =>
      setForm({
        ...form,
        slug: v
      })
    }
  />

  <div
    className="
      mt-2
      rounded-xl
      border
      border-slate-800
      bg-slate-900
      px-3
      py-2
    "
  >

    {!slugValid && form.slug.length > 0 && (

  <p
    className="
      mt-2
      text-sm
      text-red-400
    "
  >
    ⚠ El slug debe tener al menos 3 caracteres
  </p>

)}

    <p
      className="
        text-xs
        text-slate-400
      "
    >
      URL pública
    </p>

    <p
      className="
        text-sm
        text-blue-400
        break-all
      "
    >
      /raffles/{form.slug || "mi-sorteo"}
    </p>

  </div>

</div>

        <div>

  <div>

  <Textarea
    label="Descripción"
    value={form.description}
    onChange={(v: string) =>
      setForm({
        ...form,
        description: v
      })
    }
  />

  <div
    className="
      mt-2
      flex
      items-center
      justify-between
    "
  >

    <div>

      {!descriptionValid &&
        form.description.length > 0 && (

        <p
          className="
            text-sm
            text-red-400
          "
        >
          ⚠ La descripción debe tener al menos 30 caracteres
        </p>

      )}

    </div>

    <p
      className="
        text-xs
        text-slate-500
      "
    >
      {form.description.length} caracteres
    </p>

  </div>

</div>

  </div>

  <div
    className="
      flex
      items-center
      justify-between
      mt-2
    "
  >

    <div>

      {form.description.length < 100 ? (

        <p
          className="
            text-xs
            text-red-400
          "
        >
          Mínimo 100 caracteres
        </p>

      ) : (

        <p
          className="
            text-xs
            text-emerald-400
          "
        >
          ✓ Descripción válida
        </p>

      )}

    </div>
    
  </div>

</div>

        <div>

<div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
  "
>

  <div className="mb-6">

    <h2
      className="
        text-xl
        font-bold
      "
    >
      🏆 Premio
    </h2>

    <p
      className="
        text-slate-400
        text-sm
        mt-1
      "
    >
      Información que verá el participante
    </p>

  </div>

  <Input
    label="Título premio"
    value={form.prize_title}
    onChange={(v: string) =>
      setForm({
        ...form,
        prize_title: v
      })
    }
  />

  <div className="mt-2">

    {form.prize_title.length < 10 ? (

      <p
        className="
          text-xs
          text-red-400
        "
      >
        Mínimo 10 caracteres
        ({form.prize_title.length}/10)
      </p>

    ) : (

      <p
        className="
          text-xs
          text-emerald-400
        "
      >
        ✓ Premio válido
      </p>

    )}

  </div>

</div>

<div>

  <div>

  <Textarea
    label="Descripción premio"
    value={form.prize_description}
    onChange={(v: string) =>
      setForm({
        ...form,
        prize_description: v
      })
    }
  />

  <div
    className="
      mt-2
      flex
      items-center
      justify-between
    "
  >

    <div>

      {!prizeDescriptionValid &&
        form.prize_description.length > 0 && (

        <p
          className="
            text-sm
            text-red-400
          "
        >
          ⚠ La descripción del premio debe tener al menos 20 caracteres
        </p>

      )}

    </div>

    <p
      className="
        text-xs
        text-slate-500
      "
    >
      {form.prize_description.length} caracteres
    </p>

  </div>

</div>

  </div>

  <div
    className="
      flex
      items-center
      justify-between
      mt-2
    "
  >

    <div>

      {form.prize_description.length < 20 ? (

        <p
          className="
            text-xs
            text-red-400
          "
        >
          Mínimo 20 caracteres
        </p>

      ) : (

        <p
          className="
            text-xs
            text-emerald-400
          "
        >
          ✓ Descripción de premio válida
        </p>

      )}

    </div>
    
  </div>

</div>

<div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
  "
>

  <div className="mb-6">

    <h2
      className="
        text-xl
        font-bold
      "
    >
      🎬 Multimedia
    </h2>

    <p
      className="
        text-slate-400
        text-sm
        mt-1
      "
    >
      Imágenes y contenido promocional
    </p>

  </div>

        <div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-5
  "
>

  <label
    className="
      block
      text-sm
      font-medium
      mb-3
    "
  >
    🖼️ Imagen Principal
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={async e => {

      const file =
        e.target.files?.[0]

      if (!file) return

      await uploadCoverImage(
        file
      )

    }}
    className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-950
      p-3
    "
  />

  {uploading && (

    <div
      className="
        mt-4
        text-sm
        text-blue-400
      "
    >
      Subiendo imagen...
    </div>

  )}

  {form.cover_image && (

    <div className="mt-5">

      <img
        src={form.cover_image}
        alt="cover"
        className="
          w-full
          rounded-2xl
          border
          border-slate-700
          max-h-[400px]
          object-cover
        "
      />

      <div
        className="
          mt-3
          text-xs
          text-emerald-400
        "
      >
        ✓ Imagen cargada correctamente
      </div>

    </div>

  )}

  {!coverImageValid && (

  <div
    className="
      mt-3
      text-sm
      text-red-400
    "
  >
    ⚠ Debes cargar una imagen principal
  </div>

)}

  </div>

  <div
  className="
    mt-6
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-5
  "
>

  <label
    className="
      block
      text-sm
      font-medium
      mb-3
    "
  >
    🖼️ Galería del Sorteo
  </label>

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
    className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-950
      p-3
    "
  />

  {form.gallery.length > 0 && (

  <>
  
    <div
      className="
        mt-4
        grid
        grid-cols-3
        gap-3
      "
    >

      {form.gallery.map(
        (
          image,
          index
        ) => (

          <img
            key={index}
            src={image}
            alt=""
            className="
              rounded-2xl
              border
              border-slate-700
              h-36
              w-full
              object-cover
            "
          />

        )
      )}

    </div>

    <div
      className="
        mt-4
        text-xs
        text-slate-400
      "
    >
      {form.gallery.length} imagen(es) cargadas
    </div>

  </>

)}

</div>
  
<div
  className="
    mt-6
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-5
  "
>

  <label
    className="
      block
      text-sm
      font-medium
      mb-3
    "
  >
    🎬 Video Promocional
  </label>

  <input
    type="file"
    accept="video/*"
    onChange={async e => {

      const file =
        e.target.files?.[0]

      if (!file) return

      await uploadPromoVideo(
        file
      )

    }}
    className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-950
      p-3
    "
  />

  {form.promo_video && (

  <div className="mt-5">

    <video
      controls
      className="
        w-full
        rounded-2xl
        border
        border-slate-700
      "
    >
      <source
        src={form.promo_video}
      />
    </video>

    <div
      className="
        mt-3
        text-xs
        text-emerald-400
      "
    >
      ✓ Video cargado correctamente
    </div>

  </div>

)}

</div>

</div>

<div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
  "
>

  <div className="mb-6">

    <h2
      className="
        text-xl
        font-bold
      "
    >
      🎟️ Configuración de Tickets
    </h2>

    <p
      className="
        text-slate-400
        text-sm
        mt-1
      "
    >
      Define precios, numeración y reglas del sorteo
    </p>

  </div>

        <div>

  <Input
    label="Valor ticket"
    type="number"
    value={form.ticket_price}
    onChange={(v: string) =>
      setForm({
        ...form,
        ticket_price: v
      })
    }
  />

  {!ticketPriceValid &&
    form.ticket_price !== "" && (

    <p
      className="
        mt-2
        text-sm
        text-red-400
      "
    >
      ⚠ El valor del ticket debe ser mayor a 0
    </p>

  )}

</div>

        <Input
          label="Prefijo tickets"
          value={form.ticket_prefix}
          onChange={(v: string) =>
            setForm({
              ...form,
              ticket_prefix: v
            })
          }
        />

        <Input
          label="Número mínimo"
          type="number"
          value={
            String(
              form.ticket_min_number
            )
          }
          onChange={(v: string) =>
            setForm({
              ...form,
              ticket_min_number:
                Number(v)
            })
          }
        />

        <Input
  label="Número máximo"
  type="number"
  value={
    String(
      form.ticket_max_number
    )
  }
  onChange={(v: string) =>
    setForm({
      ...form,
      ticket_max_number:
        Number(v)
    })
  }
/>

{!ticketRangeValid && (

  <p
    className="
      mt-2
      text-sm
      text-red-400
    "
  >
    ⚠ El número máximo debe ser mayor que el mínimo
  </p>

)}

        <Input
  label="Mínimo tickets para sortear"
  type="number"
  value={
    String(
      form.min_tickets_goal
    )
  }
  onChange={(v: string) =>
    setForm({
      ...form,
      min_tickets_goal:
        Number(v)
    })
  }
/>

{!minGoalValid && (

  <p
    className="
      mt-2
      text-sm
      text-red-400
    "
  >
    ⚠ El objetivo mínimo supera la cantidad disponible de tickets
  </p>

)}

        </div>

<div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
  "
>

  <div className="mb-6">

    <h2
      className="
        text-xl
        font-bold
      "
    >
      📅 Fechas y Programación
    </h2>

    <p
      className="
        text-slate-400
        text-sm
        mt-1
      "
    >
      Configuración temporal del sorteo
    </p>

  </div>

 <div
  className="
    grid
    grid-cols-1
    md:grid-cols-3
    gap-4
  "
>

<Input
  label="Fecha Inicio"
  type="datetime-local"
  value={form.start_date}
  onChange={(v:string) =>
    setForm({
      ...form,
      start_date: v
    })
  }
/>

<Input
  label="Fecha Cierre"
  type="datetime-local"
  value={form.end_date}
  onChange={(v:string) =>
    setForm({
      ...form,
      end_date: v
    })
  }
/>

<Input
  label="Fecha Sorteo"
  type="datetime-local"
  value={form.draw_date}
  onChange={(v:string) =>
    setForm({
      ...form,
      draw_date: v
    })
  }
/>

  </div>

</div>

{!datesValid &&
  form.start_date &&
  form.end_date &&
  form.draw_date && (

  <div
    className="
      mt-4
      rounded-2xl
      border
      border-red-800
      bg-red-950/30
      p-4
    "
  >

    <p
      className="
        text-red-400
        text-sm
      "
    >
      ⚠ La fecha de cierre debe ser posterior al inicio y la fecha del sorteo debe ser posterior al cierre.
    </p>

  </div>

)}

{formValid ? (

  <div
    className="
      rounded-2xl
      border
      border-emerald-800
      bg-emerald-950/30
      p-4
    "
  >

    <p
      className="
        text-emerald-400
        text-sm
      "
    >
      ✓ Sorteo listo para ser creado
    </p>

  </div>

) : (

  <div
    className="
      rounded-2xl
      border
      border-amber-800
      bg-amber-950/30
      p-4
    "
  >

    <p
      className="
        text-amber-400
        text-sm
      "
    >
      Completa todos los campos requeridos para continuar.
    </p>

  </div>

)}

        <button
  onClick={submit}
  disabled={
    loading ||
    !formValid
  }
          className="
w-full
bg-blue-600
hover:bg-blue-500
disabled:bg-slate-700
disabled:cursor-not-allowed
disabled:opacity-60
transition
py-4
rounded-2xl
font-semibold
text-lg
shadow-lg
shadow-blue-900/30
"
        >

          {loading
            ? "Creando..."
            : "Crear Sorteo"}

        </button>

      </div>

    </div>
  )
}

function Input({

  label,
  value,
  onChange,
  type = "text"

}: any) {

  return (

    <div className="space-y-2">

      <p className="text-sm font-medium">
        {label}
      </p>

      <input
        type={type}
        value={value}
        onChange={(e) =>
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

}: any) {

  return (

    <div className="space-y-2">

      <p className="text-sm font-medium">
        {label}
      </p>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        rows={5}
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