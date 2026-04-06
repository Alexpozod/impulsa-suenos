"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

export default function EditCampaign() {

  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [campaign, setCampaign] = useState<any>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  /* =========================
     🔐 LOAD CAMPAIGN (SAFE)
  ========================= */
  useEffect(() => {
    loadCampaign()
  }, [])

  const loadCampaign = async () => {
    try {

      const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id

      if (!id) {
        router.push("/dashboard")
        return
      }

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        router.push("/dashboard")
        return
      }

      /* 🔒 VALIDAR DUEÑO */
      if (data.user_email !== userData.user.email) {
        router.push("/dashboard")
        return
      }

      setCampaign(data)
      setTitle(data.title || "")
      setDescription(data.description || "")
      setCategory(data.category || "general")
      setPreview(data.image_url || null)

    } catch (err) {
      console.error("LOAD CAMPAIGN ERROR:", err)
      router.push("/dashboard")
    }

    setLoading(false)
  }

  /* =========================
     🖼️ IMAGE
  ========================= */
  const handleImage = (file: File | null) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  /* =========================
     💾 UPDATE (PRO)
  ========================= */
  const updateCampaign = async () => {

    if (!campaign) return

    setSaving(true)

    try {

      let imageUrl = campaign.image_url

      /* 📤 SUBIR IMAGEN */
      if (image) {
        const fileName = `${Date.now()}-${image.name}`

        const upload = await supabase.storage
          .from("campaign-images")
          .upload(fileName, image)

        if (!upload.error) {
          const publicUrl = supabase.storage
            .from("campaign-images")
            .getPublicUrl(fileName)

          imageUrl = publicUrl.data.publicUrl
        }
      }

      /* 🔥 USAR API (CORRECTO) */
      const res = await fetch("/api/campaign/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: campaign.id,
          title,
          description,
          category,
          image_url: imageUrl
        })
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.error || "Error actualizando campaña")
        setSaving(false)
        return
      }

      alert("✅ Campaña actualizada correctamente")

      router.push("/dashboard")

    } catch (err) {
      console.error("UPDATE ERROR:", err)
      alert("Error inesperado")
    }

    setSaving(false)
  }

  /* =========================
     ⏳ LOADING
  ========================= */
  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">

      <h1 className="text-2xl font-bold">Editar campaña</h1>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título"
        className="border p-2 w-full rounded"
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Descripción"
        className="border p-2 w-full rounded"
      />

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="general">General</option>
        <option value="salud">Salud</option>
        <option value="educacion">Educación</option>
      </select>

      <input
        type="file"
        onChange={(e) => handleImage(e.target.files?.[0] || null)}
      />

      {preview && (
        <img
          src={preview}
          className="h-40 w-full object-cover rounded"
        />
      )}

      <button
        onClick={updateCampaign}
        disabled={saving}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>

    </div>
  )
}