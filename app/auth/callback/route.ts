import { safeRedirectPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function loginRedirect(origin: string, params: Record<string, string>) {
  const url = new URL("/auth/login", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get("next"));

  const supabase = await createClient();
  if (!supabase) {
    return loginRedirect(origin, { error: "supabase_not_configured", next });
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return loginRedirect(origin, {
        error: "auth_callback_failed",
        next,
        message: error.message,
      });
    }
    const dest = new URL(next, origin);
    dest.searchParams.set("verified", "1");
    return NextResponse.redirect(dest);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return loginRedirect(origin, {
        error: "email_verification_failed",
        next,
        message: error.message,
      });
    }
    const dest = new URL(next, origin);
    dest.searchParams.set("verified", "1");
    return NextResponse.redirect(dest);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
