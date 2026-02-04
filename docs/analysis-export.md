# Export-Site Analyse (hm-export)

Analysiert am: 2026-02-04
URL: http://127.0.0.1:8081/Help.html

## Screenshots
- `screenshots/export-overview.png` - Startansicht mit TOC und Topic
- `screenshots/export-topic-table.png` - Topic mit Tabelle (Artefaktpaket-Assistent)
- `screenshots/export-keywords.png` - Schlagwortsuche-Panel

## 1. Gesamtlayout

### Struktur
```
┌─────────────────────────────────────────────────┐
│ Toolbar: [<][>][Home][ID] | [Tree][Load] | [Print]
│ (3 Gruppen, getrennt durch Border-Right)        │
│ Labels: "Navigation" | "Chapters" | "Print"     │
├───────────────┬─────────────────────────────────┤
│ Sidebar       │ Breadcrumb                      │
│ #sidebar      │─────────────────────────────────│
│ width: 280px  │ #content (weiß)                 │
│               │                                 │
│ Accordion:    │ Topic Content                   │
│ - Hilfe (TOC) │                                 │
│ - Schlagwort  │                                 │
│ - Volltext    │                                 │
│               │                                 │
│ (kein         │                                 │
│  Splitter)    │                                 │
└───────────────┴─────────────────────────────────┘
```

### Hauptcontainer
- `#shell`: display: grid, width: 929px
- Body Background: `rgb(245, 245, 245)` (#F5F5F5)
- Body Padding: 8px allseitig
- Toolbar-Gradient: `linear-gradient(rgb(255,255,255), rgb(223,234,247))`

### Unterschiede zur Referenz
- Layout: CSS Grid statt absolute Positionierung
- Body hat Padding (8px) - Referenz hat keins
- Body-BG ist grau (#F5F5F5) statt hellblau (#DFEAF7)
- Kein Splitter zwischen Sidebar und Content

## 2. Toolbar

### Toolbar-Container (`#toolbar`)
- Display: flex
- Padding: 8px allseitig
- Border-Bottom: 1px solid `rgb(204, 204, 204)`
- Background: `linear-gradient(white, rgb(223,234,247))`
- Höhe: ~119px

### Toolbar-Gruppen (`.toolbar-group`)
- Display: flex
- Margin-Right: 12px
- Padding-Right: 12px
- Border-Right: 1px solid `rgb(192, 192, 192)` (Trennlinie)

### Buttons (`#toolbar button`)
- Font: Arial (nicht Segoe UI!)
- Font-Size: 13.33px
- Color (disabled): `rgba(16, 16, 16, 0.3)`
- Größe: ~71×81px
- Padding: 8px allseitig
- Border: 1px solid (sichtbar!)
- Display: flex
- Text-Align: center

### Button-Icons
- Sprite: `ui-icons_ikaros-help.png` (gleich wie Referenz)
- Icons: 16×16px in TOC, 32×16 für Toolbar

## 3. Sidebar / Accordion

### Sidebar (`#sidebar`)
- Width: 280px (Referenz: ~344px)
- Background: weiß
- Border-Right: 1px solid `rgb(221, 221, 221)` (#DDD)
- Display: flex

### Accordion-Header (`.accordion-header`)
- Background: `rgb(196, 221, 252)` (#C4DDFC) - gleich wie Referenz!
- Color: `rgb(51, 51, 51)` (#333)
- Padding: 8px oben/unten, 12px links/rechts
- Border: 1px solid `rgb(204, 204, 204)` allseitig
- Höhe: ~34px

### Accordion-Panel geschlossen
- Höhe: 34px (nur Header sichtbar)
- Border-Bottom: 1px solid `rgb(221, 221, 221)`

### Accordion-Panel geöffnet
- Flex-grow, füllt verfügbaren Platz

### Accordion-Marker
- ▼ für geöffnetes Panel
- ▶ für geschlossenes Panel
- (Referenz nutzt jQuery-UI Icons)

## 4. TOC-Baum

### TOC-Items (`.toc-item`)
- Font: `"Segoe UI", sans-serif`
- Font-Size: 14.6667px (auf LI-Ebene, aber Links haben 11.52px)
- List-Style: disc (Standard - sollte none sein!)

### TOC-Links (`.toc-link`)
- Font: `"Segoe UI", sans-serif`
- Font-Size: 11.52px
- Line-Height: 14.976px
- Color: `rgb(30, 57, 91)` (#1E395B)
- Display: block

### Aktiver TOC-Link (`.toc-link.active`)
- Color: `rgb(30, 57, 91)` (gleich wie normal)
- Text-Decoration: underline
- **KEIN** Background-Color (Referenz hat `#CBE1FC`)

### TOC-Icons (`.toc-icon`)
- Sprite: `ui-icons_ikaros-help.png`
- Größe: 16×16px
- Margin-Right: 6.4px
- Background-Repeat: no-repeat

### Einrückung
- Standardmäßig über verschachtelte UL-Elemente

## 5. Content-Bereich

### Content-Area (`#content-area`)
- Background: weiß
- Width: 649px
- Display: flex
- Font-Size: 14.6667px

### Breadcrumb (`#breadcrumb`)
- Font-Size: 13.6px
- Color: `rgb(18, 101, 171)` (#1265AB)
- Background: `rgb(248, 249, 250)` (#F8F9FA)
- Padding: 8px oben/unten, 16px links/rechts
- Border-Bottom: 1px solid `rgb(221, 221, 221)`
- Höhe: 32px
- **Kein Link** - Text ist nicht klickbar (nur Span)
- Keine Breadcrumb-Trennlinie unten (Referenz hat border-bottom: 1px solid #333)

### Content (`#content`)
- Font: `"Segoe UI", sans-serif`
- Font-Size: 14.6667px
- Color: `rgb(0, 0, 0)` (schwarz - Referenz: #333)
- Padding: 24px oben/unten, 32px links/rechts

### Überschrift H2 (statt H1!)
- Font: `"Segoe UI", sans-serif`
- Font-Size: 24px (Referenz H1: 26.6667px)
- Font-Weight: 700
- Color: `rgb(0, 0, 0)` (Referenz: #333)
- Margin: 24px oben, 4px unten

### Zwischenüberschrift (`.p_UeberschriftEinfach_Gross`)
- Font: `"Segoe UI Semibold", sans-serif` - gleich wie Referenz
- Font-Size: 14.6667px
- Margin: 12px oben, 4px unten, 18.9px rechts
- Color: `rgb(0, 0, 0)` (Referenz: #333)

### Fließtext (`.p_Normal`)
- Font-Size: 14.6667px
- Color: `rgb(0, 0, 0)`
- Margin: 4px oben/unten

### Bold/Strong (`.f_Strong`)
- Font-Weight: 400 (NICHT bold! Bug!)
- Color: `rgb(0, 0, 0)`

### Aufzählung (`.p_Aufzaehlung1`)
- Padding-Left: 24px
- Aufzählungszeichen: `•` als Span-Element

### Aufzählung Ebene 2 (`.p_Aufzaehlung2`)
- Margin-Left: 24px
- Padding-Left: 46px
- Aufzählungszeichen: `-` als Span-Element

### Bildunterschrift (`.p_caption`)
- Font-Size: 12px
- Font-Style: italic
- Margin-Bottom: 12px
- Margin-Left: 47.27px

## 6. Tabellen

### Tabelle
- Border-Collapse: collapse
- Breite: 562px
- Text-Align: left

### Kopfzeile (th)
- Background: `rgb(79, 129, 189)` (#4F81BD) - **DUNKELBLAU!** (Referenz: #E1EAF6 hellblau)
- Color: `rgb(0, 0, 0)` - aber strong ist `rgb(255, 255, 255)` weiß
- Font-Weight: 700
- Padding: 6px allseitig
- Border: 1px solid `rgb(166, 166, 166)` (#A6A6A6)
- Text-Align: **center** (Referenz: left)

### Datenzellen (td)
- Background: transparent (kein alternating)
- Color: `rgb(0, 0, 0)`
- Padding: 6px allseitig
- Border: 1px solid `rgb(166, 166, 166)`

### Tabellen-Paragraphen
- Text-Align: **center** (in Header) - Referenz: left
- Margin: 4px oben/unten

## 7. Schlagwortsuche-Panel

### Filter-Input
- Font: Arial (nicht Segoe UI)
- Font-Size: 14.4px (größer als Referenz: 11.52px)
- Width: 255px
- Height: 34px (größer als Referenz: 12px)
- Padding: 8px
- Border: 1px solid `rgb(204, 204, 204)`
- Placeholder: "Schlagwort filtern..."

### Keywords-Liste
- Font-Size: 14.4px für Links (Referenz: 11.52px)
- Link-Color: `rgb(18, 101, 171)` (#1265AB) (Referenz: #1E395B)
- List-Style: disc (Referenz: none)

### Unter-Keywords
- Eingerückt via verschachtelte UL
- Parent-Items: nur Text (nicht klickbar), mit ▶ Toggle

## 8. Volltextsuche-Panel

(Nicht im Detail analysiert - ähnliche Struktur wie Schlagwortsuche)

## 9. Fehlende Elemente

- **Kein "Themen"-Bereich** am Ende von Topics (Related Topics Links)
- **Keine Links im Content** (topic-link Klasse fehlt)
- **Kein Splitter** zwischen Sidebar und Content
- **Breadcrumb ist kein Link** - nur Text

## Zusammenfassung der Schlüsselwerte

| Eigenschaft | Wert |
|---|---|
| Body-Background | `rgb(245, 245, 245)` / #F5F5F5 |
| Haupt-Font | `"Segoe UI", sans-serif` |
| Basis-Font-Size | 14.6667px |
| Text-Farbe | `rgb(0, 0, 0)` / #000 |
| Link-Farbe (Keywords) | `rgb(18, 101, 171)` / #1265AB |
| TOC-Link-Farbe | `rgb(30, 57, 91)` / #1E395B |
| Aktiver TOC-BG | keiner (fehlt!) |
| Aktiver Tab-BG | `rgb(196, 221, 252)` / #C4DDFC |
| Content-BG | `rgb(255, 255, 255)` / weiß |
| Content-Panel-Border | keine |
| Tabellen-Kopf-BG | `rgb(79, 129, 189)` / #4F81BD |
| Tabellen-Border | 1px solid `rgb(166, 166, 166)` / #A6A6A6 |
| H2-Größe | 24px |
| Breadcrumb-Font | 13.6px |
| Toolbar-Höhe | ~119px |
| Sidebar-Breite | 280px |
| Splitter | keiner |
