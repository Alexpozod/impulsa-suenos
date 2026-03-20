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

  return (
    <main className="bg-[#0B0F1A] text-white min-h-screen">

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Haz realidad sueños.{" "}
          <span className="text-indigo-500">Participa y gana.</span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Compra tickets, apoya campañas reales y participa automáticamente en sorteos con premios increíbles.
        </p>

        <div className="flex justify-center gap-4">
          <a href="#campaigns">
            <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-semibold">
              🎟️ Ver campañas
            </button>
          </a>

          <Link href="/my-tickets">
            <button className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold">
              🎫 Mis tickets
            </button>
          </Link>
        </div>

        <div className="flex justify-center gap-6 mt-6 text-sm text-gray-400 flex-wrap">
          <span>✔ Pagos seguros</span>
          <span>✔ Tickets únicos</span>
          <span>✔ Sorteos transparentes</span>
        </div>
      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Campañas activas</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {campaigns?.map((c) => {

            const progress = Math.min(
              ((c.current_amount || 0) / c.goal_amount) * 100,
              100
            )

            return (
              <div
                key={c.id}
                className="bg-[#111827] rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
              >
                {/* Imagen */}
                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">

                  <h2 className="text-lg font-semibold mb-2">
                    {c.title}
                  </h2>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  {/* progreso */}
                  <div className="text-sm mb-1">
                    ${(c.current_amount || 0).toLocaleString()} / ${c.goal_amount.toLocaleString()}
                  </div>

                  <div className="w-full bg-gray-700 h-2 rounded-full mb-4">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <Link href={`/campaign/${c.id}`}>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg">
                      Ver campaña
                    </button>
                  </Link>

                </div>

              </div>
            )
          })}

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-20">
        <h2 className="text-3xl font-bold mb-6">
          ¿Listo para participar?
        </h2>

        <Link href="/my-tickets">
          <button className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl font-semibold text-lg">
            🎟️ Ver mis tickets
          </button>
        </Link>
      </section>

    </main>
  )
}
