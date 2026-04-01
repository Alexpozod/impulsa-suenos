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

  const [redirect, setRedirect] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get("redirect"))
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push(redirect || "/dashboard")
      }
    }

    checkSession()
  }, [redirect, router])

  const signIn = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage("❌ " + error.message)
    } else {
      router.push(redirect || "/dashboard")
    }

    setLoading(false)
  }

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
      setMessage("📩 Revisa tu correo")
    }

    setLoading(false)
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/dashboard`
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Correo"
          className="w-full border p-3 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          className="w-full bg-black text-white py-3 rounded mb-3"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        <button
          onClick={signUp}
          className="w-full border py-3 rounded mb-3"
        >
          Crear cuenta
        </button>

        <button
          onClick={signInWithGoogle}
          className="w-full border py-3 rounded"
        >
          Google
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">
            {message}
          </p>
        )}

      </div>
    </main>
  )
}
