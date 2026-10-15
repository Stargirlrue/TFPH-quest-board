import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminSession";

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { name, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required." }, { status: 400 });
  const db = supabaseAdmin();
  const { data, error } = await db.from("teams").insert({ name: name.trim(), color: color || "#9c6b30" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ team: data });
}
