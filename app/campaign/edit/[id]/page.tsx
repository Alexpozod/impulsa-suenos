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
    load()
  }, [])

  const load = async () => {
    const res = await fetch(`/api/campaign/${id}`)
    const data = await res.json()
    setCampaign(data)
  }

  const save = async () => {

    setLoading(true)

    let imageUrls: string[] = campaign.images || []

    for (const img of images) {
      const fileName = `campaigns/${Date.now()}-${img.name}`

      const upload = await supabase.storage
        .from('campaign-images')
        .upload(fileName, img)

      if (!upload.error) {
        const url = supabase.storage
          .from('campaign-images')
          .getPublicUrl(fileName)

        if (url.data.publicUrl) {
          imageUrls.push(url.data.publicUrl)
        }
      }
    }

    await fetch(`/api/campaign/update`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        images: imageUrls,
        image_url: imageUrls[0]
      })
    })

    router.push(`/campaign/${id}`)
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