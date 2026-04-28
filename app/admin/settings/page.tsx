'use client'

import { useEffect, useState } from 'react'

export default function AdminSettings() {

  const [feeFixed, setFeeFixed] = useState<string>('300')
  const [feePercent, setFeePercent] = useState<string>('0.01')
  const [iva, setIVA] = useState<string>('0.19')

  const [loading, setLoading] = useState(true)

  /* =========================
     📥 LOAD
  ========================= */
  const load = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()

      setFeeFixed(String(data?.fee_fixed ?? 300))
      setFeePercent(String(data?.fee_percent ?? 0.01))
      setIVA(String(data?.iva ?? 0.19))

    } catch {
      alert('Error cargando configuración')
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  /* =========================
     💾 SAVE
  ========================= */
  const save = async () => {

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fee_fixed: Number(feeFixed),
        fee_percent: Number(feePercent),
        iva: Number(iva)
      })
    })

    const data = await res.json()

    if (data.error) {
      alert(data.error)
    } else {
      alert('✅ Configuración actualizada')
    }
  }

  if (loading) return <p className="p-10">Cargando...</p>

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-10">
        ⚙️ Configuración Plataforma
      </h1>

      <div className="bg-slate-900 p-6 rounded-xl max-w-md space-y-4">

        {/* 💰 FEE FIJO */}
        <div>
          <label className="block mb-2 text-sm">
            Comisión fija (CLP)
          </label>

          <input
            type="number"
            value={feeFixed}
            onChange={(e) => setFeeFixed(e.target.value)}
            className="w-full p-3 rounded bg-black border border-slate-700"
          />
        </div>

        {/* 📊 PORCENTAJE */}
        <div>
          <label className="block mb-2 text-sm">
            Comisión % (ej: 0.02 = 2%)
          </label>

          <input
            type="number"
            step="0.001"
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
            className="w-full p-3 rounded bg-black border border-slate-700"
          />
        </div>

        {/* 🧾 IVA */}
        <div>
          <label className="block mb-2 text-sm">
            IVA (ej: 0.19 = 19%)
          </label>

          <input
            type="number"
            step="0.01"
            value={iva}
            onChange={(e) => setIVA(e.target.value)}
            className="w-full p-3 rounded bg-black border border-slate-700"
          />
        </div>

        {/* BOTÓN */}
        <button
          onClick={save}
          className="bg-green-600 px-4 py-3 rounded-lg w-full font-semibold hover:bg-green-700"
        >
          Guardar configuración
        </button>

      </div>

    </main>
  )
}