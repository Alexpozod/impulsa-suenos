"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DonationBox from '@/app/components/DonationBox'
import ViewersCounter from '@/app/components/ViewersCounter'
import CampaignCarousel from '@/app/components/CampaignCarousel'
import { safeCLPtoUSD } from '@/lib/utils/currency'

export default function CampaignDetail() {

  const params = useParams()
  const id = params?.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rate, setRate] = useState<number>(900)

  const [donations, setDonations] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([]) // 🔥 NUEVO

  useEffect(() => {
    if (id) {
      load()
      loadRate()
      loadDonations()
      loadUpdates()
      loadRanking() // 🔥 NUEVO
    }
  }, [id])

  const load = async () => {
    try {
      const res = await fetch(`/api/campaign/${id}`)
      const data = await res.json()
      setCampaign(data)
    } catch {
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }

  const loadRate = async () => {
    try {
      const res = await fetch(`/api/exchange-rate`)
      const data = await res.json()
      if (data?.rate) setRate(data.rate)
    } catch {}
  }

  const loadDonations = async () => {
    try {
      const res = await fetch(`/api/donations-live?campaign_id=${id}`)
      const data = await res.json()
      setDonations(data || [])
    } catch (err) {
      console.error("Error loading donations:", err)
    }
  }

  const loadUpdates = async () => {
    try {
      const res = await fetch(`/api/campaign-updates?campaign_id=${id}`)
      const data = await res.json()
      setUpdates(data || [])
    } catch (err) {
      console.error("Error loading updates:", err)
    }
  }

  /* =========================
     🏆 RANKING NUEVO
  ========================= */
  const loadRanking = async () => {
    try {
      const res = await fetch(`/api/campaign-ranking?campaign_id=${id}`)
      const data = await res.json()
      setRanking(data || [])
    } catch (err) {
      console.error("ranking error", err)
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

  const current = Number(campaign.current_amount || 0)
  const goal = Number(campaign.goal_amount || 0)

  const currentUSD = safeCLPtoUSD(current, rate)
  const goalUSD = safeCLPtoUSD(goal, rate)

  const progress = goal > 0
    ? Math.min((current / goal) * 100, 100)
    : 0

  const images = (campaign.images?.length
    ? campaign.images
    : [campaign.image_url]
  ).filter(Boolean).map(buildImageUrl)

  return (
    <main className="bg-white min-h-screen">

      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-10">

        {/* ================= LEFT ================= */}
        <div className="md:col-span-3">

          <CampaignCarousel images={images} />

          <h1 className="text-3xl font-bold mt-6">
            {campaign.title}
          </h1>

          {/* PROGRESO */}
          <div className="mt-6 space-y-3">

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-600"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-bold text-green-600 text-lg">
                ${current.toLocaleString()}
              </span>

              <span className="text-gray-500 text-right">
                de ${goal.toLocaleString()}
              </span>
            </div>

          </div>

          <p className="mt-6 whitespace-pre-line">
            {campaign.description}
          </p>

          {/* ================= 💬 DONACIONES ================= */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">
              💬 Últimas donaciones
            </h2>

            <div className="space-y-4">

              {donations.map((donation: any) => {

                const donorName = (() => {

  // 1. nombre real desde metadata
  if (donation.metadata?.donor_name) {
    return donation.metadata.donor_name
  }

  // 2. fallback email
  if (donation.user_email && donation.user_email.includes("@")) {
    const base = donation.user_email.split("@")[0]
    if (base) return base.slice(0, 2).toUpperCase() + "***"
  }

  // 3. fallback final seguro
  return "Donador"

})()

                const avatarLetter = donorName?.[0]?.toUpperCase() || "D"

                const amount = Number(donation.amount || 0)

                return (
                  <div key={donation.id} className="flex gap-3 border p-3 rounded-xl">

                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold">
                      {avatarLetter}
                    </div>

                    <div className="flex-1">

                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">{donorName}</span>
                        <span className="text-green-600 font-bold">
                          +${amount.toLocaleString()}
                        </span>
                      </div>

                    </div>

                  </div>
                )
              })}

            </div>
          </div>

          {/* ================= 🏆 RANKING ================= */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">
              🏆 Top donadores
            </h2>

            <div className="space-y-3">

              {ranking.map((r: any, index: number) => {

                const isTop = index === 0

                return (
                  <div
                    key={r.user_email}
                    className={`flex justify-between items-center p-3 rounded-xl border ${
                      isTop ? "bg-yellow-50 border-yellow-300" : ""
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-sm font-bold text-gray-500">
                        #{index + 1}
                      </span>

                      <span className="font-semibold text-sm">
                        {r.donor_name}
                      </span>

                      {isTop && (
                        <span className="text-[10px] bg-yellow-400 text-white px-2 py-0.5 rounded-full">
                          TOP
                        </span>
                      )}

                    </div>

                    <span className="text-green-600 font-bold">
                      ${Number(r.total_donated).toLocaleString()}
                    </span>

                  </div>
                )
              })}

            </div>
          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="md:col-span-2">
          <div className="sticky top-6">
            <div className="bg-white border rounded-2xl p-6 shadow-lg space-y-4">
              <ViewersCounter />
              <DonationBox campaign_id={campaign.id} />
            </div>
          </div>
        </div>

      </section>

    </main>
  )
}