'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function CreateCampaign() {

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [image, setImage] = useState<File | null>(null)

  const createCampaign = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    let imageUrl = null

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

    const { error } = await supabase
      .from('campaigns')
      .insert([
        {
          title,
          description,
          goal_amount: goal,
          user_id: user?.id,
          image_url: imageUrl
        }
      ])

    if (error) {
      alert(error.message)
    } else {
      alert('Campaña creada')
    }

  }

  return (

    <div style={{ padding: 40 }}>

      <h1>Crear campaña</h1>

      <input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Meta de dinero"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <br /><br />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
      />

      <br /><br />

      <button onClick={createCampaign}>
        Crear campaña
      </button>

    </div>

  )
}