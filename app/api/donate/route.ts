import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {

  const formData = await req.formData()

  const campaign_id = formData.get('campaign_id')
  const amount = formData.get('amount')

  const { error } = await supabase
    .from('donations')
    .insert([
      {
        campaign_id,
        amount
      }
    ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/', req.url))
}
