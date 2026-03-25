export const dynamic = "force-dynamic"

import Notifications from "./components/Notifications"
import LiveFeed from "./components/LiveFeed"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { Trophy, Users } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {

  const { data: campaigns } = await supabase
  .from("campaigns")
  .select("*")
  .eq("status", "active")
  .order("created_at", { ascending: false })

  const { data: winners } = await supabase
    .from("winners")
    .select(`
      *,
      campaigns (
        title
      )
    `)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: recentDonations } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6 border-b bg-white sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-green-600">
          ImpulsaSueños
        </h1>

        <div className="flex gap-6 text-sm text-gray-700">
          <Link href="/como-funciona">Cómo funciona</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/winners">Ganadores</Link>
          <Link href="/my-tickets">Mis tickets</Link>
          <Link href="/login" className="font-semibold text-green-600">
            Ingresar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto">

        <h2 className="text-5xl font-bold mb-6 leading-tight">
          Gana premios reales
          <br />
          <span className="text-green-600">mientras ayudas a otros</span>
        </h2>

        <p className="text-gray-600 text-lg mb-6">
          Compra tickets, participa en sorteos verificables y apoya causas reales.
        </p>

        <div className="text-sm text-green-600 mb-6 font-semibold">
          ✔ Pagos seguros con MercadoPago
        </div>

        <Link href="#campaigns">
          <button className="bg-green-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-green-700 hover:scale-105 transition shadow-md">
            🎟️ Participar ahora
          </button>
        </Link>

      </section>

      {/* FEED EN VIVO */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <LiveFeed donations={recentDonations || []} />
      </div>

      {/* STATS */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-3 gap-4 border-y py-6 text-center">

          <div>
            <p className="text-3xl font-bold">
              {campaigns?.length || 0}
            </p>
            <p className="text-gray-500 text-xs uppercase">
              Campañas
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold">
              {winners?.length || 0}
            </p>
            <p className="text-gray-500 text-xs uppercase">
              Ganadores
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-green-600">✔</p>
            <p className="text-gray-500 text-xs uppercase">
              Pagos seguros
            </p>
          </div>

        </div>
      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="max-w-6xl mx-auto px-6 pb-20">

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Users className="text-green-600" /> Campañas activas
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {campaigns?.map((c) => {

            const progress = Math.min(
              ((c.current_amount || 0) / c.goal_amount) * 100,
              100
            )

            return (
              <div
                key={c.id}
                className="bg-white border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition"
              >

                <div className="relative">
                  <img
                    src={c.image_url || "https://via.placeholder.com/400"}
                    className="w-full h-48 object-cover"
                  />

                  <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                    ACTIVO
                  </div>
                </div>

                <div className="p-5">

                  <h3 className="font-bold text-lg mb-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-red-500 font-semibold mb-2">
                    🔥 Alta demanda
                  </p>

                  {/* PROGRESS */}
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    {Math.round(progress)}% completado
                  </p>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  <Link href={`/campaign/${c.id}`}>
                    <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                      Participar ahora
                    </button>
                  </Link>

                </div>

              </div>
            )
          })}

        </div>

      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white py-16 px-6 text-center">

        <h2 className="text-2xl font-bold mb-10">
          ¿Cómo funciona?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-sm">

          <div>
            <p className="text-lg font-bold mb-2">🎟️ Compra tickets</p>
            <p className="text-gray-500">Elige una campaña y participa fácilmente</p>
          </div>

          <div>
            <p className="text-lg font-bold mb-2">🎯 Participa</p>
            <p className="text-gray-500">Cada ticket es una oportunidad de ganar</p>
          </div>

          <div>
            <p className="text-lg font-bold mb-2">🏆 Gana premios</p>
            <p className="text-gray-500">Resultados públicos y verificables</p>
          </div>

        </div>

      </section>

      {/* GANADORES */}
      <section className="bg-gray-100 py-16 px-6">

        <div className="max-w-4xl mx-auto">

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Últimos ganadores
            </h2>

            <Link href="/winners">
              <span className="text-sm text-gray-500 hover:underline cursor-pointer">
                Ver todos
              </span>
            </Link>
          </div>

          {winners && winners.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">

              {winners.map((w) => (
                <div
                  key={w.id}
                  className="bg-white border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition"
                >

                  <p className="text-sm text-gray-500">
                    {w.campaigns?.title || "Campaña"}
                  </p>

                  <p className="text-xl font-bold text-yellow-500">
                    🏆 Ticket #{w.ticket_number}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(w.created_at).toLocaleString()}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">
              Aún no hay ganadores
            </p>
          )}

        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-500 py-10 border-t bg-white">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
        </div>

        © {new Date().getFullYear()} ImpulsaSueños
      </footer>

      {/* NOTIFICACIONES */}
      <Notifications donations={recentDonations || []} />

    </main>
  )
}
