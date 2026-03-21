import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-6 border-b">
        <h1 className="text-xl font-bold">
          ImpulsaSueños
        </h1>

        <div className="flex gap-4">
          <Link href="/winners">
            <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
              Ganadores
            </span>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center py-16 px-6">

        <h2 className="text-4xl font-bold mb-4">
          Participa y gana premios reales 🎁
        </h2>

        <p className="text-gray-600 mb-6">
          Compra tickets, apoya campañas y participa en sorteos transparentes
        </p>

        <Link href="#campaigns">
          <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:opacity-80">
            Ver campañas
          </button>
        </Link>

      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="px-8 mb-20">

        <h2 className="text-2xl font-semibold mb-6">
          Campañas activas
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {campaigns?.map((c) => (
            <div
              key={c.id}
              className="border rounded-2xl overflow-hidden hover:shadow-md transition"
            >

              <img
                src={c.image_url || "https://via.placeholder.com/400"}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">

                <h3 className="text-lg font-semibold">
                  {c.title}
                </h3>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {c.description}
                </p>

                <p className="mt-3 font-bold text-green-600">
                  Meta: ${c.goal_amount}
                </p>

                <Link href={`/campaign/${c.id}`}>
                  <button className="mt-4 w-full bg-black text-white p-2 rounded-lg">
                    Ver campaña
                  </button>
                </Link>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* GANADORES */}
      <section className="bg-gray-50 py-12 px-6">

        <div className="max-w-4xl mx-auto">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              🏆 Últimos ganadores
            </h2>

            <Link href="/winners">
              <span className="text-sm text-gray-500 hover:underline cursor-pointer">
                Ver todos
              </span>
            </Link>
          </div>

          {winners && winners.length > 0 ? (
            <div className="space-y-4">

              {winners.map((w) => (
                <div
                  key={w.id}
                  className="bg-white border rounded-xl p-4"
                >

                  <p className="text-sm text-gray-500">
                    {w.campaigns?.title || "Campaña"}
                  </p>

                  <p className="text-lg font-bold text-green-600">
                    🎟️ Ticket #{w.ticket_number}
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(w.created_at).toLocaleString()}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-400">
              Aún no hay ganadores
            </p>
          )}

        </div>

      </section>

    </main>
  )
}
