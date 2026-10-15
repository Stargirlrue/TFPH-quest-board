import crypto from "crypto";

const COOKIE_NAME = "tfph_admin";

function sign(value) {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const h = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(signed) {
  if (!signed) return false;
  const [value, sig] = signed.split(".");
  if (!value || !sig) return false;
  return sig === sign(value).split(".")[1] && value === "ok";
}

export function adminCookieHeader() {
  return `${COOKIE_NAME}=${sign("ok")}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function isAdminRequest(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  return verify(match.split("=")[1]);
}
