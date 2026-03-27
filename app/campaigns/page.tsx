'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CampaignsPage() {

  const [campaigns, setCampaigns] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setCampaigns(data || [])
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          🚀 Campañas activas
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          {campaigns.map((c) => {

            const percent = c.goal_amount
              ? Math.min((c.raised / c.goal_amount) * 100, 100)
              : 0

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaigns/${c.id}`)}
                className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:scale-105 transition"
              >

                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />

                <h2 className="text-lg font-bold mb-2">
                  {c.title}
                </h2>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {c.description}
                </p>

                {/* PROGRESO */}
                <div className="mb-2">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium">
                  <span>${Number(c.raised).toLocaleString()}</span>
                  <span>${Number(c.goal_amount).toLocaleString()}</span>
                </div>

              </div>
            )
          })}

        </div>

      </div>

    </main>
  )
}
