import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminSession";

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { submissionId, decision } = await request.json();
  if (!submissionId || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const db = supabaseAdmin();

  const { data: submission, error: fetchError } = await db
    .from("submissions")
    .select("id, status, user_id, quest_id, quests(fpp_value)")
    .eq("id", submissionId)
    .single();
  if (fetchError || !submission) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (submission.status !== "pending") return NextResponse.json({ error: "Already reviewed." }, { status: 409 });

  const { error: updateError } = await db
    .from("submissions")
    .update({ status: decision, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (decision === "approved") {
    const fpp = submission.quests?.fpp_value || 0;
    const { error: rpcError } = await db.rpc("increment_user_fpp", { p_user_id: submission.user_id, p_fpp: fpp });
    if (rpcError) {
      const { data: user } = await db.from("users").select("fpp").eq("id", submission.user_id).single();
      await db.from("users").update({ fpp: (user?.fpp || 0) + fpp }).eq("id", submission.user_id);
    }
  }
  return NextResponse.json({ ok: true });
}
