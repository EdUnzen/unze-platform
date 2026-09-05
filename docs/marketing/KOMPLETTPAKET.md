# UNZE Marketing — Komplettpaket

> **Du musst nicht wissen, welche Seite wohin gehört.**  
> Ein Befehl erzeugt Screenshots für das **gesamte Projekt** — Landing, Business, Connect, Studio.

---

## In 3 Schritten zum fertigen Bilderpaket

### 1. Dev-Server starten

```powershell
cd "Desktop\UNZE\UNZE APP\UNZE"
npm run dev
```

Wenn dein Server auf **Port 3002** läuft (`.env.local`):

```powershell
$env:MARKETING_LOCAL_BASE="http://localhost:3002"
```

### 2. Alles aufnehmen (ein Befehl)

```powershell
# Optional: Studio-Screens (nur wenn du Studio-Passwort hast)
$env:STUDIO_PASSWORD="dein-studio-passwort"

# Komplettpaket: Showcase + Legacy-Connect + fertige Mockups
npm run marketing:capture:complete
```

**Dauer:** ca. 15–30 Minuten (viele Seiten × 3 Viewports).

### 3. Fertige Bilder holen

| Was | Ordner |
|-----|--------|
| **Alle Roh-Screens (sortiert)** | `docs/marketing/raw-screens/showcase/` |
| **Connect-Portfolio (iPhone/iPad/Desktop)** | `docs/marketing/screenshots/marketing/` |
| **TikTok / Reels / Feature-Karten** | `docs/marketing/output/` |
| **Checkliste im Browser** | `/studio/app/marketing` |

---

## Was ist drin? (~55 Screens)

### Landing (unze.app)
- Communities, Events, Services

### Business (unze.app/business)
- Start, Analyse, Webseiten, Preise, Produkte, KI, Branchen, Business Core, Web-Apps, …

### Connect (unzeconnect.app)
**Öffentlich:** Discover (Communities/Gruppen/Events/Services), Community-Seite, Gruppe, Event, Creator-Profil  
**Eingeloggt:** Profil, Auszeichnungen, UNZE ID, Aktivität, Tickets, Benachrichtigungen, Favoriten  
**Dashboard:** Übersicht, Mitglieder, Events, Gruppen, Auszeichnungen, Monetarisierung, Scanner, Anträge, Rollen, Einstellungen, Zugang, Moderation, Crowd Partner, Community erstellen

### Studio (intern)
- Cockpit, Leads, Angebote, Kunden, Aufträge, Rechnungen, Preise

Katalog (Single Source of Truth): `showcase-catalog.json`

---

## Typische Klickwege (für Videos / Google Flow)

Diese Reihenfolge eignet sich als **Storyboard** — Screens liegen nach Capture in genau dieser Logik vor:

### Creator-Beta (Connect)
1. Discover → Community (Rocket League) → Mitglieder-Tab  
2. Dashboard → Community-Dashboard → Auszeichnungen → Mitglieder  
3. Profil → Auszeichnungen → Benachrichtigungen  

### Business-Kunde
1. Business-Start → Analyse → Webseiten → Preise  

### Studio-intern
1. Cockpit → Leads → Angebote → Aufträge  

---

## Nur ein Bereich?

```powershell
npm run marketing:capture:business   # nur Business + Templates
npm run marketing:capture:connect    # nur Connect
npm run marketing:capture:studio     # nur Studio (STUDIO_PASSWORD!)
npm run marketing:capture            # Legacy Connect (Mockup-Pipeline)
npm run marketing:build              # nur Grafiken aus vorhandenen Screens
npm run marketing:video:all          # Screens + Reels-Videos
```

---

## Voraussetzungen

| Was | Warum |
|-----|-------|
| Demo-Daten | `npm run seed:demo` — sonst leere Communities |
| Connect-Login | Automatisch: `edubek89@icloud.com` / `UnzeDemo2026!` |
| Studio-Login | `STUDIO_PASSWORD` setzen, sonst Studio übersprungen |
| Playwright | Bereits im Projekt — läuft mit den Scripts |

**Wichtig:** Während `npm run dev` läuft, **kein** `npm run build` — sonst `.next`-Konflikt.

---

## Google Cloud / Flow

1. Screens aus `docs/marketing/output/features/` oder `raw-screens/showcase/` nehmen  
2. Pro Video 5–7 Bilder in Storyboard-Reihenfolge  
3. In Flow: Image-to-Video + kurzer deutscher Text pro Slide  

Die Screenshots liefert die Pipeline — Flow macht daraus Bewegtbild.

---

## Hilfe

- Technische Details: `SHOWCASE.md`  
- Beta-Copy: `CREATOR_BETA_CAMPAIGN.md`  
- Studio-Checkliste: `/studio/app/marketing`
