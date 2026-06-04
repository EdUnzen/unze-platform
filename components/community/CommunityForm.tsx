"use client";

import {
  BANNER_GRADIENTS,
  COMMUNITY_CATEGORIES,
  PLATFORM_OPTIONS,
  VISIBILITY_OPTIONS,
} from "@/lib/constants/community";
import { getFocusOptionsForCategory } from "@/lib/constants/community-focus";
import { CommaSeparatedInput } from "@/components/ui/CommaSeparatedInput";
import { slugifyTitle } from "@/lib/utils/slug";
import type { Community, CommunityFormInput } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-4 py-3 text-base outline-none focus:border-unze-green focus:ring-2 focus:ring-unze-green/20 sm:text-sm";

interface CommunityFormProps {
  mode: "create" | "edit";
  initial?: Community;
  action: (formData: FormData) => void;
  pending?: boolean;
  error?: string | null;
}

function toInitialValues(community?: Community): CommunityFormInput {
  return {
    title: community?.title ?? "",
    slug: community?.slug ?? "",
    description: community?.description ?? "",
    platformType: community?.platformType ?? "unze",
    category: community?.category ?? "Allgemein",
    focusTags: community?.focusTags ?? [],
    tags: community?.tags ?? [],
    visibility: community?.visibility ?? "public",
    bannerGradient:
      community?.bannerGradient ??
      "from-emerald-500/90 via-teal-600/80 to-cyan-700/70",
    externalUrl: community?.externalUrl ?? "",
    discoverEnabled: community?.discoverEnabled ?? true,
  };
}

export function CommunityForm({
  mode,
  initial,
  action,
  pending,
  error,
}: CommunityFormProps) {
  const [values, setValues] = useState<CommunityFormInput>(() =>
    toInitialValues(initial),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  useEffect(() => {
    if (!slugTouched && values.title) {
      setValues((v) => ({ ...v, slug: slugifyTitle(v.title) }));
    }
  }, [values.title, slugTouched]);

  const focusDefault = (initial?.focusTags ?? values.focusTags).join(", ");
  const tagsDefault = (initial?.tags ?? values.tags).join(", ");

  return (
    <form action={action} className="space-y-6">
      <section className="space-y-4 rounded-3xl border border-unze-border/60 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-bold text-unze-ink">1. Community-Design</h2>
      {/* Banner-Vorschau */}
      <div
        className={cn(
          "relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br",
          values.bannerGradient,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <p className="absolute bottom-3 left-3 text-sm font-medium text-white">
          Vorschau
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-unze-ink">
          Banner-Farbe
        </label>
        <div className="flex flex-wrap gap-2">
          {BANNER_GRADIENTS.map((g) => (
            <label key={g.id} className="cursor-pointer">
              <input
                type="radio"
                name="bannerGradient"
                value={g.value}
                checked={values.bannerGradient === g.value}
                onChange={() =>
                  setValues((v) => ({ ...v, bannerGradient: g.value }))
                }
                className="sr-only"
              />
              <span
                className={cn(
                  "block h-10 w-10 rounded-full bg-gradient-to-br ring-2 ring-offset-2",
                  g.value,
                  values.bannerGradient === g.value
                    ? "ring-unze-green"
                    : "ring-transparent",
                )}
                title={g.label}
              />
            </label>
          ))}
        </div>
      </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-unze-border/60 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-bold text-unze-ink">2. Basis-Informationen</h2>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-unze-ink">
          Titel *
        </label>
        <input
          id="title"
          name="title"
          required
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          className={inputClass}
          placeholder="Meine Community"
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-unze-ink">
          URL-Slug *
        </label>
        <div className="flex items-center gap-1 rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2 text-sm">
          <span className="text-unze-ink-muted">unze.app/community/</span>
          <input
            id="slug"
            name="slug"
            required
            readOnly={mode === "edit"}
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setValues((v) => ({
                ...v,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              }));
            }}
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="meine-community"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-unze-ink">
          Beschreibung *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          className={cn(inputClass, "resize-none")}
          placeholder="Worum geht es in deiner Community?"
        />
      </div>

      <p className="rounded-2xl border border-unze-green/20 bg-unze-green-muted/40 px-3 py-2.5 text-xs text-unze-ink-secondary">
        Das Community-Level (Bronze bis Elite) wird automatisch berechnet — du kannst es
        nicht manuell festlegen.
      </p>

      <CommaSeparatedInput
        name="focusTags"
        label="Community-Fokus"
        defaultValue={focusDefault}
        placeholder={getFocusOptionsForCategory(values.category).join(", ")}
        hint="Schwerpunkte deiner Community — z. B. Coaching, Events"
        maxTags={6}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-unze-ink">
            Kategorie
          </label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
            className={inputClass}
          >
            {COMMUNITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="platformType" className="mb-1 block text-sm font-medium text-unze-ink">
            Plattform
          </label>
          <select
            id="platformType"
            name="platformType"
            value={values.platformType}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                platformType: e.target.value as CommunityFormInput["platformType"],
              }))
            }
            className={inputClass}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CommaSeparatedInput
        name="tags"
        label="Tags"
        defaultValue={tagsDefault}
        placeholder="Creator, Fitness, Networking"
        maxTags={8}
      />
      </section>

      <section className="space-y-4 rounded-3xl border border-unze-border/60 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-bold text-unze-ink">3. Einstellungen</h2>

      <div>
        <label htmlFor="externalUrl" className="mb-1 block text-sm font-medium text-unze-ink">
          Externer Link (optional)
        </label>
        <input
          id="externalUrl"
          name="externalUrl"
          type="url"
          value={values.externalUrl ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, externalUrl: e.target.value }))}
          className={inputClass}
          placeholder="https://discord.gg/..."
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-unze-ink">Sichtbarkeit</legend>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-2xl border p-3 transition-colors",
                values.visibility === opt.value
                  ? "border-unze-green bg-unze-green-muted/50"
                  : "border-unze-border",
              )}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={values.visibility === opt.value}
                onChange={() => setValues((v) => ({ ...v, visibility: opt.value }))}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-unze-ink">
                  {opt.label}
                </span>
                <span className="block text-xs text-unze-ink-secondary">
                  {opt.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-3 rounded-2xl border border-unze-border p-3">
        <input
          type="checkbox"
          name="discoverEnabled"
          checked={values.discoverEnabled}
          onChange={(e) =>
            setValues((v) => ({ ...v, discoverEnabled: e.target.checked }))
          }
          className="h-4 w-4 rounded border-unze-border text-unze-green"
        />
        <span>
          <span className="block text-sm font-medium text-unze-ink">
            In Discover anzeigen
          </span>
          <span className="block text-xs text-unze-ink-secondary">
            Community für Entdeckung und Vorschläge freigeben
          </span>
        </span>
      </label>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60"
      >
        {pending
          ? "Speichern…"
          : mode === "create"
            ? "Community erstellen"
            : "Änderungen speichern"}
      </button>
    </form>
  );
}
