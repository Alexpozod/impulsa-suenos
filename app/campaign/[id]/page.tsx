import LiveWinner from "@/app/components/LiveWinner"
import Countdown from '@/app/components/Countdown'
import DonateButton from '@/app/components/DonateButton'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        Campaña no encontrada
      </div>
    )
  }

  // 💰 total recaudado
  const { data: allDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('campaign_id', id)

  const totalDonated =
    allDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  // 🎟️ tickets
  const { count: ticketsSold } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', id)

  const progress = Math.min(
    (totalDonated / data.goal_amount) * 100,
    100
  )

  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  // 🏆 ganador
  const { data: winner } = await supabase
    .from('winners')
    .select('*')
    .eq('campaign_id', id)
    .maybeSingle()

  const isExpired =
    data.end_date && new Date(data.end_date) < new Date()

  const soldOut =
    (ticketsSold || 0) >= data.total_tickets

  const isFinished = isExpired || soldOut || winner

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        {/* IZQUIERDA */}
        <div className="md:col-span-2">

          <h1 className="text-3xl font-bold mb-4">
            {data.title}
          </h1>

          <img
            src={data.image_url || "https://via.placeholder.com/800"}
            className="w-full h-96 object-cover rounded-2xl mb-6 shadow"
          />

          {data.end_date && (
            <div className="mb-6">
              <Countdown endDate={data.end_date} />
            </div>
          )}

          <p className="text-gray-600 leading-relaxed">
            {data.description}
          </p>

          {/* actividad */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">
              Actividad reciente
            </h3>

            {donations && donations.length > 0 ? (
              donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border rounded-xl p-3 mb-2 text-sm shadow-sm"
                >
                  🎟️ Compra de ${Number(d.amount).toLocaleString()}
                </div>
              ))
            ) : (
              <p className="text-gray-400">
                Aún no hay compras
              </p>
            )}
          </div>

        </div>

        {/* DERECHA (MODO CONFIANZA BANCARIA) */}
        <div className="bg-white border rounded-2xl p-6 h-fit shadow-xl">

          {/* 💰 MONTO */}
          <div className="mb-4">
            <div className="text-3xl font-extrabold text-green-600">
              ${totalDonated.toLocaleString()}
            </div>

            <div className="text-gray-500 text-sm">
              recaudados de ${data.goal_amount.toLocaleString()}
            </div>
          </div>

          {/* 📊 PROGRESO */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-sm text-gray-500 mb-6">
            🎟️ {ticketsSold || 0} / {data.total_tickets} tickets vendidos
          </div>

          {/* 🏆 GANADOR */}
          {winner && (
            <div className="bg-green-100 border border-green-300 p-4 rounded-xl mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">
                🏆 Ganador confirmado
              </p>

              <p className="text-xl font-bold text-green-700">
                Ticket #{winner.ticket_number}
              </p>

              {/* animación / efecto */}
              <LiveWinner campaignId={data.id} />
            </div>
          )}

          {/* 🔘 BOTÓN / BLOQUEO */}
          {isFinished ? (
            <div className="bg-gray-200 text-gray-700 p-3 rounded-xl text-center font-semibold">
              Sorteo finalizado
            </div>
          ) : (
            <DonateButton campaignId={data.id} />
          )}

          {/* 🔒 CONFIANZA PRO */}
          <div className="mt-6 border-t pt-4 space-y-2 text-sm text-gray-600">

            <p>🔒 Pagos protegidos con MercadoPago</p>
            <p>🎟️ Tickets asignados automáticamente</p>
            <p>🎥 Sorteo en vivo (Instagram / TikTok)</p>
            <p>🧾 Resultados públicos y verificables</p>

          </div>

          {/* 🚨 URGENCIA */}
          {!isFinished && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-xs text-yellow-800 text-center">
              ⚠️ Alta demanda — quedan pocos tickets disponibles
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
