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
    return <div style={{ padding: 40 }}>Campaña no encontrada</div>
  }

  const totalDonated =
    donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  const progress = Math.min(
    (totalDonated / data.goal_amount) * 100,
    100
  )

  return (
    <div style={{
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center'
    }}>

      <div style={{
        maxWidth: 700,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: 24
      }}>

        {/* IMAGEN */}
        {data.image_url && (
          <img
            src={data.image_url}
            alt="Imagen campaña"
            style={{
              width: '100%',
              height: 300,
              objectFit: 'cover',
              borderRadius: 10,
              marginBottom: 20
            }}
          />
        )}

        {/* TITULO */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 10,
          color: '#222'
        }}>
          {data.title}
        </h1>

        {/* DESCRIPCIÓN */}
        <p style={{
          color: '#555',
          lineHeight: 1.6,
          marginBottom: 20
        }}>
          {data.description}
        </p>

        {/* PROGRESO */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontWeight: 500
          }}>
            <span>${totalDonated.toLocaleString()} recaudados</span>
            <span>{progress.toFixed(0)}%</span>
          </div>

          <div style={{
            width: '100%',
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 10,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <p style={{
            marginTop: 8,
            fontSize: 14,
            color: '#777'
          }}>
            Meta: ${data.goal_amount.toLocaleString()}
          </p>
        </div>

        {/* BOTÓN DONAR */}
        <div style={{ textAlign: 'center' }}>
          <DonateButton campaignId={data.id} />
        </div>

        {/* DONACIONES */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ marginBottom: 10 }}>Últimas donaciones</h3>

          {donations && donations.length > 0 ? (
            donations.map((d) => (
              <div key={d.id} style={{
                padding: 10,
                borderBottom: '1px solid #eee'
              }}>
                💚 Alguien donó ${Number(d.amount).toLocaleString()}
              </div>
            ))
          ) : (
            <p style={{ color: '#777' }}>Aún no hay donaciones</p>
          )}
        </div>

      </div>

    </div>
  )
}
