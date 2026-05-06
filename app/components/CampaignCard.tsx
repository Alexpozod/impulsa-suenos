'use client'

import Link from "next/link"
import { formatMoney } from "@/src/lib/formatMoney"

export default function CampaignCard({ campaign }: any) {

  const current = Number(campaign.current_amount || 0)
  const goal = Number(campaign.goal_amount || 0)

  const progress = goal > 0
    ? Math.min((current / goal) * 100, 100)
    : 0

  const remaining = Math.max(goal - current, 0)

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

        {/* TITLE */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {campaign.title || "Campaña"}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {campaign.description || "Sin descripción"}
        </p>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* AMOUNTS */}
        <div className="flex justify-between text-sm font-medium mb-2">

          <span className="text-green-600">
            {formatMoney(current)}
          </span>

          <span className="text-gray-500">
            de {formatMoney(goal)}
          </span>

        </div>

        {/* PROGRESS % */}
        <div className="text-xs text-gray-400 text-right mb-2">
          {progress.toFixed(0)}% completado
        </div>

        {/* REMAINING */}
        {remaining > 0 && (
          <p className="text-xs text-orange-600 font-semibold">
            💰 Faltan {formatMoney(remaining)}
          </p>
        )}

        {/* URGENCY */}
        {progress >= 80 && (
          <p className="text-xs text-red-600 font-bold mt-1">
            🚨 ¡Estamos muy cerca!
          </p>
        )}

      </div>

    </Link>
  )
}