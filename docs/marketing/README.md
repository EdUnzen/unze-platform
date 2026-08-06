# UNZE Marketing v3

Premium-Produktmarketing: echte App-Screenshots, immersive iPhone-Mockups, keine Textfolien.

## Ordnerstruktur

| Ordner | Rolle | Inhalt |
|--------|------|--------|
| `raw-screens/marketing/` | **Pipeline-Quelle** | Saubere App-Captures (`?marketing=1`) |
| `raw-screens/documentation/` | *Reserviert* | Tutorials/Onboarding erlaubt |
| `engine/` | **Compositor** | HTML-Templates fuer Mockups |
| `animations/` | **Quellen** | HTML fuer GIF-Render |
| `output/` | **Export** | Fertige PNG/GIF (automatisch) |
| `graphics/` | **Manuell** | Kuratierte Mockups & Social-Assets |
| `screenshots/marketing/` | **Portfolio** | Marketing-Screens (3 Viewports) |
| `screenshots/documentation/` | **Portfolio** | Login, Gast-Flows, Doku |
| `templates/` | *Reserviert* | Noch leer |

**Regel:** Social-Exports nur aus `output/` und freigegeben aus `graphics/`. Keine Login-Screens in Marketing.

## Pipeline

```bash
# Vollstaendiger Build (Connect-App, Default: www.unzeconnect.app):
npm run marketing:build

# Nur Validierung:
npm run marketing:validate

# Portfolio (Marketing, saubere UI):
npm run screenshots:marketing

# Portfolio (Dokumentation, Login erlaubt):
npm run screenshots:documentation
```

## Marketing-Modus

Plattform-Routen mit `?marketing=1`: blendet Onboarding, PWA und Hilfe-UI aus. Siehe `lib/marketing/marketing-mode.ts`.

## Domains

| Bereich | URL |
|--------|-----|
| Marketing / Business | https://www.unze.app |
| Plattform (Captures) | https://www.unzeconnect.app |

Audit: `PROJEKTE/UNZE/Berichte/2026-06-20_MARKETING_STRUKTUR_AUDIT_UNZE.md`
