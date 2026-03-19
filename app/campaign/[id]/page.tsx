import DonateButton from '@/app/components/DonateButton'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  // Obtener campaña
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  // Obtener donaciones
  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data) {
    return <div>Campaña no encontrada</div>
  }

  const totalDonated =
    donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  const progress = Math.min(
    (totalDonated / data.goal_amount) * 100,
    100
  )

  return (
    <div style={{ padding: 40 }}>

      {/* IMAGEN */}
      {data.image_url && (
        <img
          src={data.image_url}
          alt="Imagen campaña"
          style={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 10,
            marginBottom: 20
          }}
        />
      )}

      <h1>{data.title}</h1>

      <p>{data.description}</p>

      <p><strong>Meta:</strong> ${data.goal_amount}</p>

      <p><strong>Recaudado:</strong> ${totalDonated}</p>

      <p><strong>Progreso:</strong> {progress.toFixed(0)}%</p>

      {/* Barra de progreso */}
      <div style={{
        width: '100%',
        height: 20,
        backgroundColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'green'
        }} />
      </div>

      {/* ✅ BOTÓN DONAR (CLIENT COMPONENT) */}
      <DonateButton campaignId={data.id} />

      {/* ÚLTIMAS DONACIONES */}
      <div style={{ marginTop: 40 }}>

        <h3>Últimas donaciones</h3>

        {donations && donations.length > 0 ? (
          donations.map((d) => (
            <p key={d.id}>
              Alguien donó ${d.amount}
            </p>
          ))
        ) : (
          <p>Aún no hay donaciones</p>
        )}

      </div>

    </div>
  )
}