'use client'

import { useState } from 'react'

export default function CampaignCarousel({ images = [] }: { images: string[] }) {

  const [index, setIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <img
        src="https://via.placeholder.com/600x400"
        className="w-full h-[420px] object-cover rounded-2xl"
        alt="placeholder"
      />
    )
  }

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="w-full">

      {/* 🖼️ IMAGEN PRINCIPAL */}
      <div className="relative w-full">

        <img
          src={images[index]}
          className="w-full h-[420px] object-cover rounded-2xl transition-all duration-300"
          alt="campaign"
        />

        {/* FLECHAS */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full hover:bg-black/70 transition"
            >
              ‹
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full hover:bg-black/70 transition"
            >
              ›
            </button>
          </>
        )}

      </div>

      {/* 🔘 DOTS */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full cursor-pointer transition ${
                i === index ? 'bg-black scale-110' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* 🖼️ MINIATURAS (🔥 NUEVO) */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">

          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setIndex(i)}
              className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200
                ${i === index
                  ? 'border-green-600 scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
                }`}
            />
          ))}

        </div>
      )}

    </div>
  )
}