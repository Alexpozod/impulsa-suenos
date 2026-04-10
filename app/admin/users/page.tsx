'use client'

import { useEffect, useState } from 'react'

export default function AdminUsers() {

  const [users, setUsers] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data || [])
  }

  const updateRole = async (user_id: string, role: string) => {

    if (!confirm(`Cambiar rol a ${role}?`)) return

    setLoadingId(user_id)

    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, role })
    })

    setLoadingId(null)
    load()
  }

  return (
    <main className="p-6 bg-slate-950 text-white min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        👥 Gestión de Usuarios
      </h1>

      {users.map(u => (
        <div key={u.id} className="bg-slate-900 p-4 rounded-xl mb-3">

          <p className="font-bold">{u.email}</p>
          <p className="text-sm text-slate-400 mb-2">
            Rol actual: {u.role || "user"}
          </p>

          <div className="flex gap-2">

            <button
              onClick={() => updateRole(u.id, "admin")}
              disabled={loadingId === u.id}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Admin
            </button>

            <button
              onClick={() => updateRole(u.id, "contador")}
              disabled={loadingId === u.id}
              className="bg-blue-600 px-3 py-1 rounded"
            >
              Contador
            </button>

            <button
              onClick={() => updateRole(u.id, "user")}
              disabled={loadingId === u.id}
              className="bg-gray-600 px-3 py-1 rounded"
            >
              User
            </button>

          </div>

          {loadingId === u.id && (
            <p className="text-xs text-slate-400 mt-2">
              Actualizando...
            </p>
          )}

        </div>
      ))}

    </main>
  )
}