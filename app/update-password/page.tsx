'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function UpdatePasswordPage() {

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const updatePassword = async () => {

    if (!password) {
      setMessage("⚠️ Ingresa una contraseña")
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      setMessage("❌ " + error.message)
    } else {
      setMessage("✅ Contraseña actualizada correctamente")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4 text-center">
          Nueva contraseña
        </h1>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 mb-4 rounded-lg"
        />

        <button
          onClick={updatePassword}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}