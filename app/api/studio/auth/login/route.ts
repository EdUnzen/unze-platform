import { createClient } from "@/lib/supabase/server";
import { ensureStudioUser } from "@/lib/studio/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "E-Mail und Passwort erforderlich" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Auth nicht konfiguriert" }, { status: 503 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: "Anmeldung fehlgeschlagen" }, { status: 401 });
  }

  const studioUser = await ensureStudioUser(
    data.user.id,
    data.user.email ?? email,
    data.user.user_metadata?.full_name ?? null,
  );

  if (!studioUser) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { ok: false, error: "Kein Studio-Zugang konfiguriert. Bitte Administrator kontaktieren." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ok: true,
    role: studioUser.roleId,
    redirect: "/studio/app/uebersicht",
  });
}
