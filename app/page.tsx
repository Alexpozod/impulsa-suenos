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
      <header className="flex justify-between items-center px-8 py-6 border-b bg-white sticky top-0 z-50">
        <h1 className="text-xl font-bold tracking-tight">
          ImpulsaSueños
        </h1>

        <div className="flex gap-6 items-center">
          <Link href="/winners">
            <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
              Ganadores
            </span>
          </Link>

          <Link href="/my-tickets">
            <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
              Mis tickets
            </span>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto text-center py-20 px-6">

        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Participa desde $1.000 y gana premios reales 🎁
        </h2>

        <p className="text-gray-600 text-lg mb-8">
          Sorteos en vivo • Tickets verificables • Ganadores reales
        </p>

        <Link href="#campaigns">
          <button className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-80">
            Ver campañas activas
          </button>
        </Link>

      </section>

      {/* 💡 CÓMO FUNCIONA */}
      <section className="bg-gray-50 py-16 px-6">

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">

          <div>
            <h3 className="text-lg font-semibold mb-2">
              🎟️ Compra tickets
            </h3>
            <p className="text-gray-600 text-sm">
              Participa desde montos accesibles y recibe tus números automáticamente
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              🎥 Sorteos en vivo
            </h3>
            <p className="text-gray-600 text-sm">
              Los ganadores se eligen en transmisiones en directo para total transparencia
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              🏆 Gana premios
            </h3>
            <p className="text-gray-600 text-sm">
              Si tu ticket es elegido, ganas el premio y se publica públicamente
            </p>
          </div>

        </div>

      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="max-w-6xl mx-auto px-6 py-16">

        <h2 className="text-2xl font-semibold mb-8">
          Campañas activas
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {campaigns?.map((c) => (
            <div
              key={c.id}
              className="border rounded-2xl overflow-hidden hover:shadow-lg transition bg-white"
            >

              <img
                src={c.image_url || "https://via.placeholder.com/400"}
                className="w-full h-52 object-cover"
              />

              <div className="p-5">

                <h3 className="text-lg font-semibold mb-2">
                  {c.title}
                </h3>

                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                  {c.description}
                </p>

                <p className="text-green-600 font-bold mb-4">
                  Meta: ${c.goal_amount}
                </p>

                <Link href={`/campaign/${c.id}`}>
                  <button className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80">
                    Ver campaña
                  </button>
                </Link>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* GANADORES */}
      <section className="bg-gray-50 py-16 px-6">

        <div className="max-w-4xl mx-auto">

          <div className="flex justify-between items-center mb-8">
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
            <div className="grid md:grid-cols-3 gap-6">

              {winners.map((w) => (
                <div
                  key={w.id}
                  className="bg-white border rounded-xl p-4 text-center shadow-sm"
                >

                  <p className="text-sm text-gray-500 mb-1">
                    {w.campaigns?.title || "Campaña"}
                  </p>

                  <p className="text-xl font-bold text-green-600">
                    🎟️ #{w.ticket_number}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
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

      {/* FOOTER SIMPLE */}
      <footer className="text-center text-sm text-gray-500 py-10">
        © {new Date().getFullYear()} ImpulsaSueños — Todos los derechos reservados
      </footer>

    </main>
  )
}
