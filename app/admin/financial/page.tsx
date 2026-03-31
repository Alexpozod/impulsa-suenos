"use client"

import { useEffect, useState } from "react"

export default function FinancialDashboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/campaigns/enriched")
        const json = await res.json()

        setData(json || [])
      } catch (e) {
        setData([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const totalRaised = data.reduce((a, c) => a + (c.raised || 0), 0)
  const totalSpent = data.reduce((a, c) => a + (c.spent || 0), 0)
  const totalBalance = data.reduce((a, c) => a + (c.balance || 0), 0)

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Financial Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4">

        <div className="p-4 border rounded-xl">
          <p>Raised</p>
          <h2 className="text-xl font-bold">${totalRaised}</h2>
        </div>

        <div className="p-4 border rounded-xl">
          <p>Spent</p>
          <h2 className="text-xl font-bold">${totalSpent}</h2>
        </div>

        <div className="p-4 border rounded-xl">
          <p>Balance</p>
          <h2 className="text-xl font-bold">${totalBalance}</h2>
        </div>

      </div>

    </div>
  )
}
"use client"

import { useEffect, useState } from "react"

export default function FinancialDashboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/campaigns/enriched")
        const json = await res.json()

        setData(json || [])
      } catch (e) {
        setData([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const totalRaised = data.reduce((a, c) => a + (c.raised || 0), 0)
  const totalSpent = data.reduce((a, c) => a + (c.spent || 0), 0)
  const totalBalance = data.reduce((a, c) => a + (c.balance || 0), 0)

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Financial Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4">

        <div className="p-4 border rounded-xl">
          <p>Raised</p>
          <h2 className="text-xl font-bold">${totalRaised}</h2>
        </div>

        <div className="p-4 border rounded-xl">
          <p>Spent</p>
          <h2 className="text-xl font-bold">${totalSpent}</h2>
        </div>

        <div className="p-4 border rounded-xl">
          <p>Balance</p>
          <h2 className="text-xl font-bold">${totalBalance}</h2>
        </div>

      </div>

    </div>
  )
}
