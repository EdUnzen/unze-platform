import { uploadBriefingFiles } from "@/services/business/briefing-upload.service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const referenceId = String(formData.get("referenceId") ?? "").trim();
    if (!referenceId) {
      return NextResponse.json({ ok: false, error: "Referenznummer fehlt" }, { status: 400 });
    }

    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) {
      return NextResponse.json({ ok: true, uploaded: [] });
    }

    const { uploaded, errors } = await uploadBriefingFiles({ referenceId, files });
    if (errors.length && !uploaded.length) {
      return NextResponse.json({ ok: false, error: errors.join(" · ") }, { status: 400 });
    }

    return NextResponse.json({ ok: true, uploaded, warnings: errors });
  } catch (err) {
    console.error("[api/business/inquiries/briefing-files]", err);
    return NextResponse.json({ ok: false, error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}
