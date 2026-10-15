import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminSession";

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { title, description, fppValue } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required." }, { status: 400 });
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("quests")
    .insert({ title: title.trim(), description: description?.trim() || "", fpp_value: Number(fppValue) || 0 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function PATCH(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id, active } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const db = supabaseAdmin();
  const { data, error } = await db.from("quests").update({ active }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
    }
