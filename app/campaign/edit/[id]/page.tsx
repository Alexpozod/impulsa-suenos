'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'

export default function EditCampaign() {

  const { id } = useParams()
  const router = useRouter()

  const [campaign, setCampaign] = useState<any>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) load()
  }, [id])

  const load = async () => {
  try {

    const res = await fetch(`/api/campaign/${id}`)
    const data = await res.json()

    setCampaign(data)

    setExistingImages(
      Array.isArray(data.images)
        ? data.images
        : data.image_url
          ? [data.image_url]
          : []
    )

  } catch (err) {
    console.error(err)
  }
}

  const save = async () => {

  setLoading(true)

  try {

    const { data: sessionData } =
      await supabase.auth.getSession()

    const token =
      sessionData?.session?.access_token

    if (!token) {

      alert("Debes iniciar sesión")

      setLoading(false)

      return
    }

    // 🧠 mantener imágenes existentes
    let imageUrls: string[] = [...existingImages]

    // 📸 subir nuevas imágenes
    for (const img of newImages) {

      const cleanName =
        img.name.replace(/\s/g, "_")

      const fileName =
        `campaigns/${Date.now()}-${cleanName}`

      const upload = await supabase.storage
        .from('campaign-images')
        .upload(fileName, img)

      if (upload.error) {

        console.error(upload.error)

        continue
      }

      const { data } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(fileName)

      if (
        data.publicUrl &&
        !imageUrls.includes(data.publicUrl)
      ) {
        imageUrls.push(data.publicUrl)
      }
    }

    // 💾 guardar campaña
    const res = await fetch(
      `/api/campaign/update`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
       body: JSON.stringify({
          id,

          title: campaign.title,
          description: campaign.description,

          images: imageUrls,
          image_url: imageUrls[0] || null
        })
      }
    )

    const result = await res.json()

    console.log(result)

    if (!res.ok) {

      alert(result.error || "Error guardando")

      setLoading(false)

      return
    }

    router.push(`/campaign/${id}`)

  } catch (error) {

    console.error(error)

    alert("Error inesperado")
  }

  setLoading(false)
}

  if (!campaign) return <div className="p-10">Cargando...</div>

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">

      <h1 className="text-xl font-bold">Editar campaña</h1>

      <ImageUploader
  images={newImages}
  setImages={setNewImages}
  existingImages={existingImages}
  setExistingImages={setExistingImages}
/>

      <button
        onClick={save}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

    </main>
  )
}