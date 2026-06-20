# UNZE  UX-, Dashboard- und Pilotphase-Review

Stand: Juni 2026  
Scope: Gastansicht, Dashboard, Plattform-Icons, Share, Auto-Cover, Onboarding, Mobile UX

---

## Zusammenfassung der umgesetzten Fixes

| Bereich | Problem | Fix |
|---------|---------|-----|
| Dashboard-Tabs | Unterpunkte wirkten wie Fließtext | Größere Buttons (44px), Icons, Border, aktiver Grün-Zustand |
| Dashboard QuickNav | Zu klein, wenig Kontrast | Icon-Boxen, `text-sm`, 44px Touchfläche |
| Plattform-Icons | Zu klein (1218px) | Neue Größen: 16/20/26/32px, größere Grid-Zellen |
| Share-Menü | Discord/Facebook fehlten | Discord (Link kopieren), Facebook Sharer, WhatsApp-Encoding |
| Auto-Cover | Community-Cover fehlte in Kette | 4-Stufen-Priorität: Nutzer ? Community ? Kategorie ? UNZE |
| Gast-Hero | Text zu hoch, Motiv verdeckt | Mehr Hero-Höhe, Text unten (`pt-[52%]`), bessere Objektposition |
| Onboarding | Schritte unklar benannt | Was ist UNZE?, Wie funktioniert UNZE?, Android/iPhone getrennt |
| Profil | Grauer Header ohne Bild | Avatar als Nutzerbild im Auto-Cover-System |

---

## 1. Dashboard / Verwaltung

**Vorher:** Inaktive Unter-Tabs (`text-unze-ink-muted`, kein Border) wirkten wie Labels.

**Nachher (`DashboardTabs.tsx`, `DashboardQuickNav.tsx`):**
- Kategorie-Pills: `text-sm`, Border, Hover
- Unter-Tabs: weiße Buttons mit Border, aktiver Tab grün mit Schatten
- Mindest-Touchfläche 44px (Apple HIG / Material)

**Mobile iPhone:** Horizontales Scrollen der Kategorie-Pills bleibt erhalten; Buttons sind groß genug für Daumenbedienung.

---

## 2. Plattform-Icons

**Geändert in:** `PlatformIcon.tsx`, `OfficialPlatformsGrid.tsx`, `PlatformBadge.tsx`

- Icon-Größen: xs 16px ? lg 32px (vorher max 18px)
- Grid-Zellen: 5664px statt 44px
- Verbundene Plattformen: grüner Ring, stärkerer Schatten
- Labels: `text-xs font-semibold` statt 10px

---

## 3. Share-Funktion

**Geändert in:** `ShareMenu.tsx`

| Kanal | Verhalten | Status |
|-------|-----------|--------|
| Link kopieren | Clipboard + Fallback für ältere Browser | ? Behoben |
| Native Share (iOS/Android) | Web Share API mit Titel, Text, URL | ? |
| WhatsApp | `wa.me/?text=` mit korrekt encodiertem Text+URL | ? Behoben |
| Telegram | `t.me/share/url` | ? |
| Discord | Kein Web-Intent  Text+Link in Zwischenablage | ? Neu |
| Facebook | `facebook.com/sharer/sharer.php?u=` | ? Neu |
| X/Twitter | Intent-URL | ? |

**Hinweis:** Discord hat keinen zuverlässigen Web-Share-Deep-Link. Lösung: Für Discord kopieren mit vorgefülltem Text.

**Menü:** 44px Touch-Ziele, Plattform-Icons statt generischer Lucide-Icons.

---

## 4. Auto-Cover-System

**Prioritätskette (`auto-cover.ts`):**

1. **Nutzerbild**  Community-Banner, Gruppen-Cover, Event-Cover, Profil-Avatar
2. **Community-Cover**  Community-Banner als Fallback für Gruppen/Events/Services
3. **Kategorie-Cover**  Unsplash-Presets pro Kategorie
4. **UNZE-Standard**  Preset `general-3`

**Betroffene Bereiche:**
- Communities ? (Nutzer ? Kategorie ? Standard)
- Gruppen/Services ? (+ Community-Banner in DB-Query)
- Events ? (bereits Community-Fallback, jetzt einheitlich)
- Profile ? (Avatar als Nutzerbild)

Keine leeren/grauen Karten mehr: `coverImageCandidates()` liefert immer mindestens Kategorie + UNZE-Standard.

---

## 5. Gastansicht / Landing

**`HomeHero.tsx` (guest):**
- Min-Höhe 300px (Mobile) ? mehr Bild sichtbar
- Text-Block mit `pt-[52%]`  Motiv oben frei
- `object-[center_35%]`  Fokus auf Bildmitte
- CTAs: 44px Mindesthöhe, `text-sm`

---

## 6. Erstbesucher-Onboarding

**`FirstVisitOnboarding.tsx`:** Zeigt Dialog nur wenn `localStorage` Key `unze-onboarding-complete-v1` fehlt.

**Schritte (`UnzeOnboardingDialog.tsx`):**
0. Was ist UNZE?
1. Wie funktioniert UNZE? (5 Säulen)
2. Installation  Android oder iPhone (automatische Erkennung)

**Nach Abschluss:** Key wird gesetzt, Dialog erscheint nicht erneut. Manuelles Öffnen weiterhin über Was ist UNZE?-Button (Gast) oder Profil-Hilfe.

---

## 7. Designsystem  Lesbarkeit

**Standards nach diesem Sprint:**
- Mindest-Touchfläche: **44×44px** (`.touch-target`, `.interactive-pill`)
- Body-Text: mindestens **`text-sm` (14px)** auf interaktiven Elementen
- Micro-Labels: mindestens **`text-xs` (12px)**  nicht kleiner auf tappbaren Flächen
- Icons in Navigation/Dashboard: mindestens **1620px**
- Aktive Zustände: Grün-Hintergrund + Schatten (nicht nur Textfarbe)

---

## 8. Mobile UX Review  Neuer-Nutzer-Flow

Code-Review + strukturelle Prüfung aller Hauptflows:

### Registrierung
- Hero-CTA Kostenlos registrieren gut sichtbar (44px Button)
- Onboarding nach 800ms beim Erstbesuch
- **Hinweis:** Auth-Formular selbst nicht geändert  bei Pilot testen ob Felder groß genug sind

### Community entdecken
- Discover + Home-Preview mit `CommunityCard` (Touch-Target, Cover-Fallback)
- Plattform-Badge auf Cards vergrößert

### Community öffnen
- Header mit Auto-Cover, Plattform-Grid vergrößert
- Gruppen/Events nutzen Community-Banner als Fallback

### Gruppe / Event / Service öffnen
- Eigene Cover-Kette mit Community-Fallback
- Share-Button oben rechts (10×10px Button ? verbessert)

### Teilen
- Vollständiges Menü mit allen geforderten Kanälen
- Native Share auf iOS/Android über Teilen

### Profil
- Avatar im Cover-Bereich sichtbar
- Menüzeilen mit 44px+ Höhe

### Dashboard
- Tab-Navigation deutlich als Buttons erkennbar
- QuickNav mit Icon-Boxen

### Verbleibende Beobachtungen (Pilot testen)

| Stelle | Beobachtung | Priorität |
|--------|-------------|-----------|
| Dashboard auf iPhone SE | Viele Tabs ? horizontales Scrollen nötig | Niedrig (UX ok) |
| Share-Menü auf Cards | Dropdown kann am Bildschirmrand abgeschnitten werden | Mittel  bei Pilot prüfen |
| Discord-Share | Kopieren statt Deep-Link (Plattform-Limit) | Akzeptiert |
| Gruppen ohne Cover + Community ohne Banner | Kategorie-Cover greift  kein Grau | ? Behoben |
| Bottom Nav Labels | `text-[10px]`  klein aber Standard für Tab Bars | Optional später vergrößern |

---

## Testplan für Pilotphase (manuell auf Geräten)

- [ ] iPhone Safari: Gast-Landing, Hero-Motiv, Onboarding, PWA-Install-Schritte
- [ ] Android Chrome: Native Share ? WhatsApp, Telegram, Facebook
- [ ] iOS: Native Share ? WhatsApp, Telegram
- [ ] Dashboard: alle Unter-Tabs antippbar, aktiver Zustand sichtbar
- [ ] Community ohne Banner: Kategorie-Cover sichtbar (kein Grau)
- [ ] Gruppe ohne Cover: Community-Banner oder Kategorie-Cover
- [ ] Share ? Discord: Text in Zwischenablage, in Discord einfügen
- [ ] Zweiter Besuch: Onboarding erscheint nicht

---

## Geänderte Dateien

- `components/dashboard/DashboardTabs.tsx`
- `components/dashboard/DashboardQuickNav.tsx`
- `components/platform/PlatformIcon.tsx`
- `components/community/OfficialPlatformsGrid.tsx`
- `components/community/PlatformBadge.tsx`
- `components/share/ShareMenu.tsx`
- `lib/visual/auto-cover.ts`
- `lib/visual/resolve-banner.ts`
- `types/community.ts`
- `lib/mappers/community.mapper.ts`
- `services/community/group.repository.ts`
- `components/community/CommunityGroupCard.tsx`
- `components/community/CommunityGroupList.tsx`
- `components/home/HomeHero.tsx`
- `components/profile/ProfileHub.tsx`
- `app/profile/settings/page.tsx`
- `components/onboarding/UnzeOnboardingDialog.tsx`
- `components/onboarding/GuestOnboardingHint.tsx`
- `lib/constants/onboarding-copy.ts`
- `components/owner/OwnerCenter.tsx`
- `styles/globals.css`
