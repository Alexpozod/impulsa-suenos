import DrawButton from "@/app/components/DrawButton"
import LiveDraw from "@/app/components/LiveDraw"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminCampaign({ params }: { params: { id: string } }) {

  const { id } = params

  // campaña
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  // tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("campaign_id", id)

  // donaciones
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })

  // ganador
  const { data: winner } = await supabase
    .from("winners")
    .select("*")
    .eq("campaign_id", id)
    .maybeSingle()

  const total =
    donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-6">
        {campaign?.title}
      </h1>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">Recaudado</p>
          <p className="text-2xl font-bold text-green-400">
            ${total.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">Tickets</p>
          <p className="text-2xl font-bold">
            {tickets?.length || 0}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">Estado</p>
          <p className="text-2xl font-bold text-yellow-400">
            {winner ? "FINALIZADO" : "ACTIVO"}
          </p>
        </div>

      </div>

      {/* 🎰 ANIMACIÓN SORTEO (SHOW EN VIVO) */}
      {!winner && (
        <div className="mb-10">
          <LiveDraw tickets={tickets || []} />
        </div>
      )}

      {/* 🎯 BOTÓN REAL (GUARDA EN BD) */}
      {!winner && (
        <div className="mb-10">
          <DrawButton campaignId={id} />
        </div>
      )}

      {/* 🏆 GANADOR */}
      {winner && (
        <div className="bg-green-900/40 border border-green-500 p-6 rounded-xl mb-10 text-center">
          <p className="text-sm">Ganador</p>
          <p className="text-2xl font-bold text-green-400">
            Ticket #{winner.ticket_number}
          </p>
        </div>
      )}

      {/* 💰 DONACIONES */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Últimas compras
        </h2>

        <div className="space-y-2">
          {donations?.slice(0, 10).map((d) => (
            <div
              key={d.id}
              className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-sm"
            >
              💰 ${Number(d.amount).toLocaleString()} — {d.user_email}
            </div>
          ))}
        </div>
      </div>

      {/* 🎟️ TICKETS */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Tickets generados
        </h2>

        <div className="grid md:grid-cols-4 gap-2 text-sm">
          {tickets?.slice(0, 50).map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 p-2 rounded text-center"
            >
              #{t.ticket_number}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
