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

  const safeImage = (url: string) => {
    if (!url) return "https://via.placeholder.com/800"
    return url.replace(/\s/g, "%20")
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
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        <div className="md:col-span-2">

          <img
            src={safeImage(images[active])}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/800"
            }}
            className="w-full h-80 object-cover rounded-2xl mb-4"
          />

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {images.map((img: string, i: number) => (
              <img
                key={i}
                src={safeImage(img)}
                onClick={() => setActive(i)}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/200"
                }}
                className={`h-20 w-20 object-cover rounded cursor-pointer ${
                  i === active ? "border-2 border-green-600" : ""
                }`}
              />
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-3">
            {campaign.title}
          </h1>

          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {campaign.description}
          </p>

          <div className="mb-6">
            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 bg-green-600 rounded-full"
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

        </div>

        <div className="sticky top-6 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow border">
            <DonationBox campaign_id={campaign.id} />
          </div>
        </div>

      </div>

    </main>
  )
}