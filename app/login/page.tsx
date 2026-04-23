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
     🎯 REDIRECCIÓN PRO REAL
  ========================= */
  const handlePostLoginRedirect = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role = profile?.role

    const intent = localStorage.getItem('donation_intent')

    if (intent) {
      try {
        const parsed = JSON.parse(intent)
        localStorage.removeItem('donation_intent')
        window.location.href = `/campaign/${parsed.campaign_id}`
        return
      } catch {
        localStorage.removeItem('donation_intent')
      }
    }

    if (role === 'admin') {
      window.location.href = "/admin"
      return
    }

    if (redirect) {
      window.location.href = redirect
      return
    }

    window.location.href = "/dashboard"
  }

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

  /* 🆕 REGISTER */
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

  /* 🔐 GOOGLE */
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

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* TITLE */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          Bienvenido
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Ingresa o crea tu cuenta
        </p>

        {/* GOOGLE */}
        <button
          onClick={signInWithGoogle}
          className="w-full border py-3 rounded-xl mb-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continuar con Google
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">o con email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* INPUTS */}
        <input
          type="email"
          placeholder="Correo"
          className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* LOGIN */}
        <button
          onClick={signIn}
          className="w-full bg-green-600 text-white py-3 rounded-lg mb-3 font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        {/* REGISTER */}
        <button
          onClick={signUp}
          className="w-full border py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          disabled={loading}
        >
          Crear cuenta
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-center text-sm text-red-500">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}