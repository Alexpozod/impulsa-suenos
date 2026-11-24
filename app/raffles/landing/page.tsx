import { createClient } from "@supabase/supabase-js"

import LaunchCountdown
from "@/app/components/raffles/public/LaunchCountdown"

import LandingLeadForm
from "@/app/components/raffles/public/LandingLeadForm"

import LandingSocials
from "@/app/components/raffles/public/LandingSocials"

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

      console.log("LANDING SETTINGS", data)

  return (

    <div className="min-h-screen bg-[#FAF9F5] text-[#002314] flex items-center justify-center">

      <div className="max-w-3xl w-full px-6 text-center">

       {data?.show_logo && (

<div className="flex flex-col items-center mb-8">

  <img
    src="/raffles/brand/logo-impulsa.svg"
    alt="ImpulsaSueños"
    className="w-36 h-auto"
  />

  <div className="mt-5 text-center">

    <div
      className="
        text-5xl
        font-black
        leading-none
        text-[#002314]
      "
    >
      ImpulsaSueños
    </div>

    <div
      className="
        mt-2
        text-[#7048E8]
        text-sm
        font-bold
        tracking-[0.45em]
        uppercase
      "
    >
      Sorteos
    </div>

  </div>

</div>

)}

        {data?.show_subtitle && (

          <p className="mt-6 text-xl text-[#002314]">
            {data?.subtitle}
          </p>

          )}

        {data?.show_description && (

          <p className="mt-8 text-[#002314] whitespace-pre-line">
            {data?.description}
          </p>

          )}

        {/* Botón eliminado.
   El CTA principal es el formulario de registro. */}

            {data?.show_countdown &&

        data?.countdown_date && (

          <LaunchCountdown

            target={
              data.countdown_date
            }

          />

        )}

        {data?.show_form && (

  <LandingLeadForm />

)}

{data?.show_socials && (

  <LandingSocials

    instagram={
      data.instagram_url
    }

    facebook={
      data.facebook_url
    }

    tiktok={
      data.tiktok_url
    }

    youtube={
      data.youtube_url
    }

  />

)}

      </div>

    </div>

  )

}