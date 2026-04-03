'use client'

import { useEffect, useState } from "react"

export default function FinanceAdminPage() {

  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {

      const res = await fetch("/api/admin/finance")
      const data = await res.json()

      setStats(data)

    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-10">Cargando panel financiero...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          💰 Panel Financiero
        </h1>

        {/* =========================
            STATS
        ========================= */}
        <div className="grid md:grid-cols-4 gap-4">

          <Card title="Ingresos totales" value={`$${stats.totalIncome}`} />
          <Card title="Retiros" value={`$${stats.totalWithdrawals}`} />
          <Card title="Balance" value={`$${stats.balance}`} />
          <Card title="Pagos" value={stats.totalPayments} />

        </div>

        {/* =========================
            PAGOS RECIENTES
        ========================= */}
        <Section title="Pagos recientes">
          {stats.recentPayments.map((p: any, i: number) => (
            <Row key={i}>
              <span>{p.user_email}</span>
              <span>${p.amount}</span>
            </Row>
          ))}
        </Section>

        {/* =========================
            ERRORES
        ========================= */}
        <Section title="Errores recientes">
          {stats.errors.length === 0 && <p>No hay errores</p>}

          {stats.errors.map((e: any, i: number) => (
            <Row key={i}>
              <span>{e.message}</span>
            </Row>
          ))}
        </Section>

        {/* =========================
            PAYOUTS
        ========================= */}
        <Section title="Payouts recientes">
          {stats.payouts.map((p: any, i: number) => (
            <Row key={i}>
              <span>{p.campaign_id}</span>
              <span>${p.amount}</span>
              <span>{p.status}</span>
            </Row>
          ))}
        </Section>

        {/* =========================
            CONCILIACIÓN
        ========================= */}
        <Section title="Problemas de conciliación">
          {stats.issues.length === 0 && <p>Todo OK</p>}

          {stats.issues.map((i: any, idx: number) => (
            <Row key={idx}>
              <span>{i.payment_id}</span>
              <span>{i.issue_type}</span>
            </Row>
          ))}
        </Section>

      </div>

    </main>
  )
}

/* =========================
   COMPONENTES
========================= */

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  )
}

function Row({ children }: any) {
  return (
    <div className="flex justify-between text-sm border-b py-2">
      {children}
    </div>
  )
}