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
  const [ledger, setLedger] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      load()
      loadRate()
      loadDonations()
      loadLedger()
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

  /* =========================
     🔥 LEDGER TIMELINE
  ========================= */
  const loadLedger = async () => {
    try {
      const res = await fetch(`/api/ledger`)
      const data = await res.json()

      const filtered = data
        ?.filter((tx: any) => tx.campaign_id === id)
        ?.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

      setLedger(filtered || [])
    } catch (err) {
      console.error("Error loading ledger:", err)
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

  const getLabel = (type: string) => {
    switch (type) {
      case "payment": return "💰 Donación recibida"
      case "withdraw": return "🏦 Retiro realizado"
      case "withdraw_pending": return "⏳ Retiro solicitado"
      case "withdraw_rejected": return "❌ Retiro rechazado"
      case "fee_mp": return "💳 Comisión MP"
      case "fee_platform": return "🧾 Comisión plataforma"
      default: return type
    }
  }

  const getColor = (type: string) => {
    if (type === "payment") return "text-green-600"
    if (type.includes("withdraw") || type.includes("fee")) return "text-red-600"
    return "text-gray-700"
  }

  const getSign = (type: string) => {
    if (type === "payment") return "+"
    return "-"
  }

  return (
    <main className="bg-white min-h-screen">

      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-10">

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
                <span className="block text-xs text-gray-400">
                  ≈ ${currentUSD.toFixed(2)} USD
                </span>
              </span>

              <span className="text-gray-500 text-right">
                de ${goal.toLocaleString()}
                <span className="block text-xs text-gray-400">
                  ≈ ${goalUSD.toFixed(2)} USD
                </span>
              </span>
            </div>

          </div>

          <p className="mt-6 whitespace-pre-line">
            {campaign.description}
          </p>

          {/* 💬 DONACIONES */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">
              💬 Últimas donaciones
            </h2>

            {donations.length === 0 && (
              <p className="text-gray-500 text-sm">
                Aún no hay donaciones
              </p>
            )}

            <div className="space-y-3">

              {donations.map((donation: any) => {

                const name = donation.user_email
                  ? donation.user_email.split("@")[0][0] + "***"
                  : "Donador"

                const message =
                  donation.metadata?.message || ""

                return (
                  <div
                    key={donation.id}
                    className="flex justify-between items-start border-b pb-2"
                  >

                    <div>
                      <span className="font-medium">{name}</span>

                      {message && (
                        <div className="text-xs text-gray-500">
                          {message}
                        </div>
                      )}
                    </div>

                    <span className="font-semibold text-green-600">
                      ${Number(donation.amount).toLocaleString()}
                    </span>

                  </div>
                )
              })}

            </div>
          </div>

          {/* 🔥 TIMELINE REAL */}
          <div className="mt-12">

            <h2 className="text-xl font-bold mb-4">
              📊 Actividad de la campaña
            </h2>

            <div className="space-y-3">

              {ledger.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Sin actividad aún
                </p>
              )}

              {ledger.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex justify-between border-b pb-2 text-sm"
                >

                  <span>
                    {getLabel(tx.type)}
                  </span>

                  <span className={getColor(tx.type)}>
                    {getSign(tx.type)}
                    ${Math.abs(Number(tx.amount)).toLocaleString()}
                  </span>

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* 💳 SIDEBAR */}
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