import { isTrackableAnalyticsPath, recordPageView } from "@/lib/studio/site-analytics";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  path?: string;
  visitorId?: string;
  referrer?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const path = typeof body.path === "string" ? body.path.trim() : "";
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.trim() : "";

    if (!path || !visitorId || path.length > 500 || visitorId.length > 64) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (!isTrackableAnalyticsPath(path)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ok = await recordPageView({
      path,
      visitorId,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
    });

    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
