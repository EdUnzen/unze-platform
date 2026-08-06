import { StudioField, StudioSelect, StudioTextarea } from "@/components/studio/StudioField";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import {
  addContractAction,
  addDomainAction,
  addHostingAction,
  deleteContractAction,
  deleteDomainAction,
  deleteHostingAction,
} from "@/lib/studio/client-actions";
import {
  BILLING_CYCLE_LABELS,
  CONTRACT_TYPE_LABELS,
  type ClientContract,
  type ClientDomain,
  type ClientHosting,
} from "@/lib/studio/client-types";

function DeleteButton({
  action,
  clientId,
  id,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  clientId: string;
  id: string;
  label: string;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-600 underline">
        {label}
      </button>
    </form>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

export function ClientDomainsSection({
  clientId,
  domains,
}: {
  clientId: string;
  domains: ClientDomain[];
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Domänen</h2>

      {domains.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Noch keine Domänen.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {domains.map((d) => (
            <li key={d.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-gray-900">{d.domain}</p>
                <DeleteButton action={deleteDomainAction} clientId={clientId} id={d.id} label="Entfernen" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {d.registrar ? `${d.registrar} · ` : ""}
                Ablauf: {formatDate(d.expiresAt)}
                {d.autoRenew ? " · Auto-Renew" : ""}
              </p>
              {d.notes ? <p className="mt-1 text-xs text-gray-600">{d.notes}</p> : null}
            </li>
          ))}
        </ul>
      )}

      <form action={addDomainAction} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <input type="hidden" name="clientId" value={clientId} />
        <StudioField label="Domäne" name="domain" required placeholder="beispiel.de" />
        <StudioField label="Registrar" name="registrar" placeholder="IONOS, Namecheap…" />
        <StudioField label="Ablaufdatum" name="expiresAt" type="date" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="autoRenew" className="rounded" />
          Auto-Renew
        </label>
        <StudioTextarea label="Notiz" name="notes" rows={2} />
        <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Domäne hinzufügen
        </button>
      </form>
    </section>
  );
}

export function ClientHostingSection({
  clientId,
  hosting,
}: {
  clientId: string;
  hosting: ClientHosting[];
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Hosting</h2>

      {hosting.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Noch kein Hosting eingetragen.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {hosting.map((h) => (
            <li key={h.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-gray-900">{h.provider}</p>
                <DeleteButton action={deleteHostingAction} clientId={clientId} id={h.id} label="Entfernen" />
              </div>
              {h.planName ? <p className="text-xs text-gray-600">{h.planName}</p> : null}
              {h.url ? (
                <a href={h.url} className="mt-1 block text-xs text-emerald-700 underline" target="_blank" rel="noreferrer">
                  {h.url}
                </a>
              ) : null}
              {h.monthlyCents != null ? (
                <p className="mt-1 text-xs text-gray-500">{formatEuroCents(h.monthlyCents)}/Monat</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <form action={addHostingAction} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <input type="hidden" name="clientId" value={clientId} />
        <StudioField label="Anbieter *" name="provider" required placeholder="Vercel, IONOS…" />
        <StudioField label="Paket" name="planName" placeholder="Pro, Web Hosting…" />
        <StudioField label="URL" name="url" type="url" placeholder="https://…" />
        <StudioField label="Kosten/Monat (€)" name="monthlyEuro" type="text" inputMode="decimal" placeholder="19,99" />
        <StudioTextarea label="Notiz" name="notes" rows={2} />
        <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Hosting hinzufügen
        </button>
      </form>
    </section>
  );
}

export function ClientContractsSection({
  clientId,
  contracts,
}: {
  clientId: string;
  contracts: ClientContract[];
}) {
  const typeOptions = Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const cycleOptions = Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Verträge & Services</h2>

      {contracts.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Noch keine Verträge.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {contracts.map((c) => (
            <li key={c.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-gray-900">{c.title}</p>
                <DeleteButton action={deleteContractAction} clientId={clientId} id={c.id} label="Entfernen" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {CONTRACT_TYPE_LABELS[c.contractType]}
                {c.amountCents != null ? ` · ${formatEuroCents(c.amountCents)}` : ""}
                {c.billingCycle ? ` · ${BILLING_CYCLE_LABELS[c.billingCycle]}` : ""}
              </p>
              {c.nextBillingAt ? (
                <p className="text-xs text-amber-700">Nächste Abrechnung: {formatDate(c.nextBillingAt)}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <form action={addContractAction} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <input type="hidden" name="clientId" value={clientId} />
        <StudioField label="Bezeichnung *" name="title" required placeholder="Wartung Website" />
        <StudioSelect label="Typ" name="contractType" defaultValue="maintenance" options={typeOptions} />
        <StudioField label="Betrag (€)" name="amountEuro" type="text" inputMode="decimal" placeholder="49,00" />
        <StudioSelect
          label="Abrechnung"
          name="billingCycle"
          defaultValue="monthly"
          options={[{ value: "", label: "—" }, ...cycleOptions]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <StudioField label="Start" name="startsAt" type="date" />
          <StudioField label="Ende" name="endsAt" type="date" />
        </div>
        <StudioField label="Nächste Abrechnung" name="nextBillingAt" type="date" />
        <StudioTextarea label="Notiz" name="notes" rows={2} />
        <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Vertrag hinzufügen
        </button>
      </form>
    </section>
  );
}
