"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DonationBox from '@/app/components/DonationBox'
import ViewersCounter from '@/app/components/ViewersCounter'
import CampaignCarousel from '@/app/components/CampaignCarousel'

export default function CampaignDetail() {

  const params = useParams()
  const id = params?.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [donations, setDonations] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])

  const [ref, setRef] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      load()
      loadDonations()
      loadUpdates()
      loadRanking()

      const urlRef = new URLSearchParams(window.location.search).get("ref")
      if (urlRef) setRef(urlRef)
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

  const getCampaignUrl = () => {
    let url = `${window.location.origin}/campaign/${id}`
    if (ref) url += `?ref=${ref}`
    return url
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(getCampaignUrl())
    alert("🔗 Link copiado correctamente")
  }

  const shareWhatsApp = () => {
    const text = `Apoya esta campaña 🙌 ${campaign?.title}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + getCampaignUrl())}`
    window.open(url, "_blank")
  }

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCampaignUrl())}`
    window.open(url, "_blank")
  }

  const shareX = () => {
    const text = `Apoya esta campaña 🙌 ${campaign?.title}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getCampaignUrl())}`
    window.open(url, "_blank")
  }

  const shareInstagram = () => {
    copyLink()
    alert("📸 Pega el link en Instagram")
  }

  const shareTikTok = () => {
    copyLink()
    alert("🎵 Pega el link en TikTok")
  }

  const shareDonation = (amount: number) => {
    const text = `Doné $${amount.toLocaleString()} a esta campaña 🙌`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + getCampaignUrl())}`
    window.open(url, "_blank")
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>
  if (!campaign) return <div className="p-10 text-center">Campaña no encontrada</div>

  const current = Number(campaign.current_amount || 0)
  const goal = Number(campaign.goal_amount || 0)

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

        <div className="md:col-span-3">

          <CampaignCarousel images={images} />

          <h1 className="text-3xl font-bold mt-6">
            {campaign.title}
          </h1>

         {/* SHARE */}
<div className="flex items-center gap-3 mt-4 flex-wrap">

  {/* LINK */}
  <button onClick={copyLink} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600">
      <path fill="currentColor" d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 0 0 0 6h3v2h-3a5 5 0 0 1-5-5zm6-1h4v2h-4v-2zm5-4h-3v2h3a3 3 0 1 1 0 6h-3v2h3a5 5 0 1 0 0-10z"/>
    </svg>
  </button>

  {/* FACEBOOK */}
  <button onClick={shareFacebook} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2]">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
      <path fill="currentColor" d="M22 12a10 10 0 1 0-11.5 9.9v-7H7.9v-2.9h2.6V9.8c0-2.6 1.5-4 3.9-4 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.3 0-1.7.8-1.7 1.6v2h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12"/>
    </svg>
  </button>

  {/* WHATSAPP */}
  <button onClick={shareWhatsApp} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366]">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
      <path fill="currentColor" d="M20.5 3.5A11.8 11.8 0 0 0 12 0 11.9 11.9 0 0 0 1.6 17.8L0 24l6.4-1.6A11.9 11.9 0 1 0 20.5 3.5zm-8.5 18a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.3-.4a9.8 9.8 0 1 1 8.5 4.7zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.1-.3.2-.6 0a8 8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.3 0-.5-.7-1.8-1-2.5-.5-.6-.7-.6h-.6c-.2 0-.5.1-.7.3s-1 1-1 2.4 1 2.7 1.2 2.9a12 12 0 0 0 4.6 4.1c.6.3 1 .5 1.4.6.6.2 1.1.2 1.5.1.5-.1 1.8-.7 2-1.4s.2-1.2.2-1.3-.2-.2-.5-.4z"/>
    </svg>
  </button>

  {/* X (TWITTER) */}
  <button onClick={shareX} className="w-10 h-10 flex items-center justify-center rounded-full bg-black">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
      <path fill="currentColor" d="M18.9 2H22l-7.2 8.3L23 22h-6.8l-5.3-6.9L4.7 22H1.5l7.7-8.8L1 2h7l4.8 6.3L18.9 2z"/>
    </svg>
  </button>

  {/* INSTAGRAM */}
  <button onClick={shareInstagram} className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
      <path fill="currentColor" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2zm6-1.5a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 5.7zM12 9a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"/>
    </svg>
  </button>

  {/* TIKTOK */}
  <button onClick={shareTikTok} className="w-10 h-10 flex items-center justify-center rounded-full bg-black">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
      <path fill="currentColor" d="M12.7 2h2.6a4.5 4.5 0 0 0 4.4 4.4v2.7a7.2 7.2 0 0 1-4.4-1.5v6.7a5.8 5.8 0 1 1-5.8-5.8c.2 0 .4 0 .6.1v2.9a2.9 2.9 0 1 0 2.6 2.9z"/>
    </svg>
  </button>

</div>

          {/* PROGRESO */}
          <div className="mt-6 space-y-3">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-3 bg-green-600" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-bold text-green-600 text-lg">
                ${current.toLocaleString()}
              </span>
              <span className="text-gray-500">
                de ${goal.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="mt-6 whitespace-pre-line">
            {campaign.description}
          </p>

          {/* DONACIONES */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">💬 Últimas donaciones</h2>

            <div className="space-y-4">
              {donations.map((donation: any) => {

                const donorName =
                  donation.donor_name ||
                  donation.metadata?.donor_name ||
                  "Donador"

                const amount = Number(donation.amount || 0)

                const message =
                  donation.message ||
                  donation.metadata?.message ||
                  ""

                return (
                  <div key={donation.id} className="flex gap-3 p-3 rounded-xl border">

                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold">
                      {donorName?.[0]?.toUpperCase() || "D"}
                    </div>

                    <div className="flex-1">

                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">
                          {donorName}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="text-green-600 font-bold">
                            +${amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {message && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          “{message}”
                        </p>
                      )}

                    </div>

                  </div>
                )
              })}
            </div>
          </div>

          {/* RANKING */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">🏆 Top donadores</h2>

            {ranking.length === 0 && (
              <p className="text-gray-500 text-sm">
                Aún no hay ranking
              </p>
            )}

            <div className="space-y-3">
              {ranking.map((r: any, index: number) => {

                const medal =
                  index === 0 ? "🥇" :
                  index === 1 ? "🥈" :
                  index === 2 ? "🥉" :
                  `#${index + 1}`

                return (
                  <div key={index} className="flex justify-between p-3 border rounded-xl">
                    <span>{medal} {r.name || "Donador"}</span>
                    <span className="text-green-600 font-bold">
                      ${Number(r.total || 0).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="md:col-span-2">
          <div className="sticky top-6">
            <div className="bg-white border rounded-2xl p-6 shadow-lg space-y-4">
              <ViewersCounter campaign_id={campaign.id} />
              <DonationBox campaign_id={campaign.id} refParam={ref} />
            </div>
          </div>
        </div>

      </section>

    </main>
  )
}