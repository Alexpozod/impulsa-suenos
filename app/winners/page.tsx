import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function WinnersPage() {

  const { data: winners } = await supabase
    .from('winners')
    .select(`
      *,
      campaigns (
        title
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          🏆 Ganadores recientes
        </h1>

        {winners && winners.length > 0 ? (
          <div className="space-y-4">

            {winners.map((w) => (
              <div
                key={w.id}
                className="border rounded-xl p-4 shadow-sm"
              >

                <p className="text-sm text-gray-500">
                  Campaña
                </p>

                <p className="text-lg font-semibold">
                  {w.campaigns?.title || "Campaña"}
                </p>

                <p className="mt-2 text-green-600 font-bold">
                  🎟️ Ticket #{w.ticket_number}
                </p>

                <p className="text-xs text-gray-400 mt-1">
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

    </div>
  )
}
