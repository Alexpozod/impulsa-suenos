'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [kyc, setKyc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      setUser(userData.user)

      // 🎟️ Tickets
      const { data: userTickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_email', userData.user.email)
        .order('created_at', { ascending: false })

      // 💰 Donaciones
      const { data: userDonations } = await supabase
        .from('donations')
        .select('*')
        .eq('user_email', userData.user.email)
        .order('created_at', { ascending: false })

      // 🛡️ KYC
      const { data: kycData } = await supabase
        .from('kyc')
        .select('*')
        .eq('user_email', userData.user.email)
        .maybeSingle()

      setTickets(userTickets || [])
      setDonations(userDonations || [])
      setKyc(kycData || null)

      setLoading(false)
    }

    loadData()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    )
  }

  // 🎯 Estado KYC
  const kycStatus = kyc?.status || 'none'

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-2xl font-bold">
              👋 Hola, {user?.email}
            </h1>
            <p className="text-gray-500 text-sm">
              Panel de usuario
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-80"
          >
            Cerrar sesión
          </button>

        </div>

        {/* 🚨 BLOQUE KYC */}
        {kycStatus !== 'approved' && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 p-5 rounded-xl">

            <h2 className="font-bold mb-2">
              🔒 Verificación requerida
            </h2>

            {kycStatus === 'none' && (
              <p className="text-sm text-gray-600 mb-3">
                Debes verificar tu identidad para crear campañas.
              </p>
            )}

            {kycStatus === 'pending' && (
              <p className="text-sm text-gray-600 mb-3">
                Tu verificación está en revisión.
              </p>
            )}

            <button
              onClick={() => router.push('/kyc')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Completar verificación
            </button>

          </div>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">🎟️ Tickets</p>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">💰 Compras</p>
            <p className="text-2xl font-bold">{donations.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">🛡️ KYC</p>

            {kycStatus === 'approved' && (
              <p className="text-green-600 font-semibold">Verificado</p>
            )}

            {kycStatus === 'pending' && (
              <p className="text-yellow-600 font-semibold">En revisión</p>
            )}

            {kycStatus === 'none' && (
              <p className="text-red-500 font-semibold">No verificado</p>
            )}

          </div>

        </div>

        {/* 🎟️ TICKETS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-10">

          <h2 className="font-bold mb-4">🎟️ Tus tickets</h2>

          {tickets.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">

              {tickets.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-4 text-center"
                >
                  <p className="text-xs text-gray-500">
                    Ticket
                  </p>

                  <p className="text-xl font-bold">
                    #{t.ticket_number}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-400">
              Aún no tienes tickets
            </p>
          )}

        </div>

        {/* 💰 COMPRAS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-10">

          <h2 className="font-bold mb-4">💰 Compras recientes</h2>

          {donations.length > 0 ? (
            donations.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="flex justify-between border-b py-2 text-sm"
              >
                <span>Compra de tickets</span>

                <span className="font-semibold">
                  ${Number(d.amount).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">
              Sin compras aún
            </p>
          )}

        </div>

        {/* 🚀 CREAR CAMPAÑA */}
        <div className="text-center">

          {kycStatus === 'approved' ? (
            <button
              onClick={() => router.push('/create-campaign')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              🚀 Crear campaña
            </button>
          ) : (
            <button
              onClick={() => router.push('/kyc')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
            >
              🔒 Completa KYC para crear campañas
            </button>
          )}

        </div>

      </div>

    </main>
  )
}
