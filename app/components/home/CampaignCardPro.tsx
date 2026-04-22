'use client'

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function CampaignCardPro({ c }: any) {

  const router = useRouter()

  const percent = Math.min(
    (Number(c.current_amount || 0) / Number(c.goal_amount || 1)) * 100,
    100
  )

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition cursor-pointer"
      onClick={() => router.push(`/campaign/${c.id}`)}
    >

      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={c.images?.[0] || c.image_url}
          className="w-full h-full object-cover"
        />

        {percent >= 75 && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-xs px-3 py-1 rounded-full font-semibold">
            🔥 Casi completada
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {c.title}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {c.description}
        </p>

        {/* PROGRESS */}
        <div className="mb-3">

          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-green-600">
              ${Number(c.current_amount || 0).toLocaleString()}
            </span>
            <span className="text-gray-500">
              {percent.toFixed(0)}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

        </div>

        <p className="text-xs text-gray-400">
          Meta: ${Number(c.goal_amount || 0).toLocaleString()}
        </p>

      </div>

    </motion.div>
  )
}