import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("landing_leads")
      .select(
        "email, created_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )

  if (error) {

    return new Response(
      "Error",
      {
        status: 500
      }
    )

  }

  const rows = [

    "Email,Fecha",

    ...(data ?? []).map(

      lead =>

        `"${lead.email}","${lead.created_at}"`

    )

  ]

  return new Response(

    rows.join("\n"),

    {

      headers: {

        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          'attachment; filename="landing-leads.csv"'

      }

    }

  )

}