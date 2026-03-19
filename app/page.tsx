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
    <main className="min-h-screen bg-gray-900 text-white p-8">

      <h1 className="text-4xl font-bold mb-10">
        ImpulsaSueños 🚀
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {campaigns?.map((c) => (
          <div
            key={c.id}
            className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition"
          >

            {/* Imagen */}
            <img
              src={c.image_url || "https://via.placeholder.com/400"}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">

              <h2 className="text-xl font-semibold">
                {c.title}
              </h2>

              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                {c.description}
              </p>

              <p className="mt-4 font-bold">
                Meta: ${c.goal_amount}
              </p>

              <Link href={`/campaign/${c.id}`}>
                <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 p-2 rounded-lg">
                  Ver campaña
                </button>
              </Link>

            </div>

          </div>
        ))}

      </div>
    </main>
  )
}
