'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function PaymentDetailPage() {

  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/payments?id=${id}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-10">Cargando...</div>
  }

  if (!data) {
    return <div className="p-10">No encontrado</div>
  }

  return (
    <main className="min-h-screen bg-white p-10">

      <h1 className="text-2xl font-bold mb-6">
        💳 Detalle del pago
      </h1>

      <div className="border p-6 rounded space-y-3">

        <p><b>ID:</b> {id}</p>

        <p><b>Monto:</b> ${Number(data.amount || 0).toLocaleString()}</p>

        <p><b>Estado:</b> {data.status}</p>

        <p><b>Usuario:</b> {data.user_email}</p>

        <p><b>Campaña:</b> {data.campaign_id}</p>

        <p><b>Fecha:</b> {new Date(data.created_at).toLocaleString()}</p>

      </div>

      <pre className="mt-6 bg-gray-100 p-4 rounded text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>

    </main>
  )
}   