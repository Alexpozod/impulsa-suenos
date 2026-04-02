export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Cuenta</h1>
          <p className="text-gray-600 mt-2">
            Administra tu perfil, seguridad, campañas y pagos
          </p>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* PERFIL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">👤 Perfil</h2>
            <div className="flex flex-col gap-3">

              <a
                href="/dashboard"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                📊 Ver mi dashboard
              </a>

              <a
                href="/my-tickets"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                🎟️ Mis tickets
              </a>

            </div>
          </div>

          {/* SEGURIDAD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">🔐 Seguridad</h2>
            <div className="flex flex-col gap-3">

              <a
                href="/kyc"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                🪪 Verificar identidad (KYC)
              </a>

              <a
                href="/recover"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                🔑 Cambiar contraseña
              </a>

            </div>
          </div>

          {/* FINANZAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">💰 Finanzas</h2>
            <div className="flex flex-col gap-3">

              <a
                href="/account/bank"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                🏦 Datos bancarios
              </a>

              <a
                href="/admin/financial"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                📊 Movimientos financieros
              </a>

              <a
                href="/admin/payouts"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                💸 Retiros
              </a>

            </div>
          </div>

          {/* CAMPAÑAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">🚀 Campañas</h2>
            <div className="flex flex-col gap-3">

              <a
                href="/create"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                ➕ Crear campaña
              </a>

              <a
                href="/dashboard"
                className="p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                📊 Mis campañas
              </a>

            </div>
          </div>

        </div>

        {/* INFO FINAL */}
        <div className="mt-10 text-sm text-gray-500 text-center">
          Plataforma segura • ImpulsaSueños
        </div>

      </div>
    </div>
  )
}