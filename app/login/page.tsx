'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('✅ Cuenta creada. Revisa tu correo.')
    }

    setLoading(false)
  }

  const signIn = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    } else {
      window.location.href = '/dashboard'
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

        {/* LOGO */}
        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
          ImpulsaSueños
        </h1>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Accede a tu cuenta o crea una nueva
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BOTONES */}
        <div className="flex flex-col gap-3">

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition disabled:opacity-50"
          >
            Crear cuenta
          </button>

        </div>

        {/* MENSAJE */}
        {message && (
          <p className="text-center text-sm mt-4 text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}
