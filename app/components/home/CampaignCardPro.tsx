'use client'

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { formatMoney } from "@/src/lib/formatMoney"

/* =========================
   🧠 TYPE SAFE
========================= */
type Campaign = {
  id: string
  title: string
  description: string
  images?: string[]
  image_url?: string
  current_amount?: number
  goal_amount?: number
  donations_count?: number
}

export default function CampaignCardPro({ c }: { c: Campaign }) {

  const router = useRouter()

  const percent = Math.min(
    (Number(c.current_amount || 0) / Number(c.goal_amount || 1)) * 100,
    100
  )

  const nearGoal = percent >= 75

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      onClick={() => router.push(`/campaign/${c.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
    >

      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">

        <img
          src={
            c.images?.[0] ||
            c.image_url ||
            "https://images.unsplash.com/photo-1593113630400-ea4288922497"
          }
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
          alt={c.title}
        />

        {nearGoal && (
          <div className="absolute top-3 left-3 bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-semibold shadow">
            🔥 Casi completada
          </div>
        )}

        {/* overlay suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col gap-4">

        <div>
          <h3 className="font-semibold text-text line-clamp-2 leading-tight">
            {c.title}
          </h3>

          <p className="text-sm text-textSoft mt-1 line-clamp-2">
            {c.description}
          </p>
        </div>

        {/* PROGRESS */}
        <div>

          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-primary">
              {formatMoney(c.current_amount || 0)}
            </span>
            <span className="text-gray-400">
              {percent.toFixed(0)}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              whileInView={{ width: `${percent}%` }}
              transition={{ duration: 1 }}
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-2">

          <span className="text-xs text-gray-400">
            {c.donations_count || 0} donaciones
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/campaign/${c.id}`)
            }}
            className="bg-primary hover:bg-primaryHover text-white text-xs px-4 py-2 rounded-full font-medium transition"
          >
            Donar
          </button>

        </div>

      </div>

    </motion.div>
  )
}