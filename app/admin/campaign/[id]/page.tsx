import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminCampaign({ params }: { params: { id: string } }) {

  const { id } = params

  /* =========================
     📊 CAMPAÑA
  ========================= */
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  /* =========================
     💰 LEDGER (FUENTE REAL)
  ========================= */
  const { data: ledger } = await supabase
    .from("financial_ledger")
    .select("amount, user_email, created_at, flow_type")
    .eq("campaign_id", id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })

  /* =========================
     💰 CÁLCULOS
  ========================= */
  let totalIn = 0
  let totalOut = 0

  ledger?.forEach((l) => {
    const amount = Number(l.amount || 0)

    if (l.flow_type === "in") {
      totalIn += amount
    } else if (l.flow_type === "out") {
      totalOut += Math.abs(amount)
    }
  })

  const balance = totalIn - totalOut

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-6">
        {campaign?.title}
      </h1>

      {/* =========================
         📊 STATS
      ========================= */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">Ingresos</p>
          <p className="text-2xl font-bold text-green-400">
            ${totalIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">Retiros</p>
          <p className="text-2xl font-bold text-red-400">
            ${totalOut.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">Balance real</p>
          <p className="text-2xl font-bold text-yellow-400">
            ${balance.toLocaleString()}
          </p>
        </div>

      </div>

      {/* =========================
         💰 ÚLTIMAS DONACIONES
      ========================= */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Últimas donaciones
        </h2>

        <div className="space-y-2">
          {ledger
            ?.filter(l => l.flow_type === "in")
            .slice(0, 10)
            .map((d, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-sm"
              >
                💰 ${Number(d.amount).toLocaleString()} — {d.user_email}
              </div>
            ))}
        </div>
      </div>

    </div>
  )
}