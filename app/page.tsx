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
    <main className="bg-white text-gray-900 min-h-screen">

      {/* HERO */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold leading-tight mb-6">
          Aquí comienzan los sueños que sí se cumplen
        </h1>

        <p className="text-lg text-gray-500 mb-8">
          Apoya campañas reales o participa en sorteos con premios increíbles.
        </p>

        <div className="flex justify-center gap-4">
          <a href="#campaigns">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold">
              Explorar campañas
            </button>
          </a>

          <Link href="/my-tickets">
            <button className="border border-gray-300 px-8 py-3 rounded-full font-semibold">
              Ver mis tickets
            </button>
          </Link>
        </div>

      </section>

      {/* CAMPAÑAS */}
      <section id="campaigns" className="max-w-6xl mx-auto px-6 pb-20">

        <h2 className="text-2xl font-semibold mb-6">
          Campañas activas
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {campaigns?.map((c) => {

            const progress = Math.min(
              ((c.current_amount || 0) / c.goal_amount) * 100,
              100
            )

            return (
              <div key={c.id} className="border rounded-xl overflow-hidden hover:shadow-md transition">

                {/* imagen */}
                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">

                  <h3 className="font-semibold text-lg mb-2">
                    {c.title}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  {/* progreso */}
                  <div className="text-sm font-medium mb-1">
                    ${(c.current_amount || 0).toLocaleString()} recaudados
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    Meta: ${c.goal_amount.toLocaleString()}
                  </p>

                  <Link href={`/campaign/${c.id}`}>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                      Ver campaña
                    </button>
                  </Link>

                </div>

              </div>
            )
          })}

        </div>

      </section>

    </main>
  )
}
