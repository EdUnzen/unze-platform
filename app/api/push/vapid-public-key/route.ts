import { getVapidPublicKey, isPushConfigured } from "@/lib/push/vapid";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push nicht konfiguriert" }, { status: 503 });
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "Push nicht konfiguriert" }, { status: 503 });
  }

  return NextResponse.json({ publicKey });
}
