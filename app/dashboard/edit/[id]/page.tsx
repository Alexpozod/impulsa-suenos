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
  const [categories, setCategories] = useState<any[]>([])

  const [images, setImages] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])

  // 🔹 Cargar campaña
  useEffect(() => {
    loadCampaign()
  }, [])

  const loadCampaign = async () => {

    const id = Array.isArray(params?.id) ? params.id[0] : params?.id

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
    setCategory(data.category || "general")

    setPreview(data.images?.length ? data.images : [data.image_url])

    setLoading(false)
  }

  // 🔹 Cargar categorías (SIN FILTRO para no romper)
  useEffect(() => {
    const fetchCategories = async () => {

      const { data, error } = await supabase
        .from('categories')
        .select('*')

      if (error) {
        console.error("Error cargando categorías", error)
        return
      }

      setCategories(data || [])
    }

    fetchCategories()
  }, [])

  const handleImages = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    setImages(arr)
    setPreview(arr.map(f => URL.createObjectURL(f)))
  }

  const updateCampaign = async () => {

    setSaving(true)

    let imageUrls = campaign.images || []

    if (images.length > 0) {
      imageUrls = []

      for (const img of images) {
        const fileName = Date.now() + "-" + img.name

        const upload = await supabase.storage
          .from("campaign-images")
          .upload(fileName, img)

        if (!upload.error) {
          const publicUrl = supabase.storage
            .from("campaign-images")
            .getPublicUrl(fileName)

          imageUrls.push(publicUrl.data.publicUrl)
        }
      }
    }

    await fetch("/api/campaign/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: campaign.id,
        title,
        description,
        category,
        image_url: imageUrls[0],
        images: imageUrls
      })
    })

    setSaving(false)
    router.push("/dashboard")
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">

      <h1 className="text-2xl font-bold">Editar campaña</h1>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* 🔥 SELECT DINÁMICO SEGURO */}
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="border p-2 w-full rounded"
      >
        {categories.length === 0 ? (
          <option value="general">General</option>
        ) : (
          categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))
        )}
      </select>

      <input type="file" multiple onChange={(e) => handleImages(e.target.files)} />

      <div className="flex gap-2 overflow-x-auto">
        {preview.map((p, i) => (
          <img key={i} src={p} className="h-20 w-20 object-cover rounded" />
        ))}
      </div>

      <button
        onClick={updateCampaign}
        className="bg-primary text-white px-4 py-2 rounded w-full"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>

    </div>
  )
}