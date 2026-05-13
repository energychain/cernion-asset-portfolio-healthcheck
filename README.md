# 🔧 Anlagenportfolio Health-Check

> Asset-Manager-Übersicht aller Erzeugungsanlagen — Performance, EEG-Restlaufzeit, Handlungsempfehlungen

**Live-Demo:** [energychain.github.io/cernion-asset-portfolio-healthcheck](https://energychain.github.io/cernion-asset-portfolio-healthcheck/)

---

## 1. Der Use Case

### Medien-Anker
> *„Über 100.000 PV-Anlagen verlieren 2025 die EEG-Förderung — Stadtwerke stehen vor Stilllegungs- oder Repowering-Entscheidungen"* (BNetzA/Fachpresse 2024/25)

### Problemstellung
Deutsche Stadtwerke und Kommunalversorger betreiben hunderte Erzeugungsanlagen (PV, Wind, Biogas) im eigenen Bestand. Mit dem Auslaufen der EEG-Förderung ab 2025 müssen Entscheidungen getroffen werden:
- **Weiterbetrieb** ohne EEG-Vergütung (nur Spotmarkt-Erlös)?
- **Repowering** (alte Module gegen neue tauschen)?
- **Stilllegung** (Demontage + Recycling)?

Heute basiert diese Entscheidung auf Fragmentierung: Immobilienverwaltung hat die Anlagendaten, das Rechnungswesen die Ertragszahlen, die Technik den Zustandsbericht. Eine ganzheitliche, datenbasierte Bewertung existiert selten.

### Alleinstellungsmerkmal
Cernion a2mdm konsolidiert Anlagen-Masterdaten (Inbetriebnahme, Kapazität, Standort), Messdaten (Ertragszeitreihen) und regulatorische Metadaten (EEG-Vergütungssätze, Restlaufzeiten) in einer API — und erlaubt automatisierte Handlungsempfehlungen per Tenant.

---

## 2. Was das Tool zeigt

| Feature | Beschreibung |
|---------|--------------|
| **Portfolio-Health** | Durchschnittliche Performance (Ist vs. Soll) aller Anlagen |
| **KPI-Übersicht** | Anzahl, Gesamtleistung, auslaufende Förderungen |
| **Handlungsempfehlungen** | Automatisch generierte Alerts: Stilllegung, Repowering, Wartung |
| **Anlagengewichtung** | Typ-Verteilung nach installierter Leistung (Doughnut-Chart) |
| **Jahreserträge** | Ist- vs. Soll-Vergleich pro Anlage (Balkendiagramm) |
| **Performance-Ranking** | Relative Ertragsperformance als Ampelfarben |
| **EEG-Ampel** | 🔴 < 3 Jahre / 🟡 4–8 Jahre / 🟢 > 8 Jahre Restlaufzeit |
| **Tenant-fähig** | Konfigurierbare API-URL, Tenant-ID und Token |

---

## 3. Technischer Stack

| Schicht | Technologie | Entscheidung |
|---------|-------------|------------|
| Frontend | Vanilla HTML5 + ES5 JavaScript | Zero-Build — jeder Fork läuft sofort, keine Build-Toolchain |
| Styling | Pico.css (CDN) | Professionell, Dark-Mode, kein Build-Step |
| Charts | Chart.js (CDN) | Industriestandard, einfach, keine Abhängigkeiten |
| Backend | Cernion a2mdm API | Kein eigenes Backend nötig; deterministisch, auditierbar |
| Hosting | GitHub Pages | Kostenlos, automatisch, Fork = eigene Demo |
| CI/CD | GitHub Actions | Push → Build → Deploy, kein manueller Schritt |

---

## 4. Schnellstart

### Live-Demo (kein Setup nötig)
[energychain.github.io/cernion-asset-portfolio-healthcheck](https://energychain.github.io/cernion-asset-portfolio-healthcheck/)

### Lokal ausführen
```bash
git clone https://github.com/energychain/cernion-asset-portfolio-healthcheck.git
cd cernion-asset-portfolio-healthcheck
python -m http.server 8080
# oder: npx serve .
```
Öffne [http://localhost:8080](http://localhost:8080)

### Cernion-API anbinden
1. Im Tab **Einstellungen** API-URL, Tenant-ID und optional Token eingeben
2. **Verbindung testen** klicken
3. Bei Erfolg lädt die App Live-Daten

---

## 5. Cernion-Mehrwert

| Ohne Cernion a2mdm | Mit Cernion a2mdm |
|--------------------|-------------------|
| Excel-Sammelsurium aus SCADA, SAP, Immobilienverwaltung | **Eine API** — Anlagen, Erträge, Zustand, Förderung zentral |
| Manuelle Berechnung von Performance-Ratios und Restlaufzeiten | **Automatische Health-Bewertung** mit Ampel-System |
| Keine tenant-getrennte Übersicht über mehrere Kunden/Tochtergesellschaften | **Tenant-Isolation** — jeder Tochterges. sieht nur eigenes Portfolio |
| Fehleranfällige Datenzusammenführung per Copy-Paste | **Deterministisch + Auditierbar** — jede Kennzahl nachvollziehbar |
| Reaktiver Ansatz: Entscheidung erst bei Förderauslauf | **Proaktiv** — frühwarnsystem für Repowering/Stilllegung |

### Spezifische Cernion-Services
- **EDM** (Energy Data Management): Zeitreihen-Import und -Analyse für Ertragsdaten
- **MeLo-Management**: Masterdaten aller Messlokationen inkl. technischer Metadaten
- **Multi-Tenancy**: Portfolien verschiedener Stadtwerke sind voneinander isoliert

---

## 6. Demo-Daten

Die Demo-Daten repräsentieren ein typisches Stadtwerke-Portfolio mit 6 Anlagen:

| Anlage | Typ | Kapazität | Inbetriebnahme | Performance | Status |
|--------|-----|-----------|----------------|-------------|--------|
| PV-Anlage Hofheim | PV-Freifläche | 920 kWp | 2012 | 90,5% | Gut |
| PV-Anlage Wiesbaden | PV-Dach | 1.200 kWp | 2016 | 102,2% | Hervorragend |
| Windpark Esterau | Wind-Onshore | 3.000 kW | 2014 | 90,7% | Achtung |
| Biogas-Grossen | Biogas | 500 kW | 2011 | 96,0% | Gut |
| PV-Anlage Klein | PV-Dach | 85 kWp | 2019 | 85,7% | Achtung |
| PV + Speicher Klein-Winternheim | PV + Speicher | 200 kWp | 2021 | 103,4% | Hervorragend |

### Bewertungslogik

| Performance | Empfehlung |
|-------------|------------|
| ≥ 95% | Planbarer Weiterbetrieb |
| 88–94% | Wartung/Instandsetzung prüfen |
| < 88% | Stilllegung oder Repowering prüfen |

| EEG-Restlaufzeit | Aktion |
|------------------|--------|
| > 8 Jahre | Keine Anpassung nötig |
| 4–8 Jahre | PPA/PPX-Verhandlung beobachten |
| ≤ 3 Jahre | Repowering- oder Stilllegungsplanung aktivieren |

---

## 7. Architektur

```
  ┌─────────────────────────────┐
  │  Browser (GitHub Pages)     │
  │  ┌──────┬──────┬────────┐   │
  │  │KPIs  │Charts│Settings│   │
  │  └──┬───┴──┬───┴────┬───┘   │
  │     │      │        │       │
  │  ┌──▼──────▼────────▼──┐    │
  │  │  CernionAPI Class   │    │
  │  │  (api.js)           │    │
  │  │  • Tenant-Header    │    │
  │  │  • Fetch-Wrapper    │    │
  │  │  • Demo-Fallback    │    │
  │  └──────────┬──────────┘    │
  └─────────────┼───────────────┘
                │ HTTPS
  ┌─────────────▼───────────────┐
  │  CERNION a2mdm (SaaS)       │
  │  ┌─────────────────────┐    │
  │  │  + Multi-Tenancy    │    │
  │  │  + EDM: Zeitreihen  │    │
  │  │  + MeLo-Management  │    │
  │  │  + Audit-Trail      │    │
  │  └─────────────────────┘    │
  └─────────────────────────────┘
```

### API-Endpunkte (beispielhaft)
| Methode | Endpoint | Zweck |
|---------|----------|-------|
| GET | `/edms/melos` | Alle Anlagen/MeLos des Tenants |
| GET | `/edms/timeseries` | Ertragszeitreihen per MeLo |

---

## Lizenz

Dieses Tool ist unter der GNU Affero General Public License v3 (AGPL-3.0) lizenziert.
Siehe [LICENSE](./LICENSE).

---

*Erstellt im Cernion Agentic Hackathon — ein Open-Source-Initiative der energychain.de*
