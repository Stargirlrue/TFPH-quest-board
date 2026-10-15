import { NextResponse } from "next/server";
import { adminCookieHeader } from "@/lib/adminSession";

export async function POST(request) {
  const { passcode } = await request.json();
  if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", adminCookieHeader());
  return res;
}
