# Referenz-Site Analyse (referenz-output)

Analysiert am: 2026-02-04
URL: http://127.0.0.1:8082/Help.html

## Screenshots
- `screenshots/referenz-overview.png` - Startansicht mit TOC und Topic
- `screenshots/referenz-topic-table.png` - Topic mit Tabelle (Artefaktpaket-Assistent)
- `screenshots/referenz-keywords.png` - Schlagwortsuche-Panel
- `screenshots/referenz-fulltext.png` - Volltextsuche-Panel

## 1. Gesamtlayout

### Struktur
```
┌─────────────────────────────────────────────────┐
│ Toolbar: [<][>][Home][ID] | [Tree][Load] | [Print]
│ (3 Buttonsets, getrennt durch Rahmen)           │
│ Labels: "Navigation" | "Chapters" | "Print"     │
├───────────────┬─────────────────────────────────┤
│ Sidebar       │ Breadcrumb (mit Links)          │
│ #c1sideTabs   │─────────────────────────────────│
│ width: ~344px │ #c1topicPanel (weiß, Rand)      │
│               │                                 │
│ Accordion:    │ Topic Content (#c1topic)         │
│ - Hilfe (TOC) │                                 │
│ - Schlagwort  │                                 │
│ - Volltext    │                                 │
│               │                                 │
│ Splitter 5px  │                                 │
└───────────────┴─────────────────────────────────┘
```

### Hauptcontainer
- `#c1page`: position: absolute, fill viewport
- Body Background: `rgb(223, 234, 247)` (helles Blau)
- Header-Gradient: `linear-gradient(to right, rgb(225,234,246), rgb(255,255,255), rgb(225,234,246))`
- Header-Höhe: 50px

## 2. Toolbar

### Buttonsets (`.c1buttonset`)
- Font: `"Segue UI", sans-serif` (Tippfehler im Original-CSS, sollte "Segoe UI" sein)
- Font-Size: 10.24px (0.8em von 12.8px)
- Font-Weight: 700 (bold für Gruppenbezeichnungen)
- Höhe: 75px
- Margin-Right: 7px (zwischen Gruppen)
- Border-Left: 1px solid `rgb(204,204,204)` (Trennlinie)

### Buttons (`.c1buttonset button`)
- Größe: 75×75px
- Font-Size: 10.24px
- Color: `rgb(69, 69, 69)`
- Background: transparent
- Border: transparent (unsichtbar)
- Padding: 8px oben, 4px unten, 10.24px links/rechts
- Text-Align: center
- Margin-Left: 4px

### Button-Icons
- Sprite: `ui-icons_ikaros-help.png`
- Icon-Größe: 32×16px (Sprite-Position variiert)
- 7 Buttons: Vorheriges, Nächstes, Startseite, ID öffnen, Baumansicht, Unterkapitel, Drucken
- Gruppenbezeichnungen: "Navigation", "Chapters", "Print" (unter den Buttons)

## 3. Sidebar / Accordion

### Accordion-Container (`#c1sideTabs`)
- Font: `"Segue UI", sans-serif`
- Font-Size: 11.52px (0.9em)
- Line-Height: 14.976px
- Breite: ~344px

### Tab-Header (Accordion)

#### Aktiver Tab (`#c1tabTocItem`, aktiv)
- Background: `rgb(196, 221, 252)` (#c4ddfc)
- Color: `rgb(0, 0, 0)` (schwarz)
- Font-Weight: 400 (normal)
- Padding: 5.76px oben/unten, 8px links
- Border: 1px solid `rgb(204, 204, 204)` (allseitig)

#### Inaktive Tabs (`#c1tabIndexItem`, `#c1tabSearchItem`)
- Background: Standard (nicht explizit gesetzt)
- Color: `rgb(69, 69, 69)` (dunkelgrau)
- Font-Weight: 400
- Gleiche Padding/Border wie aktiver Tab

### Tab-Icons
- Hilfe: Icon vor dem Text (aus jquery-ui Sprite / custom images)
- Schlagwortsuche: eigenes Icon
- Volltextsuche: eigenes Icon
- HINWEIS: Icons konnten nicht geladen werden (404-Fehler für help.png, index.png, search.png)

## 4. TOC-Baum

### TOC-Items (`.c1-toc-item`)
- Font: `"Segue UI", sans-serif`
- Font-Size: 11.52px
- Line-Height: 14.976px
- Color: `rgb(51, 51, 51)` (#333333)

### TOC-Links (`a.inner`)
- Display: block
- Padding: 1px oben/unten, 17px links (Platz für Icon)
- Color: `rgb(51, 51, 51)`
- Kein Text-Decoration (kein Unterstrich)

### Selektiertes Item (`.c1-toc-item-selected > a.inner`)
- Background: `rgb(203, 225, 252)` (#cbe1fc)
- Color: `rgb(43, 43, 43)`
- Text-Decoration: underline
- Klasse: `ui-state-hover` wird hinzugefügt

### TOC-Icons (`.c1-toc-icon`)
- Ordner offen: `ui-icon-folder-open`
- Ordner geschlossen: `ui-icon-folder-collapsed`
- Dokument/Blatt: `ui-icon-document`
- Icons stammen aus jquery-ui Sprite (16×16px)

### Einrückung
- Margin-Left: -11.52px auf selected items (Kompensation)
- Verschachtelte `<ul>` Elemente für Hierarchie

## 5. Content-Bereich

### Topic-Panel (`#c1topicPanel`)
- Background: `rgb(255, 255, 255)` (weiß)
- Border: 1px solid `rgb(170, 170, 170)` (allseitig)
- Border-Radius: durch `ui-corner-all`
- Margin-Top: 68px (Abstand zum Toolbar)

### Topic-Bar (`#c1topicBar`)
- Padding: 5px oben, 20px links/rechts
- Enthält: Breadcrumbs + Collapsible-Buttons

### Breadcrumbs (`#c1breadcrumbs`)
- Font-Size: 11.52px
- Padding: 2px oben/unten
- Border-Bottom: 1px solid `rgb(51, 51, 51)`
- Link-Color: `rgb(0, 85, 185)` (#0055b9)

### Topic-Content (`#c1topic`)
- Font: `"Segoe UI", Arial, sans-serif`
- Font-Size: 12.8px (0.8em von 16px)
- Color: `rgb(51, 51, 51)` (#333)
- Padding: 38.4px links/rechts (3em)

### Überschrift H1 (`#c1topic h1`)
- Font: `"Segoe UI", sans-serif`
- Font-Size: 26.6667px (~2.08em)
- Font-Weight: 700 (bold)
- Color: `rgb(51, 51, 51)`
- Margin: 16px oben, 4px unten

### Zwischenüberschrift (`.berschriftEinfachGross`)
- Font: `"Segoe UI Semibold", sans-serif`
- Font-Size: 14.6667px (~1.15em)
- Color: `rgb(51, 51, 51)`
- Margin: 12px oben, 4px unten, 18.9px rechts

### Fließtext (Paragraphen in Topic)
- Font-Size: 14.6667px (erbt von Absatzklassen)
- Color: `rgb(51, 51, 51)`

### Links im Topic (`a.topic-link`)
- Color: `rgb(0, 85, 185)` (#0055b9)
- Text-Decoration: none
- Font-Size: 14.6667px
- Padding-Left: 4.4px

### Fetttext (`strong`)
- Font-Weight: 700
- Color: `rgb(51, 51, 51)`

## 6. Tabellen

### Tabelle (`table.TabelleKopfOben`)
- Border-Collapse: collapse
- Margin-Left: 7.5px

### Kopfzeile (thead td / erste Zeile)
- Background: `rgb(225, 234, 246)` (#e1eaf6)
- Color: `rgb(0, 0, 0)`
- Padding: 3.8px oben/unten, 7.2px links/rechts
- Border: 1px solid `rgb(211, 211, 211)` (#d3d3d3)

### Datenzellen (td)
- Gleiche Styles wie Kopfzeile (Background wird durch CSS-Klassen gesteuert)
- Border: 1px solid `rgb(211, 211, 211)`
- Paragraphen in Zellen: Font-Size 14.6667px

### Trennlinie (hr)
- Color/Background: `rgb(128, 128, 128)` (grau)
- Border: 1px solid grau
- Margin: 6.4px oben/unten

## 7. Schlagwortsuche-Panel

### Panel (`#c1tabIndex`)
- Background: weiß
- Border: 1px solid `rgb(170, 170, 170)` (unten, links, rechts)

### Suchfeld
- Border: 1px solid `rgb(170, 170, 170)`
- Breite: ~332px (volle Panelbreite)
- Höhe: 12px

### Keywords-Liste
- Font-Size: 11.52px
- Line-Height: 11.52px
- Keyword-Links: Color `rgb(30, 57, 91)` (#1E395B)
- List-Items: Margin 11.52px oben, 5px unten, 10px links/rechts

## 8. Volltextsuche-Panel

### Panel (`#c1tabSearch`)
- Background: weiß
- Suchfeld: ~249px breit, 12px hoch
- Buttons: Search, Help, Highlight, Vor/Zurück (als Icons)
- Ergebnisliste: leer (keine Suche durchgeführt)

## 9. "Themen"-Sektion (am Ende jedes Topics)

### Aufbau
```
──────── (hr)
Themen:
  → Link zu Unterthema 1
  → Link zu Unterthema 2
  ...
```
- Links: Color `rgb(0, 85, 185)`, keine Unterstreichung
- Font-Size: 14.6667px
- Trennlinie oben

## Zusammenfassung der Schlüsselwerte

| Eigenschaft | Wert |
|---|---|
| Body-Background | `rgb(223, 234, 247)` / #DFEAF7 |
| Haupt-Font | `"Segoe UI", Arial, sans-serif` |
| Basis-Font-Size | 12.8px (0.8em) |
| Text-Farbe | `rgb(51, 51, 51)` / #333 |
| Link-Farbe | `rgb(0, 85, 185)` / #0055B9 |
| Keyword-Link-Farbe | `rgb(30, 57, 91)` / #1E395B |
| TOC-Item-Farbe | `rgb(51, 51, 51)` / #333 |
| Selektierter TOC-BG | `rgb(203, 225, 252)` / #CBE1FC |
| Aktiver Tab-BG | `rgb(196, 221, 252)` / #C4DDFC |
| Content-BG | `rgb(255, 255, 255)` / weiß |
| Content-Panel-Border | 1px solid `rgb(170, 170, 170)` / #AAA |
| Tabellen-Kopf-BG | `rgb(225, 234, 246)` / #E1EAF6 |
| Tabellen-Border | 1px solid `rgb(211, 211, 211)` / #D3D3D3 |
| H1-Größe | 26.6667px |
| Breadcrumb-Font | 11.52px |
| Toolbar-Höhe | 75px |
| Sidebar-Breite | ~344px |
| Splitter | 5px |
