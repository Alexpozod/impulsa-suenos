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
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] text-white">
        Campaña no encontrada
      </div>
    )
  }

  const { data: allDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('campaign_id', id)

  const totalDonated =
    allDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

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

  const isExpired =
    data.end_date && new Date(data.end_date) < new Date()

  const soldOut =
    (ticketsSold || 0) >= data.total_tickets

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* IZQUIERDA */}
        <div>
          <img
            src={data.image_url || "https://via.placeholder.com/800"}
            className="w-full h-80 object-cover rounded-2xl mb-6"
          />

          <h1 className="text-3xl font-bold mb-4">
            {data.title}
          </h1>

          {data.end_date && (
            <Countdown endDate={data.end_date} />
          )}

          <p className="text-gray-400 mt-4 leading-relaxed">
            {data.description}
          </p>

          {/* últimas compras */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">
              Últimas compras
            </h3>

            {donations && donations.length > 0 ? (
              donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#111827] rounded-lg p-3 mb-2 text-sm"
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

        {/* DERECHA */}
        <div className="bg-[#111827] p-6 rounded-2xl h-fit">

          <div className="mb-4">
            <div className="text-xl font-semibold text-green-400">
              ${totalDonated.toLocaleString()}
            </div>
            <div className="text-gray-400">
              Meta: ${data.goal_amount.toLocaleString()}
            </div>
          </div>

          <div className="w-full bg-gray-700 h-3 rounded-full mb-6">
            <div
              className="bg-indigo-500 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-6 text-sm text-gray-400">
            🎟️ {ticketsSold || 0} / {data.total_tickets} tickets
          </div>

          {/* botón */}
          <div className="mb-6">
            {isExpired ? (
              <div className="bg-red-700 p-4 rounded-xl text-center font-bold">
                ⛔ Campaña finalizada
              </div>
            ) : soldOut ? (
              <div className="bg-yellow-600 p-4 rounded-xl text-center font-bold">
                🎟️ Tickets agotados
              </div>
            ) : (
              <DonateButton campaignId={data.id} />
            )}
          </div>

          {/* confianza */}
          <div className="text-sm text-gray-400">
            ✔ Pago seguro con MercadoPago <br />
            ✔ Tickets enviados automáticamente <br />
            ✔ Participación garantizada
          </div>

        </div>

      </div>

    </div>
  )
}
