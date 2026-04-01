import { createClient } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  // 🔐 validar usuario
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = userData.user;

  const formData = await req.formData();

  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string;

  if (!file || !bucket) {
    return NextResponse.json({ error: "Archivo o bucket faltante" }, { status: 400 });
  }

  // 🔥 nombre seguro + organizado
  const fileName = `${user.id}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ url: data.path });
}