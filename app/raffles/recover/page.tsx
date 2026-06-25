'use client'

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function RafflesRecoverPage() {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const recover = async () => {

    setLoading(true)
    setMessage("")

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${location.origin}/update-password`
        }
      )

    if (error) {

      setMessage("❌ " + error.message)

    } else {

      setMessage(
        "📩 Revisa tu correo para continuar."
      )

    }

    setLoading(false)

  }

  return (

    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 pt-28">

      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          p-8
          shadow-2xl
        "
      >

        <h1 className="text-3xl font-black text-center text-white mb-2">

          Recuperar contraseña

        </h1>

        <p className="text-center text-slate-400 mb-8">

          Ingresa el correo asociado a tu cuenta.

        </p>

        <input

          type="email"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

          placeholder="Correo electrónico"

          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            p-3
            text-white
            placeholder:text-slate-400
            outline-none
            focus:border-cyan-500
            mb-6
          "

        />

        <button

          onClick={recover}

          disabled={loading}

          className="
            w-full
            rounded-xl
            bg-cyan-500
            hover:bg-cyan-400
            transition
            py-3
            font-bold
            text-slate-950
            disabled:opacity-60
          "

        >

          {

            loading

            ? "Enviando..."

            : "Enviar enlace"

          }

        </button>

        <button

          onClick={()=>window.location.href="/raffles/login"}

          className="
            w-full
            mt-4
            text-slate-400
            hover:text-white
          "

        >

          Volver al inicio de sesión

        </button>

        {

          message && (

            <p className="mt-6 text-center text-sm text-red-400">

              {message}

            </p>

          )

        }

      </div>

    </main>

  )

}