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

  const [form, setForm] =
    useState({

      title: "",

      slug: "",

      description: "",

      prize_title: "",

      prize_description: "",

      cover_image: "",

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

  async function submit() {

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

      </div>

      <div className="space-y-4">

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

        <Input
          label="Imagen URL"
          value={form.cover_image}
          onChange={(v: string) =>
            setForm({
              ...form,
              cover_image: v
            })
          }
        />

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

        <button
          onClick={submit}
          disabled={loading}
          className="
            bg-black
            text-white
            px-6
            py-4
            rounded-xl
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