'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔐 Detectar sesión activa
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) router.push('/dashboard')
    }
    checkUser()
  }, [])

  // 🔑 LOGIN
  const signIn = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setMessage('⚠️ Debes confirmar tu correo')
      } else {
        setMessage('❌ ' + error.message)
      }
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  // 📝 REGISTRO
  const signUp = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/dashboard`
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('📩 Revisa tu correo para confirmar')
    }

    setLoading(false)
  }

  // 🔐 GOOGLE LOGIN
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/dashboard`
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border">

        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
          ImpulsaSueños
        </h1>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Accede o crea tu cuenta
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* RECUPERAR */}
        <div className="text-right mb-4">
          <span
            onClick={() => router.push('/recover')}
            className="text-sm text-green-600 cursor-pointer hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col gap-3">

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Crear cuenta
          </button>

        </div>

        {/* DIVISOR */}
        <div className="my-6 flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          o continuar con
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={signInWithGoogle}
          className="w-full border py-3 rounded-lg hover:bg-gray-50 transition"
        >
          🔐 Google
        </button>

        {/* MENSAJE */}
        {message && (
          <p className="text-sm mt-4 text-center text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}
