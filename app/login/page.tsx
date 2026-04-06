'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [redirect, setRedirect] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get("redirect"))
  }, [])

  /* =========================
     🎯 REDIRECCIÓN INTELIGENTE PRO
  ========================= */
  const handlePostLoginRedirect = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    const role = user?.user_metadata?.role

    /* 🔥 donation intent (prioridad máxima) */
    const intent = localStorage.getItem('donation_intent')

    if (intent) {
      try {
        const parsed = JSON.parse(intent)
        localStorage.removeItem('donation_intent')

        window.location.href = `/campaign/${parsed.campaign_id}`
        return
      } catch (e) {
        console.error("Error parsing donation intent", e)
        localStorage.removeItem('donation_intent')
      }
    }

    /* 🔐 ADMIN */
    if (role === 'admin') {
      window.location.href = "/admin"
      return
    }

    /* 🔁 REDIRECT PARAM */
    if (redirect) {
      window.location.href = redirect
      return
    }

    /* 👤 USER NORMAL */
    window.location.href = "/dashboard"
  }

  /* 🔍 SI YA ESTÁ LOGUEADO */
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        handlePostLoginRedirect()
      }
    }

    checkSession()
  }, [redirect])

  /* 🔐 LOGIN */
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
      await handlePostLoginRedirect()
    }

    setLoading(false)
  }

  /* 🆕 REGISTRO */
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
      setMessage("📩 Revisa tu correo para confirmar tu cuenta")
    }

    setLoading(false)
  }

  /* 🔐 GOOGLE LOGIN */
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/login`
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Iniciar sesión
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
          className="w-full bg-green-600 text-white py-3 rounded mb-3 font-semibold"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        <button
          onClick={signUp}
          className="w-full border py-3 rounded mb-3"
          disabled={loading}
        >
          Crear cuenta
        </button>

        <button
          onClick={signInWithGoogle}
          className="w-full border py-3 rounded"
        >
          Continuar con Google
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