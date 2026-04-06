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

  useEffect(() => {
    loadCampaign()
  }, [])

  const loadCampaign = async () => {

    const id = params?.id

    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single()

    if (!data) {
      router.push("/dashboard")
      return
    }

    setCampaign(data)
    setTitle(data.title)
    setDescription(data.description)
    setCategory(data.category)
    setPreview(data.image_url)

    setLoading(false)
  }

  const handleImage = (file: File | null) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const updateCampaign = async () => {

    setSaving(true)

    let imageUrl = campaign.image_url

    if (image) {
      const fileName = Date.now() + "-" + image.name

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

    await supabase
      .from("campaigns")
      .update({
        title,
        description,
        category,
        image_url: imageUrl
      })
      .eq("id", campaign.id)

    setSaving(false)

    router.push("/dashboard")
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">

      <h1 className="text-2xl font-bold">Editar campaña</h1>

      <input value={title} onChange={e => setTitle(e.target.value)} className="border p-2 w-full rounded" />

      <textarea value={description} onChange={e => setDescription(e.target.value)} className="border p-2 w-full rounded" />

      <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 w-full rounded">
        <option value="general">General</option>
        <option value="salud">Salud</option>
        <option value="educacion">Educación</option>
      </select>

      <input type="file" onChange={(e) => handleImage(e.target.files?.[0] || null)} />

      {preview && <img src={preview} className="h-40 w-full object-cover rounded" />}

      <button
        onClick={updateCampaign}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>

    </div>
  )
}