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

      if (data.user) {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [])

  // 📝 REGISTRO
  const signUp = async () => {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://www.impulsasuenos.com/dashboard'
      }
    })

    console.log('SIGN UP:', data, error)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('📩 Revisa tu correo y confirma tu cuenta')
    }

    setLoading(false)
  }

  // 🔑 LOGIN
  const signIn = async () => {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('SIGN IN:', data, error)

    if (error) {

      if (error.message.includes('Email not confirmed')) {
        setMessage('⚠️ Debes confirmar tu correo antes de iniciar sesión')
      } else {
        setMessage('❌ ' + error.message)
      }

    } else {
      setMessage('✅ Bienvenido')

      setTimeout(() => {
        router.push('/dashboard')
      }, 800)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
          ImpulsaSueños
        </h1>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Accede o crea tu cuenta
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex flex-col gap-3">

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold"
          >
            Crear cuenta
          </button>

        </div>

        {message && (
          <p className="text-sm mt-4 text-center text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}
