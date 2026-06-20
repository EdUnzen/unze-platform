# UNZE  Finale UX/UI Optimierung (Pilotstart)

Stand: Juni 2026

## Umgesetzte Optimierungen

### 1. Hero / Mein UNZE
- Hero-Höhe: 360440px (Gast), 300380px (Mitglied)
- Netzwerkbild dominant  Text nur im unteren 4245 % mit Gradient
- Überschrift, Tagline und CTAs am unteren Rand
- CTAs: 48px Höhe, abgerundet, Schatten

### 2. Dashboard vereinfacht
- **Eine Ebene sichtbar:** 6 Hauptkategorien als Karten-Grid (2×3)
- Unterseiten erscheinen **nur nach Klick** auf eine Kategorie
- Einzel-Tab-Bereiche (Allgemein, Finanzen, System) navigieren direkt
- **DashboardQuickNav entfernt**  keine doppelte Navigation mehr

### 3. Untermenüs als echte Buttons
- Unterseiten: große Karten (56px+) mit Icon-Box, Border, Chevron
- Aktiver Zustand: grüner Hintergrund
- Touch-Feedback: `active:scale-[0.98]`

### 4. Rollen-Darstellung
- Neue `RoleBadge`-Komponente: ?? Creator, ?? Admin, ?? Moderator, ? Verifiziert, ?? Mitglied
- Nur vorhandene Rollen in Übersicht (count > 0)
- Kompakte Badges in Mitgliederliste und Dashboard-Header

### 5. Plattform-Icons
- Neue `card`-Variante: Markenfarbe + 36px Icon-Box auf Community-Karten
- Overlay auf Banner: Markenfarbe statt generischem Schwarz
- Footer-Badge mit Markenfarbe

### 6. Community-Karten
- Sichtbare Meta-Zeile: Plattform, Kategorie, Status, Mitgliedschaft
- Preis prominent über Tags
- Mitglieder & Gruppen immer in Footer-Zeile

### 7. Profilseite
- Größerer Avatar (7.58.25rem)
- Kompakteres Cover (h-28/32)
- Statistik-Grid: Mitglied seit, Communities, Events, Verifizierung

### 8. Sicherheit-Bereich
- Moderation, Audit, Verifizierung als gleichwertige Unterkarten unter Sicherheit"
- Keine zusätzliche Verschachtelung

### 9. Share-Funktion
- Mobile: Bottom-Sheet statt abgeschnittenem Dropdown
- Desktop: Dropdown rechts
- Kanäle: Kopieren, Native (iOS/Android), WhatsApp, Telegram, Discord, Facebook

### 10. Mobile UX
- Share Bottom-Sheet mit Safe-Area
- HomeHub Quick-Links: 72px Mindesthöhe
- Alle interaktiven Dashboard-Elemente ? 44px

## Pilot-Testcheckliste (Geräte)

- [ ] iPhone: Hero-Motiv sichtbar, Text unten
- [ ] iPhone: Dashboard  Kategorie wählen ? Unterkarten erscheinen
- [ ] iPhone: Share Bottom-Sheet ? WhatsApp, Native Share
- [ ] Android: Share ? Telegram, Facebook
- [ ] Community-Karte: Plattform sofort erkennbar
- [ ] Profil: Stats sichtbar, Avatar groß genug
- [ ] Rollen-Badges in Mitgliederliste lesbar

## Geänderte Dateien

- `components/home/HomeHero.tsx`
- `components/home/HomeHub.tsx`
- `components/dashboard/DashboardTabs.tsx`
- `app/dashboard/community/[slug]/page.tsx`
- `app/dashboard/community/[slug]/layout.tsx`
- `components/ui/RoleBadge.tsx`
- `components/dashboard/RolesOverview.tsx`
- `components/dashboard/MemberListClient.tsx`
- `components/community/PlatformBadge.tsx`
- `components/community/CommunityCard.tsx`
- `components/profile/ProfileHub.tsx`
- `app/profile/page.tsx`
- `components/share/ShareMenu.tsx`
