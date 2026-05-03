'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "next/navigation"

export default function Navbar() {

  const [user, setUser] = useState<any>(null)
  const [unread, setUnread] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  const router = useRouter()

  useEffect(() => {
    loadSession()

    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
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

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">

      <div
        className={`
          flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300
          ${scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200"
            : "bg-white/60 backdrop-blur-md border border-gray-100"
          }
        `}
      >

        {/* LOGO */}
<Link href="/" className="flex items-center">
  <img
    src="/logo.png"
    alt="ImpulsaSueños"
    className="h-26 w-auto"
  />
</Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">

          <Link href="/" className="hover:text-green-600 transition">Inicio</Link>
          <Link href="/campaigns" className="hover:text-green-600 transition">Campañas</Link>
          <Link href="/sorteos" className="hover:text-green-600 transition">Sorteos</Link>
          <Link href="/como-funciona" className="hover:text-green-600 transition">Cómo funciona</Link>
          <Link href="/faq" className="hover:text-green-600 transition">FAQ</Link>

        </div>

        {/* USER */}
        <div className="flex items-center gap-4">

          {!user ? (
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition"
            >
              Iniciar sesión
            </Link>
          ) : (
            <>
              {/* 🔔 NOTIFICACIONES */}
              <Link href="/dashboard/notifications" className="relative">

                <span className="text-lg">🔔</span>

                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}

              </Link>

              <Link href="/dashboard" className="text-sm font-medium hover:text-green-600 transition">
                Dashboard
              </Link>

              <Link href="/dashboard/account" className="text-sm font-medium hover:text-green-600 transition">
  Mi cuenta
</Link>

              <button
                onClick={logout}
                className="text-sm text-red-500 hover:opacity-80 transition"
              >
                Cerrar sesión
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  )
}