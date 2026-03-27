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
    .select(`*, campaigns (title)`)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: recentDonations } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <h1 className="text-xl font-extrabold text-green-600">
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
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">

        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Gana premios reales
          <br />
          <span className="text-green-600">mientras ayudas a otros</span>
        </h2>

        <p className="text-gray-600 text-lg mb-8">
          Participa en campañas, compra tickets y forma parte de sorteos
          100% verificables.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="#campaigns">
            <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg hover:scale-105">
              🎟️ Participar ahora
            </button>
          </Link>

          <Link href="/como-funciona">
            <button className="border px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition">
              Cómo funciona
            </button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          🔒 Pagos seguros con MercadoPago
        </p>

      </section>

      {/* FEED EN VIVO */}
      <div className="max-w-4xl mx-auto px-6 mb-14">
        <LiveFeed donations={recentDonations || []} />
      </div>

      {/* STATS */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-3 gap-6 text-center">

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold">
              {campaigns?.length || 0}
            </p>
            <p className="text-gray-500 text-xs uppercase">
              Campañas activas
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold">
              {winners?.length || 0}
            </p>
            <p className="text-gray-500 text-xs uppercase">
              Ganadores
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-green-600">✔</p>
            <p className="text-gray-500 text-xs uppercase">
              Pagos seguros
            </p>
          </div>

        </div>
      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="max-w-6xl mx-auto px-6 pb-20">

        <h2 className="text-2xl font-bold mb-10 flex items-center gap-2">
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
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >

                <div className="relative">
                  <img
                    src={c.image_url || "https://via.placeholder.com/400"}
                    className="w-full h-48 object-cover"
                  />

                  <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ACTIVO
                  </div>
                </div>

                <div className="p-5">

                  <h3 className="font-bold text-lg mb-2 line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-red-500 font-semibold mb-3">
                    🔥 Alta demanda
                  </p>

                  {/* PROGRESS */}
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    {Math.round(progress)}% completado
                  </p>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  <Link href={`/campaigns/${c.id}`}>
                    <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition">
                      Participar ahora
                    </button>
                  </Link>

                </div>

              </div>
            )
          })}

        </div>

      </section>

      {/* GANADORES */}
      <section className="bg-gray-100 py-20 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="flex justify-between items-center mb-10">
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

          <div className="grid md:grid-cols-3 gap-6">

            {winners?.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
              >

                <p className="text-sm text-gray-500 mb-2">
                  {w.campaigns?.title || "Campaña"}
                </p>

                <p className="text-2xl font-bold text-yellow-500">
                  🏆 Ticket #{w.ticket_number}
                </p>

                <p className="text-xs text-gray-400 mt-3">
                  {new Date(w.created_at).toLocaleString()}
                </p>

              </div>
            ))}

          </div>

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
