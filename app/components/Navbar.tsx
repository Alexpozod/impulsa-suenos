'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "next/navigation"

export default function Navbar() {

  const [user, setUser] = useState<any>(null)
  const [unread, setUnread] = useState(0)

  const router = useRouter()

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {

    const { data } = await supabase.auth.getSession()
    const currentUser = data.session?.user || null

    setUser(currentUser)

    if (currentUser) {
      loadNotifications()
    }
  }

  /* =========================
     🔔 NOTIFICACIONES
  ========================= */
  const loadNotifications = async () => {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    if (!token) return

    try {
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      const count = (data || []).filter((n: any) => !n.read).length
      setUnread(count)

    } catch (err) {
      console.error("Error notifications:", err)
    }
  }

  /* =========================
     🔐 LOGOUT
  ========================= */
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  /* =========================
     🚀 CREAR CAMPAÑA
  ========================= */
  const handleCreateCampaign = async () => {
    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      router.push("/login")
    } else {
      router.push("/create")
    }
  }

  return (
    <nav className="w-full bg-white border-b sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="text-xl font-bold text-green-600">
          ImpulsaSueños
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">

          <Link href="/" className="hover:text-green-600">Inicio</Link>
          <Link href="/campaigns" className="hover:text-green-600">Campañas</Link>
          <Link href="/sorteos" className="hover:text-green-600">Sorteos</Link>
          <Link href="/como-funciona" className="hover:text-green-600">Cómo funciona</Link>
          <Link href="/faq" className="hover:text-green-600">FAQ</Link>

        </div>

        {/* USER */}
        <div className="flex items-center gap-4">

          {!user ? (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-green-600">
                Iniciar sesión
              </Link>

              <button
                onClick={handleCreateCampaign}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Crear campaña
              </button>
            </>
          ) : (
            <>
              {/* 🔔 NOTIFICACIONES */}
              <Link href="/dashboard/notifications" className="relative">

                <span className="text-xl">🔔</span>

                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}

              </Link>

              {/* CTA */}
              <button
                onClick={handleCreateCampaign}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Crear campaña
              </button>

              <Link href="/dashboard" className="text-sm font-medium hover:text-green-600">
                Dashboard
              </Link>

              <Link href="/account" className="text-sm font-medium hover:text-green-600">
                Mi cuenta
              </Link>

              <button
                onClick={logout}
                className="text-sm text-red-500"
              >
                Cerrar sesión
              </button>
            </>
          )}

        </div>

      </div>

    </nav>
  )
}