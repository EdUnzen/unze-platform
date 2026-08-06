import {
  findAuthUserByEmail,
  hasStudioAccess,
  markPasswordSetupComplete,
  needsPasswordSetup,
} from "@/lib/studio/auth-admin";
import { ensureStudioUser } from "@/lib/studio/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminUrl(request: NextRequest, error?: string): URL {
  const url = new URL("/admin", request.nextUrl.origin);
  if (error) url.searchParams.set("error", error);
  return url;
}

function ticketUrl(request: NextRequest): URL {
  return new URL("/admin/zugang", request.nextUrl.origin);
}

async function createSupabaseFromRequest(request: NextRequest, response: NextResponse) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(adminUrl(request, "auth"), 303);
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(adminUrl(request, "missing"), 303);
  }

  if (password.length < 8) {
    return NextResponse.redirect(adminUrl(request, "short"), 303);
  }

  try {
    const authUser = await findAuthUserByEmail(email);
    if (!authUser || !(await hasStudioAccess(authUser.id))) {
      return NextResponse.redirect(adminUrl(request, "noaccess"), 303);
    }

    const isSetup = needsPasswordSetup(authUser);

    if (isSetup) {
      if (password !== passwordConfirm) {
        return NextResponse.redirect(adminUrl(request, "mismatch"), 303);
      }

      const admin = createAdminClient();
      if (!admin) {
        return NextResponse.redirect(adminUrl(request, "auth"), 303);
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
        return NextResponse.redirect(adminUrl(request, "setfailed"), 303);
      }

      await markPasswordSetupComplete(authUser.id);
    }

    const redirectResponse = NextResponse.redirect(
      isSetup ? ticketUrl(request) : new URL("/studio/app", request.nextUrl.origin),
      303,
    );

    const supabase = await createSupabaseFromRequest(request, redirectResponse);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.redirect(adminUrl(request, "signinfailed"), 303);
    }

    const studioUser = await ensureStudioUser(
      data.user.id,
      data.user.email ?? email,
      data.user.user_metadata?.full_name ?? null,
    );

    if (!studioUser) {
      await supabase.auth.signOut();
      return NextResponse.redirect(adminUrl(request, "nostudio"), 303);
    }

    if (isSetup) {
      redirectResponse.cookies.set(
        "studio_entry_ticket",
        JSON.stringify({
          email,
          password,
          loginUrl: adminUrl(request).toString(),
        }),
        {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 30,
        },
      );
    }

    return redirectResponse;
  } catch {
    return NextResponse.redirect(adminUrl(request, "unknown"), 303);
  }
}
