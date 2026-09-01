"use client";

import type { ShowcaseCategoryId, ShowcaseItem } from "@/lib/marketing/showcase-catalog";
import { SHOWCASE_CAPTURE_COMMANDS } from "@/lib/marketing/showcase-catalog";
import type { ShowcaseAssetStatus, ShowcaseCaptureSummary } from "@/lib/marketing/showcase-assets.constants";
import {
  SHOWCASE_ASSET_PATHS,
  SHOWCASE_SLIDESHOWS,
  SHOWCASE_VIDEO_COMMANDS,
} from "@/lib/marketing/showcase-assets.constants";
import { ExternalLink, Copy, Check, Camera, FolderOpen, Film, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PRIORITY_LABELS = {
  high: { label: "Hoch", className: "bg-rose-100 text-rose-800" },
  medium: { label: "Mittel", className: "bg-amber-100 text-amber-800" },
  low: { label: "Niedrig", className: "bg-gray-100 text-gray-600" },
} as const;

const STATUS_LABELS = {
  ready: { label: "Bereit", className: "bg-emerald-100 text-emerald-800" },
  partial: { label: "Teilweise", className: "bg-amber-100 text-amber-800" },
  planned: { label: "Geplant", className: "bg-gray-100 text-gray-600" },
} as const;

type CaptureSummary = ShowcaseCaptureSummary;

interface MarketingShowcasePanelProps {
  categories: { id: ShowcaseCategoryId; label: string; description: string }[];
  items: ShowcaseItem[];
  assetStatuses: ShowcaseAssetStatus[];
  captureSummary: CaptureSummary;
  origin: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Kopiert" : "Kopieren"}
    </button>
  );
}

export function MarketingShowcasePanel({
  categories,
  items,
  assetStatuses,
  captureSummary,
  origin,
}: MarketingShowcasePanelProps) {
  const [activeCategory, setActiveCategory] = useState<ShowcaseCategoryId | "all">("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  const statusById = useMemo(() => {
    return new Map(assetStatuses.map((s) => [s.item.id, s]));
  }, [assetStatuses]);

  function previewUrl(item: ShowcaseItem) {
    const url = new URL(item.route, origin);
    if (item.marketingMode) url.searchParams.set("marketing", "1");
    return url.toString();
  }

  const assetLocations = [
    {
      icon: ImageIcon,
      title: "Showcase-Screenshots (NEU)",
      path: SHOWCASE_ASSET_PATHS.showcaseScreens,
      hint: "Business, Studio, Connect, Templates — nach marketing:capture:overload",
      status: captureSummary.showcaseDirExists
        ? `${captureSummary.totalImageFiles} Bild(er) vorhanden`
        : "Noch leer — Capture starten",
    },
    {
      icon: Film,
      title: "Werbevideos (Slideshow)",
      path: SHOWCASE_ASSET_PATHS.videos,
      hint: "business-reel.webm / .mp4 — nach marketing:video:slideshow",
      status: captureSummary.hasVideos ? "Ordner vorhanden" : "Noch nicht gerendert",
    },
    {
      icon: FolderOpen,
      title: "Connect Mockups & Stories",
      path: SHOWCASE_ASSET_PATHS.connectMockups,
      hint: "tiktok/, reels/, features/ — nach marketing:build",
      status: captureSummary.hasLegacyConnect ? "Connect-Screens vorhanden" : "Legacy-Pipeline ausstehend",
    },
    {
      icon: FolderOpen,
      title: "Connect Roh-Screens",
      path: SHOWCASE_ASSET_PATHS.connectScreens,
      hint: "Alte Connect-Pipeline (marketing:capture)",
      status: captureSummary.hasLegacyConnect ? "home.png etc." : "—",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <FolderOpen className="h-4 w-4 text-blue-600" aria-hidden />
          Wo finde ich die Bilder?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Diese Karten sind keine Videos.</strong> Antippen öffnet nichts — das sind nur Ordnerpfade
          auf dem Rechner. Ansehen und zuschneiden geht in den Dateien, nicht hier im Handy.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Pfad relativ zum Projekt:
          <code className="ml-1 rounded bg-white px-1.5 py-0.5 text-xs">Desktop/UNZE/UNZE APP/UNZE/</code>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {assetLocations.map((loc) => {
            const Icon = loc.icon;
            return (
              <div key={loc.path} className="rounded-lg border border-blue-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{loc.title}</p>
                    <p className="mt-1 font-mono text-xs text-gray-700">{loc.path}</p>
                    <p className="mt-1 text-xs text-gray-500">{loc.hint}</p>
                    <p className="mt-2 text-xs font-medium text-blue-700">{loc.status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-violet-200 bg-violet-50/50 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Film className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-900">Werbevideos aus Screenshots</h2>
            <p className="mt-1 text-sm text-gray-600">
              Zuerst Screenshots capturen, dann Slideshow-Video rendern (9:16 Reels oder 16:9 LinkedIn).
            </p>
            <ol className="mt-2 list-inside list-decimal text-sm text-gray-600">
              <li>
                <code className="text-xs">npm run marketing:capture:overload</code>
              </li>
              <li>
                <code className="text-xs">npm run marketing:video:slideshow</code>
              </li>
              <li>Dateien in {SHOWCASE_ASSET_PATHS.videos} öffnen</li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(SHOWCASE_VIDEO_COMMANDS).map(([key, cmd]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2"
                >
                  <code className="text-xs text-gray-800">{cmd}</code>
                  <CopyButton text={cmd} />
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              {SHOWCASE_SLIDESHOWS.map((s) => (
                <li key={s.id}>
                  <strong>{s.title}</strong> → output/videos/{s.id}.webm
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Camera className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-900">Screenshot-Pipeline</h2>
            <p className="mt-1 text-sm text-gray-600">
              Dev-Server Port 3000 · Studio braucht{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">STUDIO_PASSWORD</code> ·{" "}
              {captureSummary.itemsWithCaptures}/{captureSummary.totalItems} Screens mit Dateien
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(SHOWCASE_CAPTURE_COMMANDS).map(([key, cmd]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2"
                >
                  <code className="text-xs text-gray-800">{cmd}</code>
                  <CopyButton text={cmd} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            activeCategory === "all"
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Alle ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((item) => {
          const priority = PRIORITY_LABELS[item.priority];
          const status = STATUS_LABELS[item.status];
          const url = previewUrl(item);
          const assetStatus = statusById.get(item.id);

          return (
            <article
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priority.className}`}>
                      {priority.label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${status.className}`}>
                      {status.label}
                    </span>
                    {assetStatus && assetStatus.captured.length > 0 ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-800">
                        {assetStatus.captured.length} Bild(er)
                      </span>
                    ) : !item.skipCapture ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                        Noch nicht captured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  <p className="mt-2 font-mono text-xs text-gray-500">{item.route}</p>
                  {item.note ? (
                    <p className="mt-2 text-xs text-amber-700">{item.note}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={item.route + (item.marketingMode ? "?marketing=1" : "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    Öffnen
                  </Link>
                  <CopyButton text={url} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>
                  Viewports:{" "}
                  <strong className="text-gray-700">{item.viewports.join(", ")}</strong>
                </span>
                {assetStatus && assetStatus.captured.length > 0 ? (
                  <span>
                    Gespeichert:{" "}
                    <strong className="text-gray-700">{assetStatus.captured.join(", ")}</strong>
                  </span>
                ) : null}
                {item.auth ? (
                  <span>
                    Auth: <strong className="text-gray-700">{item.auth}</strong>
                  </span>
                ) : null}
                {item.publishPaket.length > 0 ? (
                  <span>
                    eBay:{" "}
                    <strong className="text-gray-700">{item.publishPaket.join(", ")}</strong>
                  </span>
                ) : null}
                {item.exportHint ? (
                  <span className="font-mono text-gray-400">{item.exportHint}</span>
                ) : null}
                {item.skipCapture ? (
                  <span className="text-gray-400">Kein Auto-Capture</span>
                ) : (
                  <span className="font-mono text-gray-400">
                    {SHOWCASE_ASSET_PATHS.showcaseScreens}
                    {item.category}/{item.id}.png
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
