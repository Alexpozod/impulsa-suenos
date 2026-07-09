import { NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  try {

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("public_site_settings")
        .select("*")
        .eq(
          "id",
          "00000000-0000-0000-0000-000000000001"
        )
        .single()

    if (error) {

      throw error

    }

    const {

      count

    } =
      await supabase
        .schema("raffles")
        .from("landing_leads")
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        )

    const {

      data: recentLeads

    } =
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
        .limit(10)

    return NextResponse.json({

      ...data,

      lead_count:
        count ?? 0,

      recent_leads:
        recentLeads ?? []

    })
    
  }

  catch (error) {

    console.error(
      "public site settings",
      error
    )

    return NextResponse.json(
      {
        error: "server_error"
      },
      {
        status: 500
      }
    )

  }

}

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const { error } =
      await supabase
        .schema("raffles")
        .from("public_site_settings")
        .update({

          title:
            body.title,

          subtitle:
            body.subtitle,

          description:
            body.description,

          site_mode:
            body.site_mode,

          show_logo:
            body.show_logo,

          show_subtitle:
            body.show_subtitle,

          show_description:
            body.show_description,

          show_countdown:
            body.show_countdown,

          countdown_date:
            body.countdown_date,

          show_socials:
            body.show_socials,

          instagram_url:
            body.instagram_url,

          facebook_url:
            body.facebook_url,

          tiktok_url:
            body.tiktok_url,

          youtube_url:
            body.youtube_url,

          updated_at:
            new Date().toISOString()

        })

        .eq(
          "id",
          "00000000-0000-0000-0000-000000000001"
        );

    if (error) {

      throw error;

    }

    return NextResponse.json({

      success: true

    });

  }

  catch (error) {

    console.error(

      "public site update",

      error

    );

    return NextResponse.json(

      {

        error: "server_error"

      },

      {

        status: 500

      }

    );

  }

}