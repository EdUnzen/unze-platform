import { StudioField, StudioSelect, StudioTextarea } from "@/components/studio/StudioField";
import {
  CLIENT_STATUS_LABELS,
  type ClientStatus,
  type StudioClient,
} from "@/lib/studio/client-types";

type ClientFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  client?: StudioClient;
  submitLabel: string;
};

export function ClientForm({ action, client, submitLabel }: ClientFormProps) {
  const statusOptions = (Object.entries(CLIENT_STATUS_LABELS) as [ClientStatus, string][]).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <form action={action} className="space-y-4">
      {client ? <input type="hidden" name="clientId" value={client.id} /> : null}

      <StudioField
        label="Firma / Name *"
        name="companyName"
        required
        defaultValue={client?.companyName}
        placeholder="Müller GmbH"
      />
      <StudioField
        label="Ansprechpartner"
        name="contactName"
        defaultValue={client?.contactName ?? undefined}
      />
      <StudioField
        label="E-Mail *"
        name="contactEmail"
        type="email"
        required
        defaultValue={client?.contactEmail}
      />
      <StudioField
        label="Telefon"
        name="contactPhone"
        type="tel"
        defaultValue={client?.contactPhone ?? undefined}
      />
      <StudioField label="Straße" name="street" defaultValue={client?.street ?? undefined} />
      <div className="grid gap-4 sm:grid-cols-2">
        <StudioField label="PLZ" name="postalCode" defaultValue={client?.postalCode ?? undefined} />
        <StudioField label="Ort" name="city" defaultValue={client?.city ?? undefined} />
      </div>
      <StudioField label="Land" name="country" defaultValue={client?.country ?? "Deutschland"} />

      {client ? (
        <StudioSelect
          label="Status"
          name="status"
          defaultValue={client.status}
          options={statusOptions}
        />
      ) : null}

      <StudioTextarea label="Notizen" name="notes" defaultValue={client?.notes ?? undefined} />

      <button
        type="submit"
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:scale-[0.99]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
