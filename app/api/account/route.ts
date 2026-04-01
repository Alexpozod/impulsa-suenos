import { createClient } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

// 🔍 GET → obtener perfil + kyc
export async function GET() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = userData.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: kyc } = await supabase
    .from("kyc")
    .select("*")
    .eq("user_email", user.email)
    .single();

  return NextResponse.json({ profile, kyc });
}

// ✏️ POST → actualizar perfil + kyc
export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = userData.user;

  const body = await req.json();

  // 👉 actualizar perfil
  if (body.profile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(body.profile)
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
  }

  // 👉 upsert KYC
  if (body.kyc) {
    const { error: kycError } = await supabase
      .from("kyc")
      .upsert({
        ...body.kyc,
        user_email: user.email,
      });

    if (kycError) {
      return NextResponse.json({ error: kycError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}