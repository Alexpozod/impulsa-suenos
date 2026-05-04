'use client'

import { useEffect, useState } from 'react'

export default function AdminUsers() {

  const [users, setUsers] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data || [])
    } catch (err) {
      alert("Error cargando usuarios")
    }
  }

  /* =========================
     🧑‍💼 CREAR USUARIO
  ========================= */
  const createUser = async () => {

    if (!email || !password) {
      return alert("Completa email y password")
    }

    setCreating(true)

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })

      const json = await res.json()

      if (json.error) {
        alert(json.error)
      } else {
        alert("✅ Usuario creado")
        setEmail('')
        setPassword('')
        setRole('user')
        load()
      }

    } catch {
      alert("Error creando usuario")
    }

    setCreating(false)
  }

  /* =========================
     🔄 CAMBIAR ROL
  ========================= */
  const updateRole = async (user_id: string, role: string) => {

    if (!confirm(`Cambiar rol a ${role}?`)) return

    setLoadingId(user_id)

    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, role })
      })
    } catch {
      alert("Error actualizando rol")
    }

    setLoadingId(null)
    load()
  }

  return (
    <main className="p-6 bg-slate-950 text-white min-h-screen space-y-8">

      <h1 className="text-2xl font-bold">
        👥 Gestión de Usuarios
      </h1>

      {/* =========================
          CREAR USUARIO
      ========================= */}
      <div className="bg-slate-900 p-5 rounded-xl space-y-3">

        <h2 className="font-semibold">Crear usuario</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-slate-800 outline-none"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-slate-800 outline-none"
        />

        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full p-2 rounded bg-slate-800"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="contador">Contador</option>
        </select>

        <button
          onClick={createUser}
          disabled={creating}
          className="bg-primary px-4 py-2 rounded hover:bg-primaryHover disabled:opacity-50"
        >
          {creating ? "Creando..." : "Crear usuario"}
        </button>

      </div>

      {/* =========================
          LISTA USUARIOS
      ========================= */}
      <div className="space-y-3">

        {users.length === 0 && (
          <p className="text-slate-400">
            No hay usuarios
          </p>
        )}

        {users.map(u => (
          <div key={u.id} className="bg-slate-900 p-4 rounded-xl">

            <p className="font-bold">{u.email}</p>

            <p className="text-sm text-slate-400 mb-2">
              Rol actual: {u.role || "user"}
            </p>

            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() => updateRole(u.id, "admin")}
                disabled={loadingId === u.id}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Admin
              </button>

              <button
                onClick={() => updateRole(u.id, "contador")}
                disabled={loadingId === u.id}
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Contador
              </button>

              <button
                onClick={() => updateRole(u.id, "user")}
                disabled={loadingId === u.id}
                className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
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

      </div>

    </main>
  )
}