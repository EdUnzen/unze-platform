import { Heart, Share2, Wallet } from "lucide-react";

const STEPS = [
  {
    icon: Share2,
    title: "Du empfiehlst UNZE",
    text: "Ein Creator verknüpft sich einmalig mit seinem Crowd Partner — kein Multi-Level, keine Ketten.",
  },
  {
    icon: Heart,
    title: "Neue Creator wachsen",
    text: "Wenn empfohlene Creator erfolgreich Communities aufbauen, wächst UNZE als Plattform.",
  },
  {
    icon: Wallet,
    title: "Anteil an der Plattformgebühr",
    text: "Deine Beteiligung kommt ausschließlich aus dem UNZE-Plattformanteil — nicht aus Creator-Einnahmen der Community.",
  },
] as const;

export function CrowdPartnerExplainer() {
  return (
    <section className="mb-6 rounded-3xl border border-unze-green/20 bg-unze-green-muted/20 p-4">
      <p className="text-sm font-semibold text-unze-ink">
        Crowd Partner unterstützen das Wachstum von UNZE
      </p>
      <p className="mt-1 text-xs text-unze-ink-secondary">
        Das ist kein klassisches Referral-System. Es geht um faires Wachstum und einen
        transparenten Plattformanteil.
      </p>
      <ol className="mt-4 space-y-3">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-unze-green shadow-sm">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-xs font-semibold text-unze-ink">
                {index + 1}. {title}
              </span>
              <span className="text-[11px] text-unze-ink-secondary">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
