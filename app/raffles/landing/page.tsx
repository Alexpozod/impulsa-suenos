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

      <div className="max-w-3xl w-full px-6 text-center">

        <img

  src="/favicon-removebg-preview.png"

  alt="ImpulsaSueños"

  className="w-24 h-24 mx-auto mb-8"

/>

<h1 className="text-5xl md:text-6xl font-black">
          {data?.title}
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          {data?.subtitle}
        </p>

        <p className="mt-8 text-slate-400 whitespace-pre-line">
          {data?.description}
        </p>

        {data?.show_button && (

        <a

            href={data.button_url || "#"}

            className="
            inline-flex
            mt-10
            px-8
            py-4
            rounded-2xl
            bg-cyan-500
            hover:bg-cyan-400
            text-slate-950
            font-bold
            transition
            "

        >

            {data.button_text || "Más información"}

        </a>

        )}

        {data?.show_form && (

            <div
                className="
                mt-12
                max-w-xl
                mx-auto
                "
            >

                <div className="text-lg font-semibold">

                Sé de los primeros en enterarte.

                </div>

                <p className="text-slate-400 mt-2 mb-6">

                Déjanos tu correo y te avisaremos apenas el sitio esté disponible.

                </p>

                <form
                className="
                    flex
                    flex-col
                    md:flex-row
                    gap-3
                "
                >

                <input

                    type="email"

                    placeholder="tu@email.com"

                    className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-900
                    px-5
                    py-4
                    outline-none
                    "

                />

                <button

                    type="submit"

                    className="
                    rounded-xl
                    bg-white
                    text-black
                    font-semibold
                    px-6
                    py-4
                    "

                >

                    Quiero ser avisado

                </button>

                </form>

            </div>

            )}

      </div>

    </div>

  )

}