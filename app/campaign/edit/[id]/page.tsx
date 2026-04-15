'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'

export default function EditCampaign() {

  const { id } = useParams()
  const router = useRouter()

  const [campaign, setCampaign] = useState<any>(null)
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) load()
  }, [id])

  const load = async () => {
    try {
      const res = await fetch(`/api/campaign/${id}`)
      const data = await res.json()
      setCampaign(data)
    } catch (err) {
      console.error(err)
    }
  }

  const save = async () => {

    setLoading(true)

    try {

      // 🧠 mantener imágenes existentes sin duplicar
      let imageUrls: string[] = Array.isArray(campaign.images)
        ? [...campaign.images]
        : campaign.image_url
          ? [campaign.image_url]
          : []

      for (const img of images) {

        const cleanName = img.name.replace(/\s/g, "_")
        const fileName = `campaigns/${Date.now()}-${cleanName}`

        const upload = await supabase.storage
          .from('campaign-images')
          .upload(fileName, img)

        if (!upload.error) {

          const { data } = supabase.storage
            .from('campaign-images')
            .getPublicUrl(fileName)

          if (data.publicUrl && !imageUrls.includes(data.publicUrl)) {
            imageUrls.push(data.publicUrl)
          }
        }
      }

      await fetch(`/api/campaign/update`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          images: imageUrls,
          image_url: imageUrls[0] || null
        })
      })

      router.push(`/campaign/${id}`)

    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  if (!campaign) return <div className="p-10">Cargando...</div>

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">

      <h1 className="text-xl font-bold">Editar campaña</h1>

      <ImageUploader images={images} setImages={setImages} />

      <button
        onClick={save}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

    </main>
  )
}