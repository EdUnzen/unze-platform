import {
  findAuthUserByEmail,
  hasStudioAccess,
  needsPasswordSetup,
} from "@/lib/studio/auth-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json({ ok: false, error: "E-Mail erforderlich" }, { status: 400 });
  }

  try {
    const authUser = await findAuthUserByEmail(email);

    if (!authUser) {
      return NextResponse.json({
        ok: true,
        mode: "none",
        message: "Kein Studio-Zugang für diese E-Mail.",
      });
    }

    const studioAccess = await hasStudioAccess(authUser.id);
    if (!studioAccess) {
      return NextResponse.json({
        ok: true,
        mode: "none",
        message: "Kein Studio-Zugang für diese E-Mail.",
      });
    }

    const mode = needsPasswordSetup(authUser) ? "setup" : "login";

    return NextResponse.json({
      ok: true,
      mode,
      email: authUser.email ?? email,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Prüfung fehlgeschlagen" }, { status: 500 });
  }
}
