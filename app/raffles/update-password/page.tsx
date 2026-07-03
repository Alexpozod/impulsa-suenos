'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import PasswordInput from "@/app/components/ui/PasswordInput"

export default function RafflesUpdatePasswordPage() {

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const validatePassword = (pass: string) => {

    if (pass.length < 8)
      return "Mínimo 8 caracteres"

    if (!/[A-Z]/.test(pass))
      return "Debe tener al menos una mayúscula"

    if (!/[0-9]/.test(pass))
      return "Debe tener al menos un número"

    return null
  }

  const updatePassword = async () => {

    setMessage("")

    if (!password) {
      setMessage("⚠️ Ingresa una contraseña")
      return
    }

    if (password !== confirm) {
      setMessage("⚠️ Las contraseñas no coinciden")
      return
    }

    const validation = validatePassword(password)

    if (validation) {
      setMessage("⚠️ " + validation)
      return
    }

    try {

      setLoading(true)

      const { error } =
        await supabase.auth.updateUser({
          password
        })

      if (error) {

        setMessage("❌ " + error.message)
        return

      }

      setMessage("✅ Contraseña actualizada correctamente")

      setTimeout(() => {

        window.location.href =
          "/raffles/login"

      }, 1500)

    } catch (err) {

      console.error(err)

      setMessage(
        "❌ Error inesperado"
      )

    } finally {

      setLoading(false)

    }

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
          Nueva contraseña
        </h1>

        <p className="text-center text-slate-400 mb-8">
          Crea una nueva contraseña para tu cuenta.
        </p>

        <PasswordInput
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
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
            mb-4
          "
        />

        <PasswordInput
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
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
            mb-4
          "
        />

        <p className="text-xs text-slate-500 mb-6">
          Debe tener al menos 8 caracteres, una mayúscula y un número.
        </p>

        <button
          onClick={updatePassword}
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
              ? "Actualizando..."
              : "Actualizar contraseña"
          }

        </button>

        {message && (

          <p
            className={`
              mt-6
              text-center
              text-sm
              ${
                message.startsWith("✅")
                  ? "text-green-400"
                  : "text-red-400"
              }
            `}
          >

            {message}

          </p>

        )}

      </div>

    </main>

  )

}