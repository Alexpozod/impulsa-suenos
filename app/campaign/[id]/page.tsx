import LiveWinner from "@/app/components/LiveWinner"
import Countdown from "@/app/components/Countdown"
import DonateButton from "@/app/components/DonateButton"
import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 correcto para evitar RLS issues
)

export default async function CampaignPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  // =========================
  // 🔍 CAMPAÑA (FIX ROBUSTO)
  // =========================
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  console.log("DEBUG CAMPAIGN:", { campaign, error })

  if (error || !campaign) {
    return notFound()
  }

  // =========================
  // 💰 DONACIONES
  // =========================
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  // =========================
  // 🎟️ TICKETS
  // =========================
  const { count: ticketsSold } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id)

  const totalDonated =
    donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  const progress = Math.min(
    (totalDonated / campaign.goal_amount) * 100,
    100
  )

  // =========================
  // 🏆 WINNER
  // =========================
  const { data: winner } = await supabase
    .from("winners")
    .select("*")
    .eq("campaign_id", id)
    .maybeSingle()

  // =========================
  // 🔥 ESTADOS
  // =========================
  const isExpired =
    campaign.end_date && new Date(campaign.end_date) < new Date()

  const soldOut =
    campaign.total_tickets
      ? (ticketsSold || 0) >= campaign.total_tickets
      : false

  const isFinished = isExpired || soldOut || !!winner

  const remainingTickets = campaign.total_tickets
    ? campaign.total_tickets - (ticketsSold || 0)
    : null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        {/* IZQUIERDA */}
        <div className="md:col-span-2">

          <h1 className="text-4xl font-extrabold mb-4">
            {campaign.title}
          </h1>

          <img
            src={campaign.image_url || "https://via.placeholder.com/800"}
            className="w-full h-96 object-cover rounded-2xl mb-6 shadow-md"
          />

          {!isFinished && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 text-red-700 text-sm font-semibold">
              {remainingTickets !== null ? (
                <>⚠️ Quedan solo {remainingTickets} tickets</>
              ) : (
                <>🔥 Alta demanda en esta campaña</>
              )}
            </div>
          )}

          {campaign.end_date && (
            <div className="mb-6">
              <Countdown endDate={campaign.end_date} />
            </div>
          )}

          <p className="text-gray-700 text-lg">
            {campaign.description}
          </p>

          {/* ACTIVIDAD */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">
              Actividad reciente
            </h3>

            {donations?.length ? (
              donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border rounded-xl p-3 mb-2 text-sm shadow-sm"
                >
                  🎟️ {d.user_email?.slice(0, 4)}*** compró $
                  {Number(d.amount).toLocaleString()}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Aún no hay compras</p>
            )}
          </div>

        </div>

        {/* DERECHA */}
        <div className="bg-white border rounded-2xl p-6 h-fit shadow-xl sticky top-24">

          <div className="text-center mb-6">
            <div className="text-4xl font-extrabold text-green-600">
              ${totalDonated.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm">
              de ${campaign.goal_amount.toLocaleString()}
            </div>
          </div>

          <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
            <div
              className="bg-green-600 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center text-sm text-gray-600 mb-4">
            🎟️ {ticketsSold || 0} / {campaign.total_tickets || "∞"}
          </div>

          {winner && (
            <div className="bg-green-100 border p-4 rounded-xl mb-6 text-center">
              🏆 Ganador: #{winner.ticket_number}
              <LiveWinner campaignId={campaign.id} />
            </div>
          )}

          {isFinished ? (
            <div className="bg-gray-200 p-4 rounded-xl text-center">
              Sorteo finalizado
            </div>
          ) : (
            <DonateButton campaignId={campaign.id} />
          )}

        </div>

      </div>
    </div>
  )
}
