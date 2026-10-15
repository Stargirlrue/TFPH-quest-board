import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  const { userId, questId, proofImageBase64, proofFileName, proofType } = await request.json();
  if (!userId || !questId || !proofImageBase64) {
    return NextResponse.json({ error: "Missing info or screenshot." }, { status: 400 });
  }
  const db = supabaseAdmin();

  const { data: dupe } = await db
    .from("submissions")
    .select("id,status")
    .eq("user_id", userId)
    .eq("quest_id", questId)
    .in("status", ["pending", "approved"])
    .maybeSingle();
  if (dupe) return NextResponse.json({ error: "Already submitted this task." }, { status: 409 });

  const base64Data = proofImageBase64.split(",").pop();
  const buffer = Buffer.from(base64Data, "base64");
  const path = `${userId}/${Date.now()}-${(proofFileName || "proof").replace(/[^a-zA-Z0-9._-]/g, "")}`;

  const { error: uploadError } = await db.storage
    .from("proofs")
    .upload(path, buffer, { contentType: proofType || "image/jpeg" });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: pub } = db.storage.from("proofs").getPublicUrl(path);

  const { data, error } = await db
    .from("submissions")
    .insert({ user_id: userId, quest_id: questId, proof_url: pub.publicUrl })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submission: data });
}
