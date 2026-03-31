'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateCampaign() {

  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [tickets, setTickets] = useState('')
  const [image, setImage] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createCampaign = async () => {

    setLoading(true)
    setMessage('')

    // 🔐 SESIÓN REAL
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session
    const user = session?.user
    const token = session?.access_token

    if (!user?.email || !token) {
      setMessage('Debes iniciar sesión')
      setLoading(false)
      return
    }

    let imageUrl = null

    // 📸 SUBIR IMAGEN
    if (image) {
      const fileName = Date.now() + "-" + image.name

      const { error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, image)

      if (!uploadError) {
        const { data } = supabase.storage
          .from('campaign-images')
          .getPublicUrl(fileName)

        imageUrl = data.publicUrl
      }
    }

    // 🚀 API (SIN user_email + CON TOKEN)
    const res = await fetch('/api/campaign/create', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // 🔥 CLAVE PRO
      },
      body: JSON.stringify({
        title,
        description,
        goal_amount: Number(goal),
        total_tickets: Number(tickets),
        image_url: imageUrl
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'Error creando campaña')
    } else {
      setMessage('✅ Campaña creada')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Crear campaña
        </h1>

        <input
          placeholder="Título"
          className="w-full border p-3 rounded-lg mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Descripción"
          className="w-full border p-3 rounded-lg mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Meta en dinero ($)"
          className="w-full border p-3 rounded-lg mb-4"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <input
          placeholder="Cantidad total de tickets"
          className="w-full border p-3 rounded-lg mb-4"
          value={tickets}
          onChange={(e) => setTickets(e.target.value)}
        />

        <input
          type="file"
          className="mb-4"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button
          onClick={createCampaign}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? 'Creando...' : 'Crear campaña'}
        </button>

        {message && (
          <p className="text-center text-sm mt-4 text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}
