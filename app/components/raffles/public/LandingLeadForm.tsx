"use client"

import { useState } from "react"

export default function LandingLeadForm() {

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState("")

  async function submit(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setLoading(true)

    setMessage("")

    try {

      const res =
        await fetch(
          "/api/raffles/landing-leads",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              email
            })
          }
        )

      const json =
        await res.json()

      if (!res.ok) {

        throw new Error()

      }

      if (json.duplicated) {

        setMessage(
          "Ese correo ya está registrado."
        )

      } else {

        setMessage(
          "✅ ¡Gracias! Te avisaremos antes del lanzamiento."
        )

      }

      setEmail("")

    }

    catch {

      setMessage(
        "Ocurrió un error. Intenta nuevamente."
      )

    }

    finally {

      setLoading(false)

    }

  }

  return (

    <div
      className="
        mt-12
        max-w-xl
        mx-auto
      "
    >

      <div className="text-lg font-semibold">
        Sé de los primeros en enterarte.
      </div>

      <p className="text-slate-400 mt-2 mb-6">
        Déjanos tu correo y te avisaremos apenas el sitio esté disponible.
      </p>

      <form
        onSubmit={submit}
        className="
          flex
          flex-col
          md:flex-row
          gap-3
        "
      >

        <input
          type="email"
          value={email}
          onChange={(e)=>
            setEmail(
              e.target.value
            )
          }
          placeholder="tu@email.com"
          required
          className="
            flex-1
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            px-5
            py-4
            outline-none
          "
        />

        <button
          type="submit"
          disabled={loading}
          className="
            rounded-xl
            bg-white
            text-black
            font-semibold
            px-6
            py-4
            disabled:opacity-50
          "
        >

          {
            loading

            ? "Enviando..."

            : "Quiero ser avisado"
          }

        </button>

      </form>

      {

        message &&

        <div
          className="
            mt-4
            text-sm
            text-cyan-400
          "
        >

          {message}

        </div>

      }

    </div>

  )

}