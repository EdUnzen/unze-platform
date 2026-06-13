# Owner Center — Minimalversion

**Route:** `/owner`  
**Zugriff:** `profiles.platform_role = 'owner'` (oder legacy `platform_admin`)

## Rollenvergabe (ohne E-Mail im Code)

```bash
npm run db:migrate:033
npm run assign:owner -- edudemo
```

Username aus Profil — nicht die E-Mail hardcoden.

## Module

1. **Plattformübersicht** — Nutzer, Communities, Gruppen, Events, Services
2. **Meldungen** — Offen / Bearbeitet / Ignoriert (plattformweit)
3. **Verifizierungen** — Genehmigen, Ablehnen, Entfernen
4. **Plattformmaßnahmen** — Community/Creator sperren & freigeben

## Sicherheit

- Layout-Guard `requirePlatformOwner()` — andere Nutzer → Redirect `/`
- Kein Link in der Shell für Nicht-Owner
- DB-Trigger verhindert Selbst-Eskalation der Rolle
- Schreiboperationen via Service Role nach Server-Guard

## Nicht enthalten

- Mitarbeiterverwaltung
- Live-Monitoring
- Komplexe Statistiken

Community-Verwaltung bleibt beim Creator (`/dashboard/community/...`).
