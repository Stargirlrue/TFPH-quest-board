import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  const { name, whatsapp, teamId } = await request.json();
  if (!name?.trim() || !whatsapp?.trim() || !teamId) {
    return NextResponse.json({ error: "Name, WhatsApp, and team are required." }, { status: 400 });
  }
  const db = supabaseAdmin();
  const cleanWhatsapp = whatsapp.trim();

  const { data: existing } = await db.from("users").select("*").eq("whatsapp", cleanWhatsapp).maybeSingle();
  if (existing) return NextResponse.json({ user: existing });

  const { data, error } = await db
    .from("users")
    .insert({ name: name.trim(), whatsapp: cleanWhatsapp, team_id: teamId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
