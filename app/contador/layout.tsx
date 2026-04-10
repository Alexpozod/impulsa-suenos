'use client'

import Link from "next/link"

export default function ContadorLayout({ children }: any) {
  return (
    <div className="flex min-h-screen bg-white text-black">

      <aside className="w-64 border-r p-4 space-y-3">
        <h2 className="font-bold text-lg">📊 Contabilidad</h2>

        <Link href="/contador">Resumen</Link>
        <Link href="/api/admin/export">Exportar CSV</Link>

      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}