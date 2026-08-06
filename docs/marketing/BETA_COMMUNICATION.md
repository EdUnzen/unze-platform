# UNZE Connect - Geschlossene Beta (Kommunikation)

Stand: Juni 2026

## Steuerung

Eine Umgebungsvariable schaltet die Beta-Kommunikation auf der Landingpage:

```env
# Default: Beta aktiv (Variable fehlt oder != "false")
NEXT_PUBLIC_UNZE_CONNECT_CLOSED_BETA=true

# Nach offiziellem Plattformstart:
NEXT_PUBLIC_UNZE_CONNECT_CLOSED_BETA=false
```

Quelle: `lib/constants/beta-communication.ts`

## Was die Landingpage kommuniziert

| Thema | Inhalt |
|-------|--------|
| Geschlossene Beta | Banner auf allen Marketing-Seiten |
| Creator gesucht | Hero, Creator-Sektion, CTAs |
| Crowd Partner gesucht | Transparenz-Sektion, Creator-Band |
| Demo-Communities | Badge auf Karten + Detailseiten (`isDemoCommunitySlug`) |
| Zahlungen | "Nach Beta" - keine produktiven Stripe-Zahlungen |
| Plattform im Ausbau | Funktionsstatus-Tabelle |

## Architektur-Regeln (UNZE-007)

- **Keine zweite Datenhaltung:** Communities nur aus `/api/public/*`
- **Demo-Erkennung:** bestehende `lib/constants/demo.ts` (Connect-Seed-Slugs)
- **Keine Fake-Showcases:** `marketing-showcase.ts` nicht mehr verwendet
- **Keine Marketing-Scores:** nur echte Plattformdaten (Mitglieder, Bewertung, Badges) - UNZE-005-konform
- **Statistiken:** nur Live-Werte aus `getPublicDirectoryStats()`, sonst ausblenden

## CORSA-Governance

| Referenz | Ort |
|----------|-----|
| CORSA-Pruefbericht Landing UX | `PROJEKTE/UNZE/Berichte/2026-06-20_Landing_UX_CORSA_Pruefung_UNZE.md` |
| Entscheidung | UNZE-007 (**FINAL**) in `PROJEKTE/UNZE/Entscheidungsregister.md` |
| Ist-Status App | `docs/marketing/LANDING_UX_PHASE_STATUS.md` |

Keine CORSA-Duplikation im App-Repo - Verweise auf `CORSA_MASTER_STANDARD` und `PROJEKTE/UNZE/`.

## Nach dem Plattformstart

1. `NEXT_PUBLIC_UNZE_CONNECT_CLOSED_BETA=false` in Vercel setzen
2. Demo-Communities in Connect entfernen (`npm run seed:demo` Reset nur mit Freigabe)
3. Stripe/Monetarisierung produktiv freischalten
4. Landing zeigt automatisch Produktiv-Hero und Monetarisierungs-Copy
