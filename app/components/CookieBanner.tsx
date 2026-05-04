'use client'

import { useEffect, useState } from "react"

type Preferences = {
  necessary: true
  analytics: boolean
}

export default function CookieBanner() {

  const [visible, setVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [prefs, setPrefs] = useState<Preferences>({
    necessary: true,
    analytics: false
  })

  useEffect(() => {
    const saved = localStorage.getItem("cookie_preferences")
    if (!saved) {
      setVisible(true)
    }
  }, [])

  /* =========================
     💾 SAVE + COMPLIANCE
  ========================= */
  const savePreferences = async (preferences: Preferences) => {

    localStorage.setItem("cookie_preferences", JSON.stringify(preferences))

    setVisible(false)
    setShowSettings(false)

    try {
      // 🔐 REGISTRO LEGAL (NO BLOQUEA UX)
      fetch("/api/legal-consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "cookies",
          accepted: true,
          version: "v1.0"
        })
      })
    } catch (err) {
      console.error("Consent log error", err)
    }

    // 📊 FUTURO ANALYTICS
    if (preferences.analytics) {
      console.log("📊 Analytics activado")
      // aquí luego puedes cargar GA / PostHog
    }
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true
    })
  }

  const rejectOptional = () => {
    savePreferences({
      necessary: true,
      analytics: false
    })
  }

  if (!visible) return null

  return (
    <>
      {/* 🍪 BANNER */}
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl bg-white border shadow-2xl rounded-2xl p-5 z-50">

        <p className="text-sm text-gray-700 leading-relaxed">
          Usamos cookies para mejorar tu experiencia. Puedes aceptar todas o configurar tus preferencias.
        </p>

        <div className="flex flex-wrap justify-end gap-2 mt-4">

          <button
            onClick={rejectOptional}
            className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Rechazar
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Configurar
          </button>

          <button
            onClick={acceptAll}
            className="text-sm px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-semibold"
          >
            Aceptar todo
          </button>

        </div>
      </div>

      {/* ⚙️ MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

            <h2 className="text-lg font-bold mb-4">
              Configuración de cookies
            </h2>

            {/* NECESARIAS */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Cookies esenciales</p>
                <p className="text-xs text-gray-500">
                  Necesarias para el funcionamiento del sitio
                </p>
              </div>
              <input type="checkbox" checked disabled />
            </div>

            {/* ANALYTICS */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-medium">Cookies de análisis</p>
                <p className="text-xs text-gray-500">
                  Nos ayudan a mejorar la plataforma
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    analytics: e.target.checked
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={() => savePreferences(prefs)}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg"
              >
                Guardar
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  )
}