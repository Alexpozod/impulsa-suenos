'use client'

import { useState } from "react"

export default function ImageUploader({
  images,
  setImages
}: {
  images: File[]
  setImages: (files: File[]) => void
}) {

  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)

    if (images.length + newFiles.length > 6) {
      alert("Máximo 6 imágenes")
      return
    }

    setImages([...images, ...newFiles])
  }

  const removeImage = (index: number) => {
    const updated = [...images]
    updated.splice(index, 1)
    setImages(updated)
  }

  const setCover = (index: number) => {
    const updated = [...images]
    const [selected] = updated.splice(index, 1)
    updated.unshift(selected)
    setImages(updated)
  }

  const onDragStart = (index: number) => {
    setDragIndex(index)
  }

  const onDrop = (index: number) => {
    if (dragIndex === null) return

    const updated = [...images]
    const dragged = updated[dragIndex]

    updated.splice(dragIndex, 1)
    updated.splice(index, 0, dragged)

    setImages(updated)
    setDragIndex(null)
  }

  return (
    <div className="space-y-4">

      <label className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:border-green-500 transition block">
        <p className="text-gray-500">
          📸 Arrastra o selecciona imágenes
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>

      <div className="grid grid-cols-3 gap-3">

        {images.map((img, i) => {
          const preview = URL.createObjectURL(img)

          return (
            <div
              key={i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="relative group"
            >

              <img
                src={preview}
                className="h-28 w-full object-cover rounded-lg"
              />

              {i === 0 && (
                <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Portada
                </span>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition">

                <button
                  onClick={() => setCover(i)}
                  className="bg-white text-black px-2 py-1 text-xs rounded"
                >
                  Portada
                </button>

                <button
                  onClick={() => removeImage(i)}
                  className="bg-red-600 text-white px-2 py-1 text-xs rounded"
                >
                  Eliminar
                </button>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}