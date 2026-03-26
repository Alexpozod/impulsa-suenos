'use client'

import { useEffect, useState } from 'react'

export default function AdminSettings() {

  const [commission, setCommission] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()

    setCommission(data.value || '0.10')
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: commission })
    })

    const data = await res.json()

    if (data.error) {
      alert(data.error)
    } else {
      alert('✅ Comisión actualizada')
    }
  }

  if (loading) return <p className="p-10">Cargando...</p>

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-10">
        ⚙️ Configuración Plataforma
      </h1>

      <div className="bg-slate-900 p-6 rounded-xl max-w-md">

        <label className="block mb-2 text-sm">
          Comisión (ej: 0.10 = 10%)
        </label>

        <input
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          className="w-full p-3 rounded bg-black border border-slate-700 mb-4"
        />

        <button
          onClick={save}
          className="bg-green-600 px-4 py-2 rounded-lg w-full"
        >
          Guardar
        </button>

      </div>

    </main>
  )
}
