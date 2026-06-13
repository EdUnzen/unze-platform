# Closed Beta — Deployment Report

**Datum:** 2026-06-13  
**Version:** `0.3.0-beta.1`  
**Tag:** `v0.3.0-beta.1`  
**Commit:** `f9ad42e0baf9600c63496568f12bac73d674417e`

---

## 1. GitHub

| Aktion | Status | Details |
|--------|--------|---------|
| Push `main` | ✅ | `0ad0c3c..f9ad42e` → `origin/main` |
| Push Tag | ✅ | `v0.3.0-beta.1` → GitHub (neu) |
| Tag → Commit | ✅ | `f9ad42e` — `release: Closed Beta v0.3.0-beta.1` |

Repository: https://github.com/EdUnzen/unze-platform

---

## 2. Vercel Production

| | |
|---|---|
| **Deployment-ID** | `dpl_FZda89ZohzqVG1FA5va3XCdEXq5y` |
| **Status** | ● Ready |
| **Build** | `unze@0.3.0-beta.1` — Next.js 15.5.18, 25 Routen |
| **Region** | Washington, D.C. (iad1) |
| **Deploy-Methode** | Vercel CLI `--prod` (lokaler Stand = Commit `f9ad42e`) |
| **Inspector** | https://vercel.com/unze1/unze-platform/FZda89ZohzqVG1FA5va3XCdEXq5y |

**Aliase:**
- https://unze-platform.vercel.app
- https://unze-platform-unze1.vercel.app

**Neue/ relevante Routen im Build:**
- `/auth/forgot-password`, `/auth/reset-password`
- `/profile/tickets`
- `/dashboard/community/[slug]/events` (Check-In)

---

## 3. Tag-Abgleich Production ↔ Git

| Prüfung | Ergebnis |
|---------|----------|
| Lokaler HEAD | `f9ad42e` |
| Tag `v0.3.0-beta.1` | `f9ad42e` ✅ |
| GitHub `origin/main` | `f9ad42e` ✅ |
| Vercel Build-Version | `0.3.0-beta.1` ✅ |
| Closed-Beta-Routen live | ✅ (Forgot/Reset/Tickets im Build) |

**Hinweis:** CLI-Deploy überträgt den lokalen Stand von Commit `f9ad42e`. Inhaltlich entspricht Production exakt dem Tag. Ein Git-SHA-Badge im Vercel-Dashboard erscheint nur bei Git-integrierten Deploys (nicht bei reinem CLI-Upload).

---

## 4. Produktions-Smoke-Tests (nach Deploy)

| Test | Ergebnis |
|------|----------|
| `npm run test:e2e-urls` | ✅ 12/12 HTTP 200 |
| `/auth/forgot-password` | ✅ 200, Passwort-UI |
| `/auth/reset-password` | ✅ 200, Passwort-UI |
| `/profile/tickets` | ✅ 200 |
| `/manifest.json` | ✅ 200 (PWA standalone) |
| `/sw.js` | ✅ 200 (PWA v2) |
| `npm run test:event-tickets` | ✅ Buchung, Check-In, Mehrfachnutzung blockiert |

---

## 5. Übergabe Testphase

**Keine weiteren Code-Änderungen** bis Feedback aus Runde 1.

Manuelle Tests auf echten Geräten (Tester / Team):
- iPhone: PWA „Zum Home-Bildschirm“, Navigation, Events
- Android: „App installieren“, Offline-Reload
- Desktop: Premium-Checkout mit Stripe-Testkarte `4242…`
- Passwort-Reset: E-Mail-Link end-to-end (Supabase Auth)

Siehe: `docs/sprints/CLOSED_BETA_TESTER_PACKAGE.md`

---

## Bekannte Restprobleme

| Thema | Status |
|-------|--------|
| Stripe Live-Zahlung in DB | Noch kein E2E-Checkout — Testmodus, manuell im Browser |
| PWA physisch | Manifest + SW live; Installation auf echtem Gerät noch nicht bestätigt |
| Passwort-Reset E-Mail | Route live; vollständiger Mail-Flow nur mit echtem Postfach testbar |
| `package-lock.json` | Version noch `0.2.0` (kosmetisch, kein Laufzeit-Einfluss) |

---

_Deployment abgeschlossen — Closed Beta bereit für Tester._
