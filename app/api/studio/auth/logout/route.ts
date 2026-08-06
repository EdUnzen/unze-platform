import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const url = new URL("/admin", request.nextUrl.origin);
  return NextResponse.redirect(url, { status: 303 });
}
