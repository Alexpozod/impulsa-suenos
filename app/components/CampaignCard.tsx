'use client'

import Link from "next/link"

export default function CampaignCard({ campaign }: any) {

  const progress = campaign.goal_amount
    ? Math.min(
        (campaign.current_amount / campaign.goal_amount) * 100,
        100
      )
    : 0

  return (
    <Link
      href={`/campaign/${campaign.id}`}
      className="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >

      {/* IMAGE */}
      <div className="h-48 bg-gray-200">
        {campaign.image_url ? (
          <img
            src={campaign.image_url}
            alt="campaign"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* CONTENT */}
      <div className="p-4">

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {campaign.title || "Campaña"}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {campaign.description || "Sin descripción"}
        </p>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* AMOUNTS */}
        <div className="flex justify-between text-sm font-medium">

          <span className="text-green-600">
            ${campaign.current_amount || 0}
          </span>

          <span className="text-gray-500">
            de ${campaign.goal_amount || 0}
          </span>

        </div>

        {/* EXTRA */}
        {campaign.has_raffle && (
          <div className="mt-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            🎁 Incluye sorteo
          </div>
        )}

      </div>

    </Link>
  )
}