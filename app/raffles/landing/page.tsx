import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function LandingPage() {

  const { data } =
    await supabase
      .schema("raffles")
      .from("public_site_settings")
      .select("*")
      .eq(
        "id",
        "00000000-0000-0000-0000-000000000001"
      )
      .single()

  return (

    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

      <div className="max-w-2xl w-full px-6 text-center">

        <h1 className="text-5xl font-black">
          {data?.title}
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          {data?.subtitle}
        </p>

        <p className="mt-8 text-slate-400 whitespace-pre-line">
          {data?.description}
        </p>

      </div>

    </div>

  )

}