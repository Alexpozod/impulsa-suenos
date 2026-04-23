'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function RecoverPage() {

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecover = async () => {

    if (!email) {
      setMessage("⚠️ Ingresa tu correo")
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password` // 👈 respetamos tu ruta actual
    })

    if (error) {
      setMessage("❌ " + error.message)
    } else {
      setMessage("📩 Revisa tu correo para recuperar tu contraseña")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* TITLE */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          Recuperar contraseña
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>

        {/* INPUT */}
        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={handleRecover}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}