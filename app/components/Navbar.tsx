'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {

  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="w-full bg-white border-b sticky top-0 z-50 shadow-sm">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link href="/">
          <span className="text-xl font-bold text-green-600 cursor-pointer">
            ImpulsaSueños
          </span>
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex gap-6 text-sm text-gray-700">

          <Link href="/campaigns" className="hover:text-green-600">
            Campañas
          </Link>

          <Link href="/como-funciona" className="hover:text-green-600">
            Cómo funciona
          </Link>

          <Link href="/faq" className="hover:text-green-600">
            FAQ
          </Link>

        </div>

        {/* USER */}
        <div className="flex items-center gap-3">

          {user ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-semibold text-green-600"
              >
                Dashboard
              </button>

              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Ingresar
            </button>
          )}

        </div>

      </div>

    </nav>
  )
}
