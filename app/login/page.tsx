'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirect, setRedirect] = useState<string | null>(null)

  /* =========================
     🔐 PASSWORD VALIDATION PRO
  ========================= */
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    if (!minLength) return "Debe tener al menos 8 caracteres"
    if (!hasUpper) return "Debe incluir una mayúscula"
    if (!hasNumber) return "Debe incluir un número"
    if (!hasSymbol) return "Debe incluir un símbolo"

    return null
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get("redirect"))
  }, [])

  /* =========================
     🎯 REDIRECCIÓN PRO
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

  /* =========================
     🔐 LOGIN
  ========================= */
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

  /* =========================
     🆕 REGISTER (PRO + SECURITY)
  ========================= */
  const signUp = async () => {
  setLoading(true)
  setMessage('')

  // 🔐 VALIDACIÓN
  const passwordError = validatePassword(password)
  if (passwordError) {
    setMessage("❌ " + passwordError)
    setLoading(false)
    return
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
    // ❌ ELIMINADO COMPLETAMENTE:
    // options: { emailRedirectTo: ... }
  })

  if (error) {
    setMessage(error.message)
  } else {

    // 🔐 CONSENTIMIENTO LEGAL (se mantiene)
    fetch("/api/legal-consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "terms",
        accepted: true,
        version: "v1.0",
        email
      })
    }).catch(() => {})

    setMessage("📩 Revisa tu correo para confirmar tu cuenta")
  }

  setLoading(false)
}

  /* =========================
     🔐 GOOGLE
  ========================= */
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/login`
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 pt-28">

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

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Correo"
          className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 mb-1 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* PASSWORD INFO */}
        <p className="text-xs text-gray-400 mb-3">
          Mínimo 8 caracteres, una mayúscula, un número y un símbolo
        </p>

        {/* RECOVER */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.location.href = "/recover"}
            className="text-sm text-green-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

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

        {/* LEGAL */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Al continuar aceptas nuestros{" "}
          <a href="/terminos" className="underline">Términos</a> y{" "}
          <a href="/privacidad" className="underline">Política de Privacidad</a>.
        </p>

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