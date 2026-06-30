import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { requireAdminAccess } from "@/lib/raffles/admin/requireAdminAccess";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {

  try {

    const auth =
      await requireAdminAccess(req);

    if (
      !auth.authorized ||
      !auth.user
    ) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      );

    }

    const {
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("partner_resources")
        .select("*")
        .order(
          "category",
          {
            ascending: true
          }
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );

    if (error) {

      throw error;

    }

    return NextResponse.json({

      ok: true,

      resources:
        data || []

    });

  } catch (error) {

    console.error(error);

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

export async function PUT(req: Request) {

  try {

    const auth =
      await requireAdminAccess(req);

    if (
      !auth.authorized ||
      !auth.user
    ) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      );

    }

    const body =
      await req.json();

    const {

      id,

      title,

      description,

      category,

      sort_order,

      is_active

    } = body;

    if (!id) {

      return NextResponse.json(
        {
          error: "id_required"
        },
        {
          status: 400
        }
      );

    }

    const {
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("partner_resources")
        .update({

          title,

          description,

          category,

          sort_order,

          is_active

        })

        .eq(
          "id",
          id
        )

        .select()

        .single();

    if (error) {

      throw error;

    }

    return NextResponse.json({

      ok: true,

      resource: data

    });

  } catch (error) {

    console.error(error);

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

export async function DELETE(req: Request) {

  try {

    const auth =
      await requireAdminAccess(req);

    if (
      !auth.authorized ||
      !auth.user
    ) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      );

    }

    const {
      searchParams
    } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    if (!id) {

      return NextResponse.json(
        {
          error: "id_required"
        },
        {
          status: 400
        }
      );

    }

    const {
      error
    } =
      await supabase
        .schema("raffles")
        .from("partner_resources")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {

      throw error;

    }

    return NextResponse.json({

      ok: true

    });

  } catch (error) {

    console.error(error);

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