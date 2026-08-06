import { StudioShell } from "@/components/studio/StudioShell";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deine Eintrittskarte",
  robots: { index: false, follow: false },
};

type Ticket = {
  email: string;
  password: string;
  loginUrl: string;
};

export default async function AdminZugangPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("studio_entry_ticket")?.value;

  if (!raw) {
    redirect("/admin");
  }

  let ticket: Ticket;
  try {
    ticket = JSON.parse(raw) as Ticket;
  } catch {
    redirect("/admin");
  }

  return (
    <StudioShell>
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-sm overflow-hidden rounded-xl border-2 border-emerald-500 bg-white shadow-sm">
          <div className="bg-emerald-600 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              UNZE Studio
            </p>
            <h1 className="mt-1 text-lg font-bold text-white">Deine Eintrittskarte</h1>
          </div>
          <dl className="space-y-3 px-4 py-5 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Login</dt>
              <dd className="mt-0.5 break-all font-medium text-gray-900">{ticket.loginUrl}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">E-Mail</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{ticket.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Passwort
              </dt>
              <dd className="mt-0.5 break-all rounded-lg bg-emerald-50 px-3 py-2 font-mono text-base font-semibold text-emerald-900">
                {ticket.password}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mx-auto mt-4 max-w-sm text-center text-xs text-gray-600">
          Speichern oder abfotografieren — das ist Ihr fester Studio-Zugang.
        </p>

        <div className="mx-auto mt-4 max-w-sm">
          <Link
            href="/studio/app/uebersicht"
            className="block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
          >
            Weiter ins Studio
          </Link>
        </div>
      </div>
    </StudioShell>
  );
}
