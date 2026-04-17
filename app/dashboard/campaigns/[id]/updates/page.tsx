"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

export default function CampaignUpdatesPage() {

  const { id } = useParams()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const submit = async () => {
    if (!content.trim()) return

    setLoading(true)

    try {
      await fetch("/api/campaign-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          campaign_id: id,
          content
        })
      })

      setContent("")
      setSuccess(true)

    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">

      <h1 className="text-xl font-bold">
        Nueva actualización
      </h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe una actualización para tus donantes..."
        className="w-full border rounded-xl p-3 min-h-[120px]"
      />

      <button
        onClick={submit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Publicando..." : "Publicar"}
      </button>

      {success && (
        <p className="text-green-600 text-sm">
          ✅ Actualización publicada
        </p>
      )}

    </main>
  )
}