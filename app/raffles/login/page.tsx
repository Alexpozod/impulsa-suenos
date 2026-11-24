'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import PasswordInput from "@/app/components/ui/PasswordInput"

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
     🎯 REDIRECCIÓN PRO
  ========================= */
  const handlePostLoginRedirect = async () => {

    console.log("LOGIN 1")

    const { data: { user } } = await supabase.auth.getUser()

    console.log("LOGIN USER", user)

    if (!user) {
  window.location.href = "/raffles/login"
  return
}

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role = profile?.role

const {
  data: { session }
} =
await supabase.auth.getSession()

const response =
await fetch(

  "/api/raffles/partners/me",

  {

    headers:{

      Authorization:
      `Bearer ${session?.access_token}`

    }

  }

)

const json =
await response.json()

const affiliate =
json.affiliate

const isPartner =
!!affiliate?.active

if (

  affiliate &&

  !affiliate.owner_user_id

){

  await fetch(

    "/api/raffles/partners/profile",

    {

      method:"PUT",

      headers:{

        "Content-Type":"application/json",

        Authorization:
        `Bearer ${session?.access_token}`

      },

      body:JSON.stringify({})

    }

  )

}

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

    if (
  redirect &&
  redirect.startsWith("/raffles") &&
  !redirect.startsWith("//") &&
  !redirect.includes("\\") &&
  !redirect.includes("\n") &&
  !redirect.includes("\r")
) {
  window.location.href = redirect
  return
}

if (isPartner) {
  window.location.href = "/raffles/partners/dashboard"
  return
}

window.location.href = "/raffles"
  }

  useEffect(() => {
  let redirected = false

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session && !redirected) {
      redirected = true
      handlePostLoginRedirect()
    }
  }

  checkSession()

  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === "SIGNED_IN" && session && !redirected) {
        redirected = true
        handlePostLoginRedirect()
      }
    }
  )

  return () => {
    listener.subscription.unsubscribe()
  }
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
     🔐 GOOGLE
  ========================= */
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/raffles/login`
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF9F5] px-6 pt-28">

      <div
  className="
    w-full
    max-w-md
    rounded-3xl
    border
    border-[#002314]/20
    bg-[#EDE8FD]
    p-8
    shadow-cyan-950/30
  "
>

        {/* TITLE */}
        <h1
  className="
    text-3xl
    font-black
    text-center
    text-[#002314]
    mb-2
  "
>
  ImpulsaSueños Sorteos
</h1>

       <p
  className="
    text-center
    text-[#002314]
    text-sm
    mb-6
  "
>
  Accede para participar, revisar tus tickets y administrar tus compras.
</p>

        {/* GOOGLE */}
        <button
          onClick={signInWithGoogle}
          className="
w-full
flex
items-center
justify-center
gap-3
rounded-xl
border
border-[#002314]/20
bg-[#EDE8FD]
py-3
text-[#002314]
hover:border-cyan-400
transition
"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continuar con Google
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#EDE8FD]" />
          <span className="text-xs text-[#002314]">o con email</span>
          <div className="flex-1 h-px bg-[#EDE8FD]" />
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Correo"
          className="
w-full
rounded-lg
border
border-[#002314]/20
bg-[#EDE8FD]
text-[#002314]
placeholder:text-[#002314]
p-3
mb-3
focus:border-cyan-400
focus:ring-2
focus:ring-cyan-500/30
outline-none
"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}

        <PasswordInput
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="
        w-full
        rounded-lg
        border
        border-[#002314]/20
        bg-[#EDE8FD]
        text-[#002314]
        placeholder:text-[#002314]
        p-3
        mb-1
        focus:border-cyan-400
        focus:ring-2
        focus:ring-cyan-500/30
        outline-none
        "
        />

        {/* PASSWORD INFO */}
        <p className="text-xs text-[#002314] mb-3">
          Mínimo 8 caracteres, una mayúscula, un número y un símbolo
        </p>

        {/* RECOVER */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.location.href = "/raffles/recover"}
            className="text-sm text-[#7048E8] hover:text-[#7048E8] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* LOGIN */}
        <button
          onClick={signIn}
          className="w-full bg-primary text-white py-3 rounded-lg mb-3 font-semibold hover:bg-primaryHover transition"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        {/* REGISTER */}
        <button
          onClick={() => window.location.href = "/raffles/register"}
          className="
w-full
rounded-lg
border
border-[#002314]/20
bg-[#EDE8FD]
py-3
font-semibold
text-[#002314]
hover:border-cyan-400
transition
"
          disabled={loading}
        >
          Crear cuenta
        </button>

        {/* LEGAL */}

<p className="text-xs text-[#002314] text-center mt-4">

  Al continuar aceptas nuestros{" "}

  <a
    href="/raffles/terminos"
    className="text-[#7048E8] hover:text-[#7048E8] underline"
  >
    Términos
  </a>

  {" "}y{" "}

  <a
    href="/raffles/privacidad"
    className="text-[#7048E8] hover:text-[#7048E8] underline"
  >
    Política de Privacidad
  </a>

  .

</p>

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-center text-sm text-red-800">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}