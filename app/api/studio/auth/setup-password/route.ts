import {
  findAuthUserByEmail,
  hasStudioAccess,
  markPasswordSetupComplete,
  needsPasswordSetup,
} from "@/lib/studio/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    passwordConfirm?: string;
  };

  const email = body.email?.trim();
  const password = body.password ?? "";
  const passwordConfirm = body.passwordConfirm ?? "";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "E-Mail und Passwort erforderlich" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Passwort muss mindestens 8 Zeichen haben" },
      { status: 400 },
    );
  }

  if (password !== passwordConfirm) {
    return NextResponse.json({ ok: false, error: "Passwörter stimmen nicht überein" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Auth nicht konfiguriert" }, { status: 503 });
  }

  try {
    const authUser = await findAuthUserByEmail(email);
    if (!authUser) {
      return NextResponse.json({ ok: false, error: "Kein Studio-Zugang" }, { status: 403 });
    }

    if (!(await hasStudioAccess(authUser.id))) {
      return NextResponse.json({ ok: false, error: "Kein Studio-Zugang" }, { status: 403 });
    }

    if (!needsPasswordSetup(authUser)) {
      return NextResponse.json(
        { ok: false, error: "Passwort wurde bereits festgelegt. Bitte normal anmelden." },
        { status: 409 },
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...authUser.user_metadata,
        password_setup_required: false,
      },
    });

    if (updateError) {
      return NextResponse.json({ ok: false, error: "Passwort konnte nicht gesetzt werden" }, { status: 500 });
    }

    await markPasswordSetupComplete(authUser.id);

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Auth nicht konfiguriert" }, { status: 503 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json(
        { ok: true, setupComplete: true, redirect: "/admin", message: "Passwort gesetzt. Bitte anmelden." },
      );
    }

    return NextResponse.json({
      ok: true,
      setupComplete: true,
      redirect: "/studio/app/uebersicht",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Einrichtung fehlgeschlagen" }, { status: 500 });
  }
}
