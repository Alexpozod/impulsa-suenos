'use client'

export default function ConfirmedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">

        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Cuenta confirmada
        </h1>

        <p className="text-gray-600 mb-6">
          Tu cuenta ya está activa.
          Puedes volver a la plataforma y comenzar.
        </p>

        <button
          onClick={() => window.location.href = "/login"}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Ir a iniciar sesión
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Puedes cerrar esta pestaña si ya estás dentro.
        </p>

      </div>
    </main>
  )
}