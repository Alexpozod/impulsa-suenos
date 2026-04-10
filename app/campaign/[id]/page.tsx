'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DonationBox from '@/app/components/DonationBox'

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

          <div className="relative">

            {campaign.video_url ? (

              campaign.video_url.includes("youtube") ? (
                <iframe
                  src={campaign.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-[420px] rounded-2xl"
                  allowFullScreen
                />
              ) : (
                <video
                  src={campaign.video_url}
                  controls
                  className="w-full h-[420px] object-cover rounded-2xl"
                />
              )

            ) : (

              <img
                src={buildImageUrl(images[active])}
                className="w-full h-[420px] object-cover rounded-2xl"
              />

            )}

          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
              <img
                key={i}
                src={buildImageUrl(img)}
                onClick={() => setActive(i)}
                className={`h-24 w-24 object-cover rounded-lg cursor-pointer ${
                  i === active
                    ? "border-2 border-green-600"
                    : "opacity-70"
                }`}
              />
            ))}
          </div>

          <h1 className="text-3xl font-bold mt-6">
            {campaign.title}
          </h1>

          <p className="text-red-500 font-semibold mt-2">
            ⚠️ Necesitamos tu ayuda ahora
          </p>

          {/* PROGRESO */}
          <div className="mt-6">
            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 bg-green-600"
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
            <p className="text-gray-700 whitespace-pre-line">
              {campaign.description}
            </p>
          </div>

          <DonationsList donations={campaign.donations} />

        </div>

        {/* DERECHA */}
        <div className="md:col-span-2">

          <div className="sticky top-6">

            <div className="bg-white border rounded-2xl p-6 shadow-lg">

              <LiveDonation campaign_id={campaign.id} />

              <DonationBox campaign_id={campaign.id} />

              <div className="mt-6 text-xs text-gray-400 text-center">
                🔒 Pago seguro
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}

/* 🔥 LIVE DONATION */
function LiveDonation({ campaign_id }: { campaign_id: string }) {

  const [last, setLast] = useState<any>(null)

  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch(`/api/donations-live?campaign_id=${campaign_id}`)
        const data = await res.json()
        setLast(data?.[0])
      } catch {}
    }

    load()
    const interval = setInterval(load, 5000)

    return () => clearInterval(interval)

  }, [campaign_id])

  if (!last) return null

  const seconds = Math.floor((Date.now() - new Date(last.created_at).getTime()) / 1000)

  return (
    <p className="text-sm text-gray-500 mb-3">
      🔥 Última donación hace {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)} min`}
    </p>
  )
}

/* LISTA DONACIONES */
function DonationsList({ donations }: any) {

  if (!donations?.length) {
    return <p className="text-sm text-gray-500 mt-6">Aún no hay donaciones</p>
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
            <div key={i} className="flex justify-between text-sm">
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