"use client"

import { useEffect, useState } from "react"

export default function PayoutAdmin() {
  const [payouts, setPayouts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/payout/list")
      .then(r => r.json())
      .then(setPayouts)
  }, [])

  const approve = async (id: string) => {
    await fetch("/api/payout/approve", {
      method: "POST",
      body: JSON.stringify({ id })
    })

    location.reload()
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Payout Control</h1>

      {payouts.map((p) => (
        <div key={p.id} className="border p-4 mt-3 rounded-xl">
          <p>Campaign: {p.campaign_id}</p>
          <p>Amount: ${p.amount}</p>
          <p>Status: {p.status}</p>

          {p.status === "pending" && (
            <button
              onClick={() => approve(p.id)}
              className="bg-green-600 text-white px-3 py-1 rounded mt-2"
            >
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
