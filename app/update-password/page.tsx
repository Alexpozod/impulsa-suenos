'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function UpdatePasswordPage() {

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  /* =========================
     🔐 VALIDACIÓN PRO
  ========================= */
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Mínimo 8 caracteres"
    if (!/[A-Z]/.test(pass)) return "Debe tener al menos 1 mayúscula"
    if (!/[0-9]/.test(pass)) return "Debe tener al menos 1 número"
    return null
  }

  /* =========================
     🚀 UPDATE PASSWORD
  ========================= */
  const updatePassword = async () => {

    setMessage('')

    if (!password) {
      setMessage("⚠️ Ingresa una contraseña")
      return
    }

    if (password !== confirm) {
      setMessage("⚠️ Las contraseñas no coinciden")
      return
    }

    const validationError = validatePassword(password)

    if (validationError) {
      setMessage("⚠️ " + validationError)
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        setMessage("❌ " + error.message)
        return
      }

      setMessage("✅ Contraseña actualizada correctamente")

      // 🔥 REDIRECCIÓN PRO
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)

    } catch (err) {
      console.error(err)
      setMessage("❌ Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-2 text-center">
          🔐 Nueva contraseña
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Crea una contraseña segura para tu cuenta
        </p>

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        />

        {/* CONFIRM */}
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        />

        {/* HELP TEXT */}
        <p className="text-xs text-gray-400 mb-4">
          Debe tener al menos 8 caracteres, una mayúscula y un número.
        </p>

        {/* BUTTON */}
        <button
          onClick={updatePassword}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className={`mt-4 text-center text-sm ${
            message.includes("✅") ? "text-green-600" : "text-red-500"
          }`}>
            {message}
          </p>
        )}

      </div>

    </main>
  )
}