import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  return (

    <div style={{padding:40}}>

      <h1>ImpulsaSueños</h1>

      <h2>Campañas activas</h2>

      {campaigns?.map((campaign)=> (

        <div 
          key={campaign.id} 
          style={{
            marginBottom:30,
            border:'1px solid #ccc',
            padding:20,
            borderRadius:10
          }}
        >

          {campaign.image_url && (
            <img
              src={campaign.image_url}
              alt="imagen campaña"
              style={{
                width:'100%',
                maxWidth:400,
                borderRadius:10,
                marginBottom:10
              }}
            />
          )}

          <h3>{campaign.title}</h3>

          <p>{campaign.description}</p>

          <p><strong>Meta:</strong> ${campaign.goal_amount}</p>

          <Link href={`/campaign/${campaign.id}`}>
            Ver campaña
          </Link>

        </div>

      ))}

    </div>

  )
}