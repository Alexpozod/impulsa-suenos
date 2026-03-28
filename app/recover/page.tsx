'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function RecoverPage() {

  const [email, setEmail] = useState('')

  const handleRecover = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password`
    })

    if (error) alert(error.message)
    else alert('Revisa tu correo')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">

      <div className="bg-white p-8 rounded-xl shadow-md">

        <h1 className="mb-4 font-bold">
          Recuperar contraseña
        </h1>

        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 mb-4 w-full"
        />

        <button
          onClick={handleRecover}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>

      </div>

    </main>
  )
}
