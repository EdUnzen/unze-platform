# GIT WORKFLOW & VERSIONING

# Grundprinzip

UNZE verwendet ein strukturiertes Git- und Versioning-System.

Ziel:
- sichere Entwicklung
- nachvollziehbare Änderungen
- stabile Releases
- kontrollierte Zusammenarbeit

---

# Ziel

Das System soll:
- stabil
- nachvollziehbar
- skalierbar
- entwicklerfreundlich

sein.

Keine:
- chaotischen Direktänderungen
- unkontrollierten Deployments
- verlorenen Änderungen

---

# Hauptbranch

## main
Der stabile Produktionsbranch.

Nur:
- getestete
- stabile
- geprüfte

Änderungen gelangen hier hinein.

---

# Development Branch

## development
Aktiver Entwicklungsbranch.

Neue Features werden:
- getestet
- geprüft
- vorbereitet

bevor sie nach main gelangen.

---

# Feature Branches

Neue Systeme erhalten eigene Branches.

Beispiele:
- feature/community-system
- feature/discover-ui
- feature/feed-system
- feature/stripe-integration

---

# Workflow-Prinzip

Geplanter Ablauf:

Idee
→ Dokumentation
→ Feature Branch
→ Entwicklung
→ Testing
→ Merge in Development
→ Prüfung
→ Merge in Main

---

# Sicherheitsprinzip

Direkte Änderungen an:
- main
- produktiven Systemen
- kritischen Bereichen

sollen minimiert werden.

---

# Commit-Prinzip

Commits sollen:
- klar
- verständlich
- nachvollziehbar

sein.

Keine:
- chaotischen Sammelcommits
- unverständlichen Änderungen

---

# Beispiel Commits

- add community card component
- improve discover feed logic
- add stripe membership system
- fix mobile navigation bug

---

# Rollback-Prinzip

Das System soll ermöglichen:
- alte Versionen wiederherzustellen
- fehlerhafte Updates zurückzusetzen
- sichere Entwicklungsstände zu behalten

---

# GitHub-Prinzip

GitHub dient für:
- Versionskontrolle
- Projektübersicht
- Branch Management
- Sicherung
- Entwicklungsstruktur

---

# Deployment-Prinzip

Nur stabile Branches sollen:
- produktiv deployed
- öffentlich sichtbar
- langfristig genutzt

werden.

---

# KI-Prinzip

KI-generierter Code muss:
- geprüft
- getestet
- nachvollziehbar

bleiben.

Keine:
- unkontrollierten KI-Massenänderungen
- blinden Auto-Merges

---

# Mobile First

Neue Features müssen:
- mobile getestet
- touchfreundlich
- performant

sein,
bevor sie produktiv gehen.

---

# Zukunftsprinzip

Spätere Erweiterungen:
- automatische Build Checks
- Pull Request Regeln
- CI/CD Pipelines
- automatische Testläufe
- Release-Systeme

---

# Ziel

Das Git- und Versioning-System soll langfristig
eine stabile professionelle Entwicklung
des gesamten UNZE-Ökosystems ermöglichen.