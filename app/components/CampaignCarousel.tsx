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
    <div className="relative w-full">

      {/* IMAGEN */}
      <img
        src={images[index]}
        className="w-full h-[420px] object-cover rounded-2xl transition-all"
        alt="campaign"
      />

      {/* FLECHAS */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full"
          >
            ›
          </button>
        </>
      )}

      {/* DOTS */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                i === index ? 'bg-black' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

    </div>
  )
}