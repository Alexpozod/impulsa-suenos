'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DonationBox from '@/src/components/DonationBox'

export default function CampaignDetail() {

  const params = useParams()
  const id = params?.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) load()
  }, [id])

  const load = async () => {
    try {
      const res = await fetch(`/api/campaign/${id}`)
      const data = await res.json()
      setCampaign(data)
    } catch (err) {
      console.error("Error cargando campaña", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Cargando campaña...</div>
  }

  if (!campaign) {
    return <div className="p-10 text-center">Campaña no encontrada</div>
  }

  const current = Number(campaign.current_amount || 0)
  const goal = Number(campaign.goal_amount || 0)

  const progress = goal > 0
    ? Math.min((current / goal) * 100, 100)
    : 0

  const isEndingSoon =
    campaign.end_date &&
    new Date(campaign.end_date).getTime() - Date.now() < 1000 * 60 * 60 * 24

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        {/* IZQUIERDA */}
        <div className="md:col-span-2">

          <img
            src={campaign.image_url || "https://via.placeholder.com/800"}
            className="w-full h-80 object-cover rounded-2xl mb-6"
          />

          <h1 className="text-3xl font-bold mb-3">
            {campaign.title}
          </h1>

          {/* BADGES */}
          <div className="flex flex-wrap gap-2 mb-4">

            {campaign.mode === 'tickets' && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                🎁 Incluye sorteo
              </span>
            )}

            {campaign.mode === 'goal' && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                ❤️ Donación
              </span>
            )}

            {progress > 70 && (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                🔥 Popular
              </span>
            )}

            {isEndingSoon && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
                ⏳ Últimas horas
              </span>
            )}

          </div>

          {/* DESCRIPCIÓN */}
          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {campaign.description}
          </p>

          {/* PROGRESO */}
          <div className="mb-6">

            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 bg-green-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="font-bold text-green-600">
                ${current.toLocaleString()}
              </span>
              <span className="text-gray-500">
                de ${goal.toLocaleString()}
              </span>
            </div>

          </div>

          {/* TRIGGERS */}
          <div className="space-y-2 text-sm">

            <p className="text-green-600 font-medium">
              💖 Tu aporte puede cambiar esta historia
            </p>

            {progress > 50 && (
              <p className="text-orange-500">
                ⚡ Más del 50% logrado
              </p>
            )}

            {progress > 80 && (
              <p className="text-red-500 font-semibold">
                🚨 Estamos muy cerca de la meta
              </p>
            )}

          </div>

        </div>

        {/* DERECHA (DONACIÓN) */}
        <div className="sticky top-6 h-fit">

          <div className="bg-white p-6 rounded-2xl shadow border">

            {/* PROGRESO RESUMEN */}
            <div className="mb-4 text-center">

              <p className="text-xl font-bold text-green-600">
                ${current.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500">
                recaudados de ${goal.toLocaleString()}
              </p>

            </div>

            {/* DONATION BOX */}
            <DonationBox campaign_id={campaign.id} />

          </div>

          {/* CONFIANZA */}
          <div className="mt-4 text-center text-xs text-gray-500 space-y-1">

            <p>🔒 Pagos protegidos con MercadoPago</p>
            <p>📊 Registro financiero transparente</p>
            <p>🛡️ Sistema antifraude activo</p>

          </div>

        </div>

      </div>

    </main>
  )
}