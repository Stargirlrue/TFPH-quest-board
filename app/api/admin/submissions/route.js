import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminSession";

export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("submissions")
    .select("id, proof_url, status, submitted_at, users(id,name,whatsapp,team_id,teams(name,color)), quests(id,title,fpp_value)")
    .order("submitted_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data });
    }
