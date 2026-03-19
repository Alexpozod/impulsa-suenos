'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Cuenta creada. Revisa tu correo.')
    }
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      setMessage(error.message)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{padding:40}}>

      <h1>ImpulsaSueños</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={signUp}>
        Crear cuenta
      </button>

      <button onClick={signIn} style={{marginLeft:10}}>
        Iniciar sesión
      </button>

      <p>{message}</p>

    </div>
  )
}