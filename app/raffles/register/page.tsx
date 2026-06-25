'use client'

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function RafflesRegisterPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  return (

    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 pt-28">

      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          p-8
          shadow-2xl
        "
      >

        <h1
  className="
    text-3xl
    font-black
    text-center
    text-white
    mb-2
  "
>
  Crear cuenta
</h1>

<p
  className="
    text-center
    text-slate-400
    mb-8
  "
>
  Crea tu cuenta para participar en los sorteos de ImpulsaSueños.
</p>

<input
  type="email"
  placeholder="Correo electrónico"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="
    w-full
    rounded-xl
    border
    border-slate-700
    bg-slate-800
    p-3
    text-white
    placeholder:text-slate-400
    outline-none
    focus:border-cyan-500
    mb-4
  "
/>

<input
  type="password"
  placeholder="Contraseña"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="
    w-full
    rounded-xl
    border
    border-slate-700
    bg-slate-800
    p-3
    text-white
    placeholder:text-slate-400
    outline-none
    focus:border-cyan-500
    mb-2
  "
/>

<p className="text-xs text-slate-500 mb-6">
  Mínimo 8 caracteres, una mayúscula, un número y un símbolo.
</p>

<button
  className="
    w-full
    rounded-xl
    bg-cyan-500
    hover:bg-cyan-400
    transition
    py-3
    font-bold
    text-slate-950
  "
>
  Crear cuenta
</button>

<button
  onClick={() => window.location.href = "/raffles/login"}
  className="
    w-full
    mt-4
    text-slate-400
    hover:text-white
    transition
  "
>
  Ya tengo una cuenta
</button>

      </div>

    </main>

  )

}