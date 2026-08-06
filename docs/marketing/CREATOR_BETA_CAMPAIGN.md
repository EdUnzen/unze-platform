# Creator Beta – Finale Kommunikation

## Botschaft

UNZE Connect befindet sich in der **geschlossenen Beta**. Wir testen gemeinsam mit den ersten Creatorn und Crowd Partnern.

**Creator gesucht:** Voller Dashboard-Zugang, kostenlose Communities testen, Feedback geben.  
**Crowd Partner gesucht:** Empfehlungslink, Referral-Tracking, Dashboard-Auswertungen.

## Seitenreihenfolge (Landing)

1. Hero + Suche + Community-Karten  
2. Beta-Transparenz (`/#beta-status`)  
3. Creator & Crowd Partner  

Siehe: `docs/marketing/LANDING_UX_PHASE_STATUS.md` · CORSA UNZE-007 **FINAL**

## CTAs

| Ziel | URL |
|------|-----|
| Creator werden | unzeconnect.app – Registrierung |
| Crowd Partner | unzeconnect.app/dashboard/crowd-partner |
| Communities | www.unze.app/communities |

## Assets

- Story: `output/tiktok/tiktok-01-problem.png` bis `tiktok-07-cta.png`
- Features: `output/features/feat-*.png`
- Creator: `output/creator-beta/`
- Animationen: `output/animations/`

## Regenerierung

```bash
npm run marketing:build
npm run marketing:validate
```

## URLs

- Landing: https://www.unze.app
- Beta-Status: https://www.unze.app/#beta-status
- Plattform: https://www.unzeconnect.app

## Nach Beta

`NEXT_PUBLIC_UNZE_CONNECT_CLOSED_BETA=false` → Beta-Hinweise verschwinden, Produktiv-Copy aktiv.

Siehe: `docs/marketing/BETA_COMMUNICATION.md`
