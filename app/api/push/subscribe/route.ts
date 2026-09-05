import { savePushSubscription } from "@/services/notifications/notification.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { endpoint?: string; p256dh?: string; auth?: string };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  if (!body.endpoint || !body.p256dh || !body.auth) {
    return NextResponse.json({ error: "Subscription unvollständig" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const result = await savePushSubscription({
    endpoint: body.endpoint,
    p256dh: body.p256dh,
    auth: body.auth,
    userAgent,
  });

  if (result.error) {
    const message =
      result.error instanceof Error ? result.error.message : "Speichern fehlgeschlagen";
    const status = message === "Nicht angemeldet" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ ok: true });
}
