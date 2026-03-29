'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "next/navigation"

export default function Navbar() {

  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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

          <Link href="/" className="hover:text-green-600">
            Inicio
          </Link>

          <Link href="/campaigns" className="hover:text-green-600">
            Campañas
          </Link>

          <Link href="/raffles" className="hover:text-green-600">
            Sorteos
          </Link>

          <Link href="/faq" className="hover:text-green-600">
            FAQ
          </Link>

        </div>

        {/* CTA / USER */}
        <div className="flex items-center gap-3">

          {!user ? (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Crear campaña
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-green-600"
              >
                Dashboard
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
