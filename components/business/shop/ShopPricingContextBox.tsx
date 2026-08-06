import Link from "next/link";

type ShopPricingContextBoxProps = {
  variant?: "templates" | "compact";
};

/** Shop-Preise vs. Projekt-Preise — vermeidet Verwechslung mit Landingpage „ab 490 €“ */
export function ShopPricingContextBox({ variant = "templates" }: ShopPricingContextBoxProps) {
  if (variant === "compact") {
    return (
      <p className="text-xs leading-relaxed text-gray-600">
        Shop = fester Scope · Designstudio-Einstieg. Volle Projektumsetzung:{" "}
        <Link href="/business/preise" className="font-semibold text-gray-800 underline-offset-2 hover:underline">
          Preise ab 390 €
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3">
      <p className="text-xs font-semibold text-amber-950">Zwei Preiswelten — bitte unterscheiden</p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-950/90">
        <li>
          <strong className="font-semibold">Shop (hier):</strong> Designstudio-Einstieg mit festem Umfang — z.&nbsp;B.
          Landingpage 29&nbsp;€, Website 59&nbsp;€ (Briefing, kein Datei-Download).
        </li>
        <li>
          <strong className="font-semibold">Individuelles Projekt:</strong> Planung, Entwicklung, Go-Live —
          Landingpage <strong>ab 390&nbsp;€</strong>, Website <strong>ab 790&nbsp;€</strong>, Web-App{" "}
          <strong>ab 3.990&nbsp;€</strong>.
        </li>
      </ul>
      <Link
        href="/business/preise"
        className="mt-2 inline-block text-xs font-semibold text-amber-950 underline-offset-2 hover:underline"
      >
        Alle Projektpreise ansehen →
      </Link>
    </div>
  );
}
