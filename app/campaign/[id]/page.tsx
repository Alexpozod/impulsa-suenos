import DonateButton from '@/app/components/DonateButton'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  // 📌 Obtener campaña
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Campaña no encontrada
      </div>
    )
  }

  // 💰 TODAS las donaciones (no solo últimas)
  const { data: allDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('campaign_id', id)

  const totalDonated =
    allDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  // 🎟️ tickets vendidos
  const { count: ticketsSold } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', id)

  const progress = Math.min(
    (totalDonated / data.goal_amount) * 100,
    100
  )

  // 📌 últimas donaciones (solo para UI)
  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* IMAGEN */}
        <img
          src={data.image_url || "https://via.placeholder.com/800"}
          alt="Imagen campaña"
          className="w-full h-72 object-cover"
        />

        <div className="p-6">

          {/* TITULO */}
          <h1 className="text-3xl font-bold mb-3">
            {data.title}
          </h1>

          {/* DESCRIPCIÓN */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {data.description}
          </p>

          {/* 📊 PROGRESO */}
          <div className="mb-6">

            <div className="flex justify-between mb-2 text-sm">
              <span className="font-semibold text-green-400">
                ${totalDonated.toLocaleString()} recaudados
              </span>
              <span>{progress.toFixed(0)}%</span>
            </div>

            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-green-400 to-green-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Meta: ${data.goal_amount.toLocaleString()}
            </p>
          </div>

          {/* 🎟️ TICKETS (NUEVO 🔥) */}
          <div className="mb-6 bg-gray-700 p-4 rounded-xl text-center">
            <p className="text-sm text-gray-400 mb-1">
              🎟️ Tickets vendidos
            </p>
            <p className="text-2xl font-bold">
              {ticketsSold || 0} / {data.total_tickets}
            </p>
          </div>

          {/* BOTÓN */}
          <div className="mb-8">
            <DonateButton campaignId={data.id} />
          </div>

          {/* DONACIONES */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              Últimas compras
            </h3>

            {donations && donations.length > 0 ? (
              donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-gray-700 rounded-lg p-3 mb-2 text-sm"
                >
                  🎟️ Alguien compró ${Number(d.amount).toLocaleString()}
                </div>
              ))
            ) : (
              <p className="text-gray-400">
                Aún no hay compras
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
