'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Revisa tu correo para confirmar tu cuenta')
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Crear cuenta
        </h1>

        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Registrarse
        </button>

      </div>

    </main>
  )
}
