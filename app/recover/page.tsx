'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function RecoverPage() {

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecover = async () => {

    setLoading(true)

    // 🔥 GENERA LINK REAL (NO LO PIERDAS)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password`
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // ⚠️ AQUÍ ESTÁ EL CAMBIO IMPORTANTE
    // Supabase NO devuelve el link directamente
    // por eso usamos el flujo híbrido

    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "recover",
        email
      })
    })

    alert("📩 Revisa tu correo")
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-xl font-bold mb-4 text-center">
          Recuperar contraseña
        </h1>

        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 mb-4 w-full rounded-lg"
        />

        <button
          onClick={handleRecover}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

      </div>

    </main>
  )
}