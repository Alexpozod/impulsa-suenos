import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { Trophy, Users } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return "hace unos segundos"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`

  return `hace ${Math.floor(seconds / 86400)} días`
}

export default async function Home() {

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
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
    .limit(1)

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          ImpulsaSueños
        </h1>

        <div className="flex gap-6 text-sm text-slate-300">
          <Link href="/winners">Ganadores</Link>
          <Link href="/my-tickets">Mis tickets</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto">

        <h2 className="text-5xl font-extrabold mb-4 leading-tight">
          Participa en sorteos reales y gana premios verificables
        </h2>

        <p className="text-slate-400 text-lg mb-6">
          Transmisiones en vivo • Tickets únicos • Resultados públicos
        </p>

        <div className="text-sm text-emerald-400 mb-6 font-semibold">
          ✔ Pagos seguros con MercadoPago
        </div>

        <Link href="#campaigns">
          <button className="bg-blue-600 px-10 py-4 rounded-xl font-semibold hover:bg-blue-500 hover:scale-105 transition shadow-lg shadow-blue-500/20">
            Participar ahora
          </button>
        </Link>

      </section>

      {/* 🔴 ACTIVIDAD REAL */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        {recentDonations && recentDonations.length > 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 text-center">
            🔴 En vivo: alguien compró ${Number(recentDonations[0].amount).toLocaleString()} {timeAgo(recentDonations[0].created_at)}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-500 text-center">
            Aún no hay actividad
          </div>
        )}
      </div>

      {/* STATS */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-3 gap-4 border-y border-slate-800 py-6 text-center">

          <div>
            <p className="text-2xl font-bold">
              {campaigns?.length || 0}
            </p>
            <p className="text-slate-500 text-xs uppercase">
              Campañas
            </p>
          </div>

          <div>
            <p className="text-2xl font-bold">
              {winners?.length || 0}
            </p>
            <p className="text-slate-500 text-xs uppercase">
              Ganadores
            </p>
          </div>

          <div>
            <p className="text-2xl font-bold">✔</p>
            <p className="text-slate-500 text-xs uppercase">
              Pagos seguros
            </p>
          </div>

        </div>
      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="max-w-6xl mx-auto px-6 pb-20">

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Users className="text-blue-500" /> Campañas activas
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {campaigns?.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="relative">
                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="w-full h-48 object-cover"
                />

                <div className="absolute top-3 left-3 bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded">
                  ACTIVO
                </div>
              </div>

              <div className="p-5">

                <h3 className="font-bold text-lg mb-1">
                  {c.title}
                </h3>

                <p className="text-xs text-red-400 font-semibold mb-2">
                  🔥 Alta demanda
                </p>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {c.description}
                </p>

                <p className="text-blue-400 font-bold mb-4">
                  Meta: ${c.goal_amount}
                </p>

                <Link href={`/campaign/${c.id}`}>
                  <button className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition">
                    Participar ahora
                  </button>
                </Link>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* GANADORES */}
      <section className="bg-slate-900 py-16 px-6">

        <div className="max-w-4xl mx-auto">

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-400" />
              Últimos ganadores
            </h2>

            <Link href="/winners">
              <span className="text-sm text-slate-400 hover:underline cursor-pointer">
                Ver todos
              </span>
            </Link>
          </div>

          {winners && winners.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">

              {winners.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center shadow-md hover:shadow-lg transition"
                >

                  <p className="text-sm text-slate-400">
                    {w.campaigns?.title || "Campaña"}
                  </p>

                  <p className="text-xl font-bold text-yellow-400">
                    🏆 Ticket ganador #{w.ticket_number}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(w.created_at).toLocaleString()}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-slate-500">
              Aún no hay ganadores
            </p>
          )}

        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-600 py-10 border-t border-slate-800">
        © {new Date().getFullYear()} ImpulsaSueños — Plataforma de sorteos y crowdfunding
      </footer>

    </main>
  )
}
