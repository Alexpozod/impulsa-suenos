'use client'

import { useEffect, useState } from 'react'

export default function AdminCampaigns() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/campaigns')
      .then(res => res.json())
      .then(setData)
  }, [])

  return (
    <div className="p-6 text-white bg-slate-950 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">🚀 Campañas</h1>

      {data.map(c => (
        <div key={c.id} className="border border-slate-800 p-4 rounded-xl mb-4">

          <p className="font-bold">{c.title}</p>
          <p className="text-sm text-slate-400">{c.description}</p>

          <p className="text-sm mt-2">
            Estado: <b>{c.status}</b>
          </p>

          <p className="text-sm">
            Recaudado: ${Number(c.total_raised || 0).toLocaleString()}
          </p>

          <a
            href={`/admin/campaign/${c.id}`}
            className="text-blue-400 text-sm mt-2 inline-block"
          >
            Ver detalle →
          </a>

        </div>
      ))}

    </div>
  )
}