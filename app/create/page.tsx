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
  const [category, setCategory] = useState('general')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleImage = (file: File | null) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const createCampaign = async () => {

    setLoading(true)
    setMessage('')

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        setMessage('Debes iniciar sesión')
        setLoading(false)
        return
      }

      // VALIDACIONES
      if (!title || !description) {
        setMessage('Completa título y descripción')
        setLoading(false)
        return
      }

      if (!goal || Number(goal) <= 0) {
        setMessage('Meta inválida')
        setLoading(false)
        return
      }

      if (!tickets || Number(tickets) <= 0) {
        setMessage('Debes ingresar al menos 1 ticket')
        setLoading(false)
        return
      }

      let imageUrl = null

      // SUBIDA IMAGEN (NO BLOQUEA)
      if (image) {
        try {
          const fileName = Date.now() + "-" + image.name

          const upload = await supabase.storage
            .from('campaign-images')
            .upload(fileName, image)

          if (!upload.error) {
            const publicUrl = supabase.storage
              .from('campaign-images')
              .getPublicUrl(fileName)

            imageUrl = publicUrl?.data?.publicUrl || null
          }

        } catch (err) {
          console.error("Storage error:", err)
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
          image_url: imageUrl,
          category
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Error creando campaña')
        setLoading(false)
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

        <select
          className="w-full border p-3 rounded-lg mb-4"
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
          placeholder="Meta en dinero ($)"
          className="w-full border p-3 rounded-lg mb-4"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <input
          type="number"
          placeholder="Cantidad total de tickets"
          className="w-full border p-3 rounded-lg mb-4"
          value={tickets}
          onChange={(e) => setTickets(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => handleImage(e.target.files?.[0] || null)}
        />

        {preview && (
          <img
            src={preview}
            className="mt-3 rounded-lg h-40 object-cover w-full"
          />
        )}

        <button
          onClick={createCampaign}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-4"
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