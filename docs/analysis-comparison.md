# Vergleich: Referenz-Output vs. HM-Export

Erstellt am: 2026-02-04

## Legende
- **REF** = referenz-output (Doc-To-Help generiert, Zielformat)
- **EXP** = hm-export (unsere H&M Shell)

---

## 1. Grundlegendes / Body

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Body-Background | `#DFEAF7` (hellblau) | `#F5F5F5` (grau) | **ABWEICHUNG** |
| Body-Padding | 0 | 8px | **ABWEICHUNG** |
| Basis-Font-Family | `"Segoe UI", Arial, sans-serif` | `"Segoe UI", sans-serif` | OK (minor) |
| Basis-Font-Size | 12.8px (0.8em) | 14.6667px | **ABWEICHUNG** |
| Text-Farbe | `#333` | `#000` | **ABWEICHUNG** |
| Layout-System | absolute Positionierung | CSS Grid | OK (Implementierung) |

## 2. Toolbar

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Höhe | 75px | ~119px | **ABWEICHUNG** |
| Background | transparent | gradient(weiß → #DFEAF7) | Akzeptabel |
| Button-Font | `"Segue UI", sans-serif` | Arial | **ABWEICHUNG** |
| Button-Font-Size | 10.24px | 13.33px | **ABWEICHUNG** |
| Button-Größe | 75×75px | ~71×81px | Akzeptabel |
| Button-Border | transparent | sichtbar (1px solid) | **ABWEICHUNG** |
| Button-Color | `#454545` | `rgba(16,16,16,0.3)` disabled | Akzeptabel |
| Gruppentext-Weight | 700 (bold) | - | Prüfen |
| Gruppen-Trennung | border-left auf Gruppe | border-right auf Gruppe | OK |
| Icon-Sprite | `ui-icons_ikaros-help.png` | `ui-icons_ikaros-help.png` | OK |
| Icon-Größe | 32×16px | 32×16px | OK |

## 3. Sidebar

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Breite | ~344px | 280px | **ABWEICHUNG** |
| Background | nicht gesetzt (transparent) | weiß | Akzeptabel |
| Border rechts | keiner (Splitter) | 1px solid #DDD | OK |
| Splitter | 5px, ziehbar | keiner | **FEHLT** |

## 4. Accordion-Tabs

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Aktiver Tab BG | `#C4DDFC` | `#C4DDFC` | OK |
| Inaktiver Tab Color | `#454545` | `#333` | OK (nah) |
| Tab-Font-Size | 11.52px | 14.6667px | **ABWEICHUNG** |
| Tab-Padding | 5.76px / 8px | 8px / 12px | Etwas größer |
| Tab-Border | 1px solid #CCC | 1px solid #CCC | OK |
| Tab-Icons | jQuery-UI sprites (help, index, search) | ▼/▶ Text-Marker | **ABWEICHUNG** |
| Tab-Höhe | ~22px | ~34px | **ABWEICHUNG** |

## 5. TOC-Baum

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Link-Font-Size | 11.52px | 11.52px | OK |
| Link-Line-Height | 14.976px | 14.976px | OK |
| Link-Color | `#333` | `#1E395B` | **ABWEICHUNG** |
| Link-Padding-Left | 17px | 0 | **ABWEICHUNG** |
| Aktiver Link BG | `#CBE1FC` | keiner | **FEHLT** |
| Aktiver Link Underline | ja | ja | OK |
| TOC-Icons | jQuery-UI (folder-open/-collapsed, document) | Sprite `ui-icons_ikaros-help.png` | OK |
| Icon-Größe | 16×16px | 16×16px | OK |
| List-Style | none | disc (sichtbare Bullets!) | **BUG** |

## 6. Content-Bereich

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Background | weiß | weiß | OK |
| Panel-Border | 1px solid #AAA | keine | **ABWEICHUNG** |
| Panel-Border-Radius | ja (ui-corner-all) | nein | **ABWEICHUNG** |
| Content-Padding | 38.4px L/R | 32px L/R, 24px T/B | Akzeptabel |
| Text-Color | `#333` | `#000` | **ABWEICHUNG** |

### 6.1 Überschriften

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Tag | H1 | H2 | **ABWEICHUNG** |
| Font-Size | 26.6667px | 24px | **ABWEICHUNG** |
| Color | `#333` | `#000` | **ABWEICHUNG** |
| Margin-Top | 16px | 24px | Akzeptabel |

### 6.2 Zwischenüberschriften

| Eigenschaft | REF (`p.berschriftEinfachGross`) | EXP (`p.p_UeberschriftEinfach_Gross`) | Status |
|---|---|---|---|
| Font-Family | "Segoe UI Semibold" | "Segoe UI Semibold" | OK |
| Font-Size | 14.6667px | 14.6667px | OK |
| Color | `#333` | `#000` | **ABWEICHUNG** |
| Margin | 12px/4px/18.9px | 12px/4px/18.9px | OK |

### 6.3 Fließtext

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Font-Size | 14.6667px | 14.6667px | OK |
| Color | `#333` | `#000` | **ABWEICHUNG** |

### 6.4 Bold/Strong

| Eigenschaft | REF (`strong`) | EXP (`.f_Strong`) | Status |
|---|---|---|---|
| Font-Weight | 700 | 400 | **BUG** |
| Element | `<strong>` | `<span class="f_Strong">` | Struktur-Diff |

### 6.5 Links im Content

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Vorhanden | ja (`a.topic-link`) | NEIN | **FEHLT** |
| Color | `#0055B9` | - | - |
| Text-Decoration | none | - | - |

## 7. Breadcrumb

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Font-Size | 11.52px | 13.6px | **ABWEICHUNG** |
| Color | `#0055B9` (Link) | `#1265AB` (Text) | Akzeptabel |
| Background | transparent | `#F8F9FA` | Akzeptabel |
| Border-Bottom | 1px solid `#333` | 1px solid #DDD | Akzeptabel |
| Klickbar | ja (Link) | nein (Span) | **BUG** |
| Mehrstufig | ja (Pfad-Navigation) | nein (nur Topic-Titel) | **FEHLT** |

## 8. Tabellen

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Kopf-BG | `#E1EAF6` (hellblau) | `#4F81BD` (dunkelblau) | **ABWEICHUNG** |
| Kopf-Text-Color | `#000` | `#FFF` (weiß via strong) | **ABWEICHUNG** |
| Kopf-Text-Align | left | center | **ABWEICHUNG** |
| Kopf-Font-Weight | 400 (normal) | 700 (bold) | **ABWEICHUNG** |
| Zellen-Border | 1px solid #D3D3D3 | 1px solid #A6A6A6 | Akzeptabel |
| Zellen-Padding | 3.8px/7.2px | 6px | Akzeptabel |
| Zellen-BG | `#E1EAF6` (alle) | transparent | **ABWEICHUNG** |

## 9. Schlagwortsuche

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Input-Font-Size | 11.52px | 14.4px | **ABWEICHUNG** |
| Input-Höhe | 12px | 34px | **ABWEICHUNG** |
| Input-Breite | 332px | 255px | Sidebar-Breite-bedingt |
| Link-Color | `#1E395B` | `#1265AB` | **ABWEICHUNG** |
| Link-Font-Size | 11.52px | 14.4px | **ABWEICHUNG** |
| List-Style | none | disc | **BUG** |
| Sub-Items | eingerückt, mit Links | eingerückt, Expand-Marker | OK |

## 10. "Themen"-Sektion (Related Topics)

| Eigenschaft | REF | EXP | Status |
|---|---|---|---|
| Vorhanden | ja (hr + Links) | NEIN | **FEHLT** |

---

## Priorisierte Fix-Liste

### Priorität 1: Bugs (falsches Verhalten)

1. **`.f_Strong` hat kein Bold** — `font-weight: 400` statt 700. Die `<span class="f_Strong">` Elemente müssen `font-weight: bold` bekommen.
   - Datei: `trms_styles.css`

2. **TOC List-Style Bullets sichtbar** — `list-style: disc` statt `none`. Die `<ul>` und `<li>` im TOC zeigen Standard-Bullets.
   - Datei: `shell.css`

3. **Keywords List-Style Bullets sichtbar** — Gleicher Bug in der Schlagwort-Liste.
   - Datei: `shell.css`

4. **Breadcrumb nicht klickbar** — Sollte ein Link sein, der zum Parent-Topic navigiert.
   - Datei: `shell.js`

### Priorität 2: Wichtige visuelle Abweichungen

5. **Text-Farbe `#000` statt `#333`** — Alle Texte sind zu dunkel. Die globale Text-Farbe sollte `#333333` sein.
   - Datei: `trms_styles.css` / `shell.css`

6. **Body-Background `#F5F5F5` statt `#DFEAF7`** — Sollte den hellblauen Hintergrund haben.
   - Datei: `shell.css`

7. **Kein aktiver TOC-Hintergrund** — Das selektierte TOC-Item braucht `background: #CBE1FC`.
   - Datei: `shell.css`

8. **Tabellenkopf zu dunkel** — `#4F81BD` (dunkelblau) statt `#E1EAF6` (hellblau). Kopftext soll schwarz auf hellblau sein, nicht weiß auf dunkelblau.
   - Datei: `trms_styles.css`

9. **Tabellenkopf Text-Align center statt left** — Kopfzeilen-Text soll linksbündig sein.
   - Datei: `trms_styles.css`

10. **Basis-Font-Size zu groß** — 14.6667px statt 12.8px. Das `font-size: 0.8em` greift nicht korrekt.
    - Datei: `shell.css`

### Priorität 3: Fehlende Features

11. **"Themen"-Sektion fehlt** — Am Ende jedes Topics soll eine "Themen:" Sektion mit Links zu Unterthemen stehen.
    - Datei: `project.hmxp` (Topic-Template) oder `shell.js`

12. **Links im Content fehlen** — Topic-zu-Topic-Links werden nicht als klickbare Links gerendert.
    - Datei: `shell.js` (Link-Handling beim Topic-Load)

13. **Breadcrumb-Navigation mehrstufig** — Sollte den vollen Pfad zeigen und klickbar sein.
    - Datei: `shell.js`

### Priorität 4: Feinschliff

14. **Sidebar-Breite 280px statt ~344px** — Etwas schmaler als Referenz.
    - Datei: `shell.css`

15. **Body-Padding entfernen** — 8px Padding am Body existiert in Referenz nicht.
    - Datei: `shell.css`

16. **Toolbar-Buttons: Border sichtbar** — Sollen transparent sein wie in Referenz.
    - Datei: `shell.css`

17. **Toolbar-Button-Font** — Arial statt Segoe UI.
    - Datei: `shell.css`

18. **Accordion-Tab-Icons** — ▼/▶ Text-Marker statt grafischer Icons (help.png, index.png, search.png).
    - Datei: `shell.css` / `shell.js`

19. **Tabellenzellen-BG fehlt** — Alle Zellen sollten `#E1EAF6` Hintergrund haben.
    - Datei: `trms_styles.css`

20. **Content-Panel Border und Border-Radius** — Referenz hat 1px solid #AAA und abgerundete Ecken.
    - Datei: `shell.css`

21. **H1 statt H2** — Topic-Titel nutzt H2, Referenz nutzt H1. Kann im Topic-Template geändert werden.
    - Datei: `project.hmxp` (Topic-Template)

---

## Zusammenfassung

| Kategorie | Anzahl Abweichungen |
|---|---|
| Bugs (falsches Verhalten) | 4 |
| Wichtige visuelle Abweichungen | 6 |
| Fehlende Features | 3 |
| Feinschliff | 8 |
| **Gesamt** | **21** |

Die dringendsten Fixes sind die CSS-Bugs (#1-3) und die globale Text-Farbe (#5). Diese sind einfach zu beheben und verbessern das Erscheinungsbild sofort. Die Tabellen-Styling-Probleme (#8-9) sind ebenfalls auffällig und leicht zu fixen.
