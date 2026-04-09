'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DonationBox from '@/app/components/donationbox'

export default function CampaignDetail() {

  const params = useParams()
  const id = params?.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (id) load()
  }, [id])

  const load = async () => {
    try {
      const res = await fetch(`/api/campaign/${id}`)
      const data = await res.json()
      setCampaign(data)
    } catch (err) {
      console.error(err)
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }

  const buildImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/800"

    let clean = url.trim().replace(/\s/g, "%20")

    if (clean.startsWith("http")) return clean

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (SUPABASE_URL) {
      return `${SUPABASE_URL}/storage/v1/object/public/${clean}`
    }

    return clean
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>
  if (!campaign) return <div className="p-10 text-center">Campaña no encontrada</div>

  const images = (campaign.images?.length
    ? campaign.images
    : [campaign.image_url]
  ).filter(Boolean)

  const current = Number(campaign.current_amount || 0)
  const goal = Number(campaign.goal_amount || 0)

  const progress = goal > 0
    ? Math.min((current / goal) * 100, 100)
    : 0

  return (
    <main className="bg-white min-h-screen">

      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-10">

        {/* IZQUIERDA */}
        <div className="md:col-span-3">

          {/* GALERÍA */}
          <div className="relative">

            <img
              src={buildImageUrl(images[active])}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/800"
              }}
              className="w-full h-[420px] object-cover rounded-2xl"
            />

            {campaign.video_url && (
              <button
                onClick={() => window.open(campaign.video_url, "_blank")}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-black/60 text-white text-3xl px-5 py-3 rounded-full">
                  ▶
                </div>
              </button>
            )}

          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
              <img
                key={i}
                src={buildImageUrl(img)}
                onClick={() => setActive(i)}
                className={`h-24 w-24 object-cover rounded-lg cursor-pointer transition ${
                  i === active
                    ? "border-2 border-green-600 scale-105"
                    : "opacity-70 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          {/* TITULO */}
          <h1 className="text-3xl md:text-4xl font-bold mt-6 leading-tight">
            {campaign.title}
          </h1>

          {/* URGENCIA */}
          <p className="text-red-500 font-semibold mt-2">
            ⚠️ Necesitamos tu ayuda ahora
          </p>

          {/* PROGRESO */}
          <div className="mt-6">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span className="font-bold text-green-600 text-lg">
                ${current.toLocaleString()}
              </span>
              <span className="text-gray-500">
                de ${goal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-2">Historia</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {campaign.description}
            </p>
          </div>

          {/* 🎉 DONACIONES */}
          <DonationsList donations={campaign.donations} />

        </div>

        {/* DERECHA */}
        <div className="md:col-span-2">

          <div className="sticky top-6">

            <div className="bg-white border rounded-2xl p-6 shadow-lg">

              {/* PRUEBA SOCIAL */}
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  🔥 Varias personas están donando ahora
                </p>
                <p className="text-xs text-gray-400">
                  Última donación hace instantes
                </p>
              </div>

              <DonationBox campaign_id={campaign.id} />

              {/* CONFIANZA */}
              <div className="mt-6 text-xs text-gray-400 text-center space-y-1">
                <p>🔒 Pago 100% seguro</p>
                <p>📊 Transparencia total</p>
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}

/* =========================
   🎉 DONACIONES
========================= */
function DonationsList({ donations }: any) {

  if (!donations?.length) {
    return (
      <p className="text-sm text-gray-500 mt-6">
        Aún no hay donaciones
      </p>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl border shadow mt-8">

      <h3 className="font-semibold mb-3">
        🎉 Últimas donaciones
      </h3>

      <div className="space-y-2">
        {donations.map((d: any, i: number) => {

          const name = d.user_email
            ? d.user_email.split("@")[0].slice(0, 4) + "****"
            : "Anónimo"

          return (
            <div
              key={i}
              className="flex justify-between text-sm"
            >
              <span>{name}</span>
              <span className="font-semibold">
                ${Number(d.amount).toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}