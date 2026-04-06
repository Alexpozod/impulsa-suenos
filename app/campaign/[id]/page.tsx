'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DonationBox from '@/app/components/DonationBox'

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

      if (!res.ok) {
        setCampaign(null)
        setLoading(false)
        return
      }

      const data = await res.json()

      if (!data) {
        setCampaign(null)
      } else {
        setCampaign(data)
      }

    } catch (err) {
      console.error(err)
      setCampaign(null)
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        <div className="md:col-span-2">

          <img
            src={campaign.image_url || "https://via.placeholder.com/800"}
            className="w-full h-80 object-cover rounded-2xl mb-6"
          />

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