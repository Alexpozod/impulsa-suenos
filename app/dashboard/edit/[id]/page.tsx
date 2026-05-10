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

  /* =========================
     🔹 LOAD CAMPAIGN
  ========================= */
  useEffect(() => {
    loadCampaign()
    fetchCategories()
  }, [])

  const loadCampaign = async () => {

    const id = Array.isArray(params?.id)
      ? params.id[0]
      : params?.id

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      router.push("/dashboard")
      return
    }

    setCampaign(data)

    setTitle(data.title || "")
    setDescription(data.description || "")
    setCategory(data.category || "general")

    setPreview(
      data.images?.length
        ? data.images
        : data.image_url
          ? [data.image_url]
          : []
    )

    setLoading(false)
  }

  /* =========================
     🔹 CATEGORIES
  ========================= */
  const fetchCategories = async () => {

    const { data, error } = await supabase
      .from("categories")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    setCategories(data || [])
  }

  /* =========================
     🔹 HANDLE IMAGES
  ========================= */
  const handleImages = (files: FileList | null) => {

    if (!files) return

    const arr = Array.from(files)

    setImages(prev => [...prev, ...arr])

    setPreview(prev => [
      ...prev,
      ...arr.map(file => URL.createObjectURL(file))
    ])
  }

  /* =========================
     🔹 UPDATE CAMPAIGN
  ========================= */
  const updateCampaign = async () => {

    try {

      setSaving(true)

      let imageUrls = [...(campaign.images || [])]

      /* =========================
         🔥 SUBIR NUEVAS
      ========================= */
      if (images.length > 0) {

        for (const img of images) {

          const fileName = `${Date.now()}-${img.name}`

          const upload = await supabase.storage
            .from("campaign-images")
            .upload(fileName, img)

          if (upload.error) {
            console.error(upload.error)
            continue
          }

          const { data } = supabase.storage
            .from("campaign-images")
            .getPublicUrl(fileName)

          imageUrls.push(data.publicUrl)
        }
      }

      /* =========================
         🔐 TOKEN
      ========================= */
      const { data: authData } =
        await supabase.auth.getSession()

      const token =
        authData.session?.access_token

      /* =========================
         🔥 UPDATE API
      ========================= */
      const response = await fetch(
        "/api/campaign/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            id: campaign.id,
            title,
            description,
            category,
            image_url: imageUrls[0],
            images: imageUrls
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        console.error(result)

        alert(
          result.error ||
          "Error actualizando campaña"
        )

        return
      }

      router.push("/dashboard")

    } catch (err) {

      console.error(err)

      alert("Error actualizando campaña")

    } finally {

      setSaving(false)
    }
  }

  /* =========================
     🔹 LOADING
  ========================= */
  if (loading) {
    return (
      <div className="p-6">
        Cargando...
      </div>
    )
  }

  /* =========================
     🔹 UI
  ========================= */
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">

      <h1 className="text-2xl font-bold">
        Editar campaña
      </h1>

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="border p-2 w-full rounded"
      />

      <textarea
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        className="border p-2 w-full rounded"
      />

      <select
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
        className="border p-2 w-full rounded"
      >
        {categories.length === 0 ? (
          <option value="general">
            General
          </option>
        ) : (
          categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.slug}
            >
              {cat.name}
            </option>
          ))
        )}
      </select>

      <input
        type="file"
        multiple
        onChange={(e) =>
          handleImages(e.target.files)
        }
      />

      <div className="flex gap-2 overflow-x-auto">

        {preview.map((p, i) => (
          <img
            key={i}
            src={p}
            className="h-20 w-20 object-cover rounded"
          />
        ))}

      </div>

      <button
        onClick={updateCampaign}
        disabled={saving}
        className="bg-primary text-white px-4 py-2 rounded w-full"
      >
        {saving
          ? "Guardando..."
          : "Guardar cambios"}
      </button>

    </div>
  )
}