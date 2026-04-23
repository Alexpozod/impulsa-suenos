'use client'

import { useEffect, useState } from "react"

export default function CookieBanner() {

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem("cookies_accepted")
    if (!accepted) {
      setVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookies_accepted", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl bg-white border shadow-xl rounded-2xl p-5 z-50">

      <p className="text-sm text-gray-700 leading-relaxed">
        Utilizamos cookies para mejorar tu experiencia. 
        Al continuar navegando aceptas nuestra{" "}
        <a href="/cookies" className="text-green-600 underline">
          Política de Cookies
        </a>.
      </p>

      <div className="flex justify-end mt-4">
        <button
          onClick={acceptCookies}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold"
        >
          Aceptar
        </button>
      </div>

    </div>
  )
}