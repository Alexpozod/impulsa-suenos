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

  return (
    <div className="min-h-screen bg-white text-gray-900 py-10 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        {/* IZQUIERDA */}
        <div className="md:col-span-2">

          <h1 className="text-3xl font-bold mb-4">
            {data.title}
          </h1>

          <img
            src={data.image_url || "https://via.placeholder.com/800"}
            className="w-full h-96 object-cover rounded-xl mb-6"
          />

          {data.end_date && (
            <div className="mb-6">
              <Countdown endDate={data.end_date} />
            </div>
          )}

          <p className="text-gray-600 leading-relaxed">
            {data.description}
          </p>

          {/* últimas compras */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">
              Actividad reciente
            </h3>

            {donations && donations.length > 0 ? (
              donations.map((d) => (
                <div
                  key={d.id}
                  className="border rounded-lg p-3 mb-2 text-sm"
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

        {/* DERECHA */}
        <div className="border rounded-xl p-6 h-fit shadow-sm">

          <div className="mb-4">
            <div className="text-2xl font-bold text-green-600">
              ${totalDonated.toLocaleString()}
            </div>

            <div className="text-gray-500 text-sm">
              recaudados de ${data.goal_amount.toLocaleString()}
            </div>
          </div>

          {/* barra */}
          <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-sm text-gray-500 mb-6">
            🎟️ {ticketsSold || 0} / {data.total_tickets} tickets vendidos
          </div>

          {/* 🏆 GANADOR */}
          {winner && (
            <div className="bg-green-100 border border-green-300 p-4 rounded-lg mb-6 text-center">
              <p className="text-sm text-gray-600">🏆 Ganador</p>
              <p className="text-xl font-bold text-green-700">
                Ticket #{winner.ticket_number}
              </p>
            </div>
          )}

          {/* botón */}
          {isExpired ? (
            <div className="bg-red-500 text-white p-3 rounded-lg text-center font-semibold">
              Campaña finalizada
            </div>
          ) : soldOut ? (
            <div className="bg-yellow-400 p-3 rounded-lg text-center font-semibold">
              Tickets agotados
            </div>
          ) : (
            <DonateButton campaignId={data.id} />
          )}

          {/* confianza */}
          <div className="mt-6 text-sm text-gray-500">
            ✔ Pago seguro con MercadoPago <br />
            ✔ Tickets automáticos <br />
            ✔ Participación garantizada
          </div>

        </div>

      </div>

    </div>
  )
}
