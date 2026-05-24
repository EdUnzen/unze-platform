# ENVIRONMENT & SECRETS SYSTEM

# Grundprinzip

UNZE verwendet ein sicheres Environment- und Secrets-System.

Wichtige Daten:
- API Keys
- Tokens
- Secrets
- Stripe Keys
- Supabase Keys

dürfen niemals öffentlich sichtbar sein.

---

# Ziel

Das System soll:
- sicher
- sauber
- nachvollziehbar
- skalierbar

sein.

Keine:
- hartcodierten Secrets
- öffentlichen API Keys
- chaotischen Environment-Dateien

---

# Environment Dateien

Geplante Nutzung:

- .env.local
- .env.development
- .env.production

---

# Wichtige Systeme

## Supabase
Benötigt:
- URL
- anon key
- service role key

---

## Stripe
Benötigt:
- publishable key
- secret key
- webhook secret

---

## Vercel
Speichert:
- Environment Variables
- Deployment Settings
- Build-Konfigurationen

---

# Sicherheitsprinzip

Secrets dürfen NICHT:
- in GitHub gepusht werden
- öffentlich sichtbar sein
- im Frontend sichtbar werden

---

# GitHub Prinzip

Environment-Dateien gehören in:
```txt id="m2v8q1"
.gitignore