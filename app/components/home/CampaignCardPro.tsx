'use client'

import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CampaignCardPro({ c }: any) {

  const router = useRouter()

  const image =
    c.images?.[0] ||
    c.image_url ||
    "https://images.unsplash.com/photo-1593113630400-ea4288922497"

  const progress = Math.min(
    (Number(c.current_amount || 0) / Number(c.goal_amount || 1)) * 100,
    100
  )

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => router.push(`/campaign/${c.id}`)}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-2xl hover:shadow-green-100 transition-all duration-500 cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {c.title}
        </h3>

        <p className="text-sm text-gray-500 mb-5 line-clamp-2">
          {c.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-bold text-gray-900">
              ${Number(c.current_amount || 0).toLocaleString()}
            </span>
            <span className="text-gray-500">
              de ${Number(c.goal_amount || 0).toLocaleString()}
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {c.donations_count || 0} donantes
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/campaign/${c.id}`)
            }}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            <Heart className="w-4 h-4" />
            Donar
          </button>
        </div>
      </div>
    </motion.div>
  )
}