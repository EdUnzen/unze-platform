# Phase 1.5 — Passwort vergessen / Reset

**Datum:** 2026-06-13  
**Status:** Abgeschlossen (Code + Build)

---

## Umgesetzte Funktionen

| Anforderung | Umsetzung |
|-------------|-----------|
| Passwort vergessen Button | Login-Formular → `/auth/forgot-password` |
| E-Mail Versand | `resetPasswordForEmail` via Supabase Auth |
| Token Validierung | `/auth/callback` — `verifyOtp` / PKCE `exchangeCodeForSession` |
| Neues Passwort setzen | `/auth/reset-password` + `updateUser({ password })` |
| Fehlerbehandlung | Abgelaufene Links, Passwort-Mismatch, Supabase-Fehler |
| Mobile | Touch-freundliche Formulare, `inputMode="email"` |

---

## Dateien

| Datei | Rolle |
|-------|--------|
| `app/auth/password-actions.ts` | Server Actions |
| `app/auth/forgot-password/page.tsx` | E-Mail anfordern |
| `app/auth/reset-password/page.tsx` | Neues Passwort |
| `app/auth/callback/route.ts` | Recovery-Redirect |
| `components/auth/ForgotPasswordForm.tsx` | UI |
| `components/auth/ResetPasswordForm.tsx` | UI |
| `components/auth/AuthForm.tsx` | Link „Passwort vergessen?" |

---

## Flow

```
Login → „Passwort vergessen?" → E-Mail eingeben
  → Supabase sendet Link → /auth/callback → /auth/reset-password
  → Neues Passwort → Login mit Erfolgsmeldung
```

---

## Supabase-Konfiguration (Production)

1. **Authentication → URL Configuration**
   - Site URL: `https://unze-platform.vercel.app`
   - Redirect URLs: `https://unze-platform.vercel.app/auth/callback`

2. **E-Mail-Templates** — „Reset Password" aktiv lassen

3. **SMTP** — Supabase Standard oder Custom SMTP für zuverlässigen Versand

---

## Tests

| Check | Ergebnis |
|-------|----------|
| `npm run validate:quick` | ✅ |
| `npm run build` | ✅ |
| Manueller E2E | Nach Deploy: E-Mail → Link → Passwort ändern → Login |

### Manueller Test

1. `/auth/login` → „Passwort vergessen?"
2. E-Mail eingeben → Erfolgsmeldung
3. E-Mail öffnen → Link klicken
4. Neues Passwort setzen (min. 8 Zeichen)
5. Mit neuem Passwort anmelden

---

## Bekannte Grenzen

- Kein Rate-Limiting auf App-Ebene (Supabase Auth Limits gelten)
- OAuth-Nutzer ohne Passwort sehen ggf. Fehler beim Reset — erwartetes Supabase-Verhalten
