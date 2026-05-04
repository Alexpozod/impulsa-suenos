"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

export default function CampaignUpdatesPage() {

  const params = useParams()

  // 🔥 FIX CRÍTICO (NO MÁS [id])
  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id

  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const submit = async () => {

    if (!content.trim()) return

    // 🔒 VALIDACIÓN REAL
    if (!id || id === "[id]") {
      alert("Error: campaña inválida")
      return
    }

    setLoading(true)

    try {

      const res = await fetch("/api/campaign-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          campaign_id: id,
          content
        })
      })

      const data = await res.json()

      // 🔥 MANEJO REAL DE ERROR
      if (!res.ok) {
        console.error("ERROR API:", data)
        alert(data?.error || "Error al publicar actualización")
        return
      }

      setContent("")
      setSuccess(true)

    } catch (err) {
      console.error("ERROR FETCH:", err)
      alert("Error de conexión")
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
        className="bg-primary text-white px-4 py-2 rounded"
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