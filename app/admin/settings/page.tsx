'use client'

import { useEffect, useState } from 'react'

export default function AdminSettings() {

  const [current, setCurrent] = useState<any>(null)

  const [feeFixed, setFeeFixed] = useState<string>('300')
  const [feePercent, setFeePercent] = useState<string>('0.01')
  const [iva, setIVA] = useState<string>('0.19')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const previewAmount = 10000 // 🔥 base simulación

  /* =========================
     📥 LOAD
  ========================= */
  const load = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()

      setCurrent(data)

      setFeeFixed(String(data?.fee_fixed ?? 300))
      setFeePercent(String(data?.fee_percent ?? 0.01))
      setIVA(String(data?.iva ?? 0.19))

    } catch {
      setMessage('❌ Error cargando configuración')
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  /* =========================
     🧮 PREVIEW
  ========================= */
  const calcPreview = () => {
    const amount = previewAmount

    const fixed = Number(feeFixed)
    const percent = Number(feePercent)
    const ivaVal = Number(iva)

    const fee = fixed + (amount * percent)
    const ivaCalc = fee * ivaVal
    const net = amount - fee - ivaCalc

    return {
      fee,
      ivaCalc,
      net
    }
  }

  const preview = calcPreview()

  /* =========================
     💾 SAVE
  ========================= */
  const save = async () => {

    setSaving(true)
    setMessage("")

    try {

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
        setMessage(`❌ ${data.error}`)
        setSaving(false)
        return
      }

      setMessage("✅ Configuración actualizada")
      await load()

    } catch {
      setMessage("❌ Error inesperado")
    }

    setSaving(false)
  }

  if (loading) return <p className="p-10 text-white">Cargando...</p>

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-10">
        ⚙️ Configuración Plataforma
      </h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">

        {/* =========================
            📊 VALORES ACTUALES
        ========================= */}
        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="font-semibold mb-4 text-green-400">
            Valores actuales
          </h2>

          <div className="space-y-2 text-sm">

            <p>💰 Fijo: <strong>${Number(current?.fee_fixed || 0).toLocaleString()}</strong></p>
            <p>📊 %: <strong>{Number(current?.fee_percent || 0) * 100}%</strong></p>
            <p>🧾 IVA: <strong>{Number(current?.iva || 0) * 100}%</strong></p>

          </div>

        </div>

        {/* =========================
            ✏️ EDITAR
        ========================= */}
        <div className="bg-slate-900 p-6 rounded-xl space-y-4">

          <h2 className="font-semibold mb-2 text-blue-400">
            Nueva configuración
          </h2>

          <div>
            <label className="text-sm text-gray-400">Comisión fija</label>
            <input
              type="number"
              value={feeFixed}
              onChange={(e) => setFeeFixed(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-black border border-slate-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Comisión %</label>
            <input
              type="number"
              step="0.001"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-black border border-slate-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">IVA</label>
            <input
              type="number"
              step="0.01"
              value={iva}
              onChange={(e) => setIVA(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-black border border-slate-700"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className={`w-full py-3 rounded-lg font-semibold ${
              saving ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          {message && (
            <p className="text-sm text-center mt-2">
              {message}
            </p>
          )}

        </div>

        {/* =========================
            🧪 PREVIEW
        ========================= */}
        <div className="bg-slate-900 p-6 rounded-xl md:col-span-2">

          <h2 className="font-semibold mb-4 text-yellow-400">
            Simulación (donación $10.000)
          </h2>

          <div className="grid md:grid-cols-3 gap-4 text-sm">

            <div>
              <p className="text-gray-400">Comisión</p>
              <p className="font-bold text-red-400">
                ${preview.fee.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-400">IVA</p>
              <p className="font-bold text-orange-400">
                ${preview.ivaCalc.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Neto creador</p>
              <p className="font-bold text-green-400">
                ${preview.net.toLocaleString()}
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  )
}