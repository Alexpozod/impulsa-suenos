"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LiveWinner({ campaignId }: { campaignId: string }) {

  const [winner, setWinner] = useState<any>(null)

  useEffect(() => {

    // cargar ganador inicial
    const loadWinner = async () => {
      const { data } = await supabase
        .from("winners")
        .select("*")
        .eq("campaign_id", campaignId)
        .maybeSingle()

      if (data) setWinner(data)
    }

    loadWinner()

    // escuchar cambios en tiempo real
    const channel = supabase
      .channel("realtime-winner")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "winners",
        },
        (payload) => {
          if (payload.new.campaign_id === campaignId) {
            setWinner(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [campaignId])

  if (!winner) return null

  return (
    <div className="bg-green-500/10 border border-green-500 rounded-xl p-6 text-center mb-6 animate-pulse">

      <p className="text-sm text-green-400 mb-1">
        🟢 Ganador en vivo
      </p>

      <p className="text-2xl font-bold text-green-300">
        🎟️ Ticket #{winner.ticket_number}
      </p>

    </div>
  )
}
