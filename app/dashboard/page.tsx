'use client'

import { supabase } from '@/src/lib/supabase'

export default function Dashboard() {

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{padding:40}}>

      <h1>Dashboard</h1>

      <p>Bienvenido a ImpulsaSueños</p>

      <button onClick={logout}>
        Cerrar sesión
      </button>

    </div>
  )
}