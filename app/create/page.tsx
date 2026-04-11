'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/app/components/ImageUploader'

export default function CreateCampaign() {

  const router = useRouter()

  const [loadingPage, setLoadingPage] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [tickets, setTickets] = useState('')
  const [category, setCategory] = useState('general')

  const [images, setImages] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkAccess = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      const email = data.user.email!.toLowerCase()

      const { data: kyc } = await supabase
        .from("kyc")
        .select("status")
        .eq("user_email", email)
        .maybeSingle()

      if (!kyc || kyc.status !== "approved") {
        router.push('/kyc')
        return
      }

      const { data: banks } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_email", email)
        .limit(1)

      if (!banks || banks.length === 0) {
        router.push('/account/bank')
        return
      }

      setLoadingPage(false)
    }

    checkAccess()
  }, [router])

  /* =========================
     🚀 CREAR CAMPAÑA
  ========================= */
  const createCampaign = async () => {

    setLoading(true)
    setMessage('')

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        setMessage('Debes iniciar sesión')
        return
      }

      let imageUrls: string[] = []

      for (const img of images) {

        const cleanName = img.name.replace(/\s/g, "_")
        const fileName = `campaigns/${Date.now()}-${cleanName}`

        const upload = await supabase.storage
          .from('campaign-images')
          .upload(fileName, img)

        if (!upload.error) {
          const publicUrl = supabase.storage
            .from('campaign-images')
            .getPublicUrl(fileName)

          if (publicUrl.data.publicUrl) {
            imageUrls.push(publicUrl.data.publicUrl)
          }
        }
      }

      const res = await fetch('/api/campaign/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          goal_amount: Number(goal),
          total_tickets: Number(tickets),
          image_url: imageUrls[0] || null,
          images: imageUrls,
          category
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Error creando campaña')
        return
      }

      setMessage('✅ Campaña creada correctamente')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)

    } catch (error) {
      console.error(error)
      setMessage('Error inesperado')
    }

    setLoading(false)
  }

  if (loadingPage) {
    return <div className="p-10">Cargando...</div>
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-md space-y-4">

        <h1 className="text-2xl font-bold text-center">
          Crear campaña
        </h1>

        <input
          className="w-full border p-3 rounded-lg"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-3 rounded-lg"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full border p-3 rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="general">General</option>
          <option value="salud">Salud</option>
          <option value="educacion">Educación</option>
          <option value="emergencia">Emergencia</option>
          <option value="animales">Animales</option>
        </select>

        <input
          type="number"
          placeholder="Meta ($)"
          className="w-full border p-3 rounded-lg"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <input
          type="number"
          placeholder="Tickets"
          className="w-full border p-3 rounded-lg"
          value={tickets}
          onChange={(e) => setTickets(e.target.value)}
        />

        {/* 🔥 UPLOADER PRO */}
        <ImageUploader images={images} setImages={setImages} />

        <button
          onClick={createCampaign}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          {loading ? 'Creando...' : 'Crear campaña'}
        </button>

        {message && (
          <p className="text-center text-sm">{message}</p>
        )}

      </div>

    </main>
  )
}