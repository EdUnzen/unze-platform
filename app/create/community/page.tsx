import { CreateCommunityClient } from "@/components/community/CreateCommunityClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/services/auth/auth.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreateCommunityPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="page-padding">
        <PageHeader title="Community erstellen" subtitle="Supabase erforderlich" />
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Konfiguriere Supabase in <code className="rounded bg-amber-100 px-1">.env.local</code> und
          führe die Migrationen aus.
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/create/community");
  }

  return (
    <div className="page-padding">
      <PageHeader
        title="Community erstellen"
        subtitle="Als Creator startest du deine eigene Community auf UNZE"
      />
      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
        <CreateCommunityClient />
      </div>
      <p className="mt-4 text-center text-xs text-unze-ink-muted">
        Mit dem Erstellen wirst du{" "}
        <Link href="/dashboard" className="font-medium text-unze-green">
          Creator
        </Link>
        {" "}und erhältst die Creator-Rolle in deiner Community.
      </p>
    </div>
  );
}
