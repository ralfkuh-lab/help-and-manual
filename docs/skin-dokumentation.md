# Ferber.hmskin - Skin-Dokumentation

## 1. Überblick

Der **Ferber.hmskin** ist ein angepasster Skin für Help+Manual (H+M), der den WebHelp-Export so steuert, dass eine eigene Help-Shell (HTML/CSS/JS) mit exportiert wird. Ziel ist es, die alte Doc-To-Help-generierte NetHelp-Hilfe (`referenz-output/`) durch einen H+M-basierten Export zu ersetzen, der optisch und funktional identisch ist.

Der Skin ist technisch eine ZIP-Datei, die H+M beim Export entpackt und deren Baggage-Dateien in den Export kopiert. Unsere eigene Shell (`Help.html`, `shell.js`, `shell.css`) ersetzt dabei die Standard-H+M-Navigation komplett.

### Workflow

```
hmskin-extract.sh          # Skin entpacken nach hmskin-work/
    ↓
Dateien in hmskin-work/    # Bearbeiten (Shell, CSS, JS, Templates)
bearbeiten
    ↓
hmskin-pack.sh             # Zurückpacken zu Ferber.hmskin
    ↓
git commit && git push     # Änderungen pushen
    ↓
[Windows] git pull         # User holt Skin
    ↓
[Windows] H+M Export       # Export nach hm-export/
    ↓
[Windows] git push         # Export pushen
    ↓
Help.html öffnen           # Fertige Hilfe
```


## 2. Dateien im Hauptverzeichnis

### project.hmxp

Hauptkonfigurationsdatei im XML-Format. Enthält:

- **TOPICTEMPLATES** — HTML-Templates für die exportierten Topic-Seiten. Zwei Templates:
  - `default` — Unser angepasstes Template mit postMessage-Listener für iframe-basiertes Loading
  - `Info` — Standard-H+M-Template (wird nicht verwendet)
- **Variablen** — Hunderte von Skin-Variablen (Farben, Fonts, Texte etc.)
- **project-files** (`<file>`-Einträge) — Registrierung aller Baggage-Dateien. Neue Dateien müssen hier eingetragen werden.
- **Export-Konfiguration** — Sucheinstellungen, TOC-Optionen, Icon-Pfade etc.

Wichtige Template-Variablen:

| Variable | Beschreibung |
|----------|-------------|
| `<%TOPIC_TITLE%>` | Titel des Topics |
| `<%TOPIC_TEXT%>` | Inhalt des Topics |
| `<%TOPICID%>` | Eindeutige Topic-ID |
| `<%DOCCHARSET%>` | Zeichensatz (UTF-8) |
| `<%HREF_PREVIOUS_PAGE%>` | URL der vorherigen Seite |
| `<%HREF_NEXT_PAGE%>` | URL der nächsten Seite |

Bedingte Tags: `<IF_PREVIOUS_PAGE>`, `<IF_NEXT_PAGE>` — Umschließen Inhalte, die nur angezeigt werden, wenn eine vorherige/nächste Seite existiert.

### helpproject.xsl

XSL-Transform für die Editor-Vorschau in H+M. Wird **nicht** beim Export verwendet.

### helpproject.xsd

XML-Schema zur Validierung der `project.hmxp`. Definiert die erlaubte Struktur.


## 3. Baggage-Überblick

Das `Baggage/`-Verzeichnis enthält alle Dateien, die H+M beim Export mit in den Ausgabeordner kopiert. Dateien werden nach Typ in Unterverzeichnisse aufgeteilt:

```
Baggage/
├── Help.html          → hm-export/Help.html       (Einstiegspunkt)
├── shell.js           → hm-export/js/shell.js
├── shell.css          → hm-export/css/shell.css
├── ferber.css         → hm-export/css/ferber.css
├── jquery.js          → hm-export/js/jquery.js
├── *.png/*.svg/...    → hm-export/images/
├── *.css              → hm-export/css/
├── *.js               → hm-export/js/
└── *.html             → hm-export/ (HTML-Komponenten)
```

### Kategorisierte Dateiliste

**Shell (unsere eigenen Dateien):**

| Datei | Beschreibung |
|-------|-------------|
| `Help.html` | Shell-Einstiegspunkt — lädt alle Scripts und CSS, enthält das gesamte UI-Gerüst |
| `shell.js` | Shell-Logik — TOC, Navigation, Suche, Accordion, Topic-Loading |
| `shell.css` | Shell-Styling — Grid-Layout, Toolbar, Sidebar, Accordion, TOC, Suche |
| `ferber.css` | Topic-Content-Styling — Headings, Listen, Code, Tabellen (basiert auf Referenz) |

**JavaScript:**

| Datei | Beschreibung |
|-------|-------------|
| `jquery.js` | jQuery-Bibliothek |
| `hm_tocscript.js` | TOC-Rendering-Script (H+M) |
| `hm_indexscript.js` | Index-Rendering-Script (H+M) |
| `hm_searchscript.js` | Such-Script (H+M) |
| `hm_tocprescript.js` | TOC-Vorab-Script (H+M) |
| `hm_indexprescript.js` | Index-Vorab-Script (H+M) |
| `hm_searchprescript.js` | Such-Vorab-Script (H+M) |
| `hm_pagescript.js` | Seiten-Script (H+M) |
| `hm_pageprescript.js` | Seiten-Vorab-Script (H+M) |
| `getUrlParams.js` | URL-Parameter-Handling (H+M) |
| `postloadFuncs.js` | Post-Load-Funktionen (H+M) |

**Bilder — Shell-UI:**

| Datei | Beschreibung |
|-------|-------------|
| `home.png` | Home-Button (32x32) |
| `previous.png` | Vorheriges-Kapitel-Button |
| `next.png` | Nächstes-Kapitel-Button |
| `printer.png` | Druck-Button |
| `Search_32x32.png` | Suche/Goto-Button |
| `CollapseTableOfContents_32x32.png` | TOC-Collapse-Button |
| `LoadAllSubChapters_32x32.png` | Unterkapitel-laden-Button |
| `help.png` | Hilfe-Panel-Icon |
| `index.png` | Schlagwort-Panel-Icon |
| `search.png` | Volltextsuche-Panel-Icon |
| `hyperlink.png` | Hyperlink-Icon |
| `ui-icons_ikaros-help.png` | Sprite-Sheet für TOC-Icons und Accordion-Pfeile |
| `$HMSKINPREVIEW.png` | Vorschaubild für den Skin in H+M |
| `favicon.ico` | Browser-Tab-Icon |

**H+M-interne HTML-Komponenten:**

| Datei | Beschreibung |
|-------|-------------|
| `_google_webfonts.html` | Google Webfonts Einbindung (H+M) |
| `_svgicons.html` | SVG-Icon-Definitionen (H+M) |
| `_topicfooter.html` | Topic-Footer-Template (H+M) |
| `HM_HEADERBOX.html` | Header-Box-Template (H+M) |
| `HM_HEADERMENU.html` | Header-Menü-Template (H+M) |
| `KEYINFO.html` | Keyboard-Info-Template (H+M) |


## 4. Layout und Bereiche

### Gesamtlayout

```
┌──────────────────────────────────────────────────────────────┐
│                     TOOLBAR (volle Breite)                    │
│  [◀ Vorheriges][▶ Nächstes][🏠 Home][🔍 ID öffnen]          │
│  ──────── Navigation ─────────  ─── Chapters ── ── Print ──  │
│  [Prev] [Next] [Home] [GoTo]   [Collapse][Load]   [Print]   │
├──────────────┬───────────────────────────────────────────────┤
│   SIDEBAR    │  BREADCRUMB (Eltern > Pfad)                   │
│  (344px)     ├───────────────────────────────────────────────┤
│              │                                               │
│  ┌────────┐  │                                               │
│  │ Hilfe  │  │              CONTENT                          │
│  │ (TOC)  │  │                                               │
│  │        │  │  Topic-Inhalt wird hier angezeigt             │
│  │        │  │                                               │
│  ├────────┤  │  ─────────────────────────────────            │
│  │Schlag- │  │  Themen:                                      │
│  │wort    │  │    » Unterkapitel 1                           │
│  ├────────┤  │    » Unterkapitel 2                           │
│  │Volltext│  │                                               │
│  └────────┘  │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### CSS-Grid-Struktur

Das Layout basiert auf CSS Grid:

```css
#shell {
    display: grid;
    grid-template-areas:
        "toolbar toolbar"
        "sidebar content-area";
    grid-template-columns: 344px 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
}
```

### Bereiche im Detail

| Bereich | CSS-ID | Beschreibung |
|---------|--------|-------------|
| Toolbar | `#toolbar` | Ribbon-artige Leiste mit Button-Gruppen (Navigation, Chapters, Print) |
| Sidebar | `#sidebar` | Linke Spalte mit 3 Accordion-Panels |
| Hilfe-Panel | `[data-panel="toc"]` | TOC-Baum, standardmäßig geöffnet |
| Schlagwort-Panel | `[data-panel="keywords"]` | Keyword-Index mit Filter |
| Volltext-Panel | `[data-panel="search"]` | Suchfeld + Ergebnisliste |
| Breadcrumb | `#breadcrumb` | Eltern-Navigationspfad (ohne aktuelle Seite) |
| Content | `#content` | Topic-Inhalt + automatisch generierte "Themen:"-Links |


## 5. Die Shell (Help.html)

### HTML-Struktur

```
<body>
└── #shell (CSS Grid Container)
    ├── #toolbar
    │   ├── .toolbar-group#toolbar-navigation
    │   │   ├── .toolbar-buttons
    │   │   │   ├── #btn-prev
    │   │   │   ├── #btn-next
    │   │   │   ├── #btn-home
    │   │   │   └── #btn-goto
    │   │   └── .toolbar-label "Navigation"
    │   ├── .toolbar-group#toolbar-chapters
    │   │   ├── .toolbar-buttons
    │   │   │   ├── #btn-collapse-toc
    │   │   │   └── #btn-load-subchapters
    │   │   └── .toolbar-label "Chapters"
    │   └── .toolbar-group#toolbar-print
    │       ├── .toolbar-buttons
    │       │   └── #btn-print
    │       └── .toolbar-label "Print"
    ├── <nav> #sidebar
    │   ├── .accordion-panel[data-panel="toc"] (expanded)
    │   │   ├── .accordion-header
    │   │   └── .accordion-content
    │   │       └── #toc-container
    │   ├── .accordion-panel[data-panel="keywords"]
    │   │   ├── .accordion-header
    │   │   └── .accordion-content
    │   │       ├── #keywords-filter > #keywords-input
    │   │       ├── #keywords-count
    │   │       └── #keywords-container
    │   └── .accordion-panel[data-panel="search"]
    │       ├── .accordion-header
    │       └── .accordion-content
    │           ├── #search-form > #search-input + #search-button
    │           └── #search-results
    └── <main> #content-area
        ├── #breadcrumb
        └── #content
```

### Geladene Ressourcen

```html
<!-- CSS (im <head>) -->
<link rel="stylesheet" href="./css/shell.css" />
<link rel="stylesheet" href="./css/ferber.css" />

<!-- JavaScript (am Ende von <body>) -->
<script src="./js/jquery.js"></script>           <!-- jQuery-Bibliothek -->
<script src="./zoom_pageinfo.js"></script>       <!-- Volltext-Suchdaten (H+M) -->
<script src="./js/shell.js"></script>            <!-- Shell-Logik -->
<script src="./js/hmcontent.js"></script>        <!-- TOC-Daten (ruft hmLoadTOC auf) -->
<script src="./js/hmkwindex.js"></script>        <!-- Keywords (ruft hmLoadIndex auf) -->
```

### Ladereihenfolge

1. Browser lädt `Help.html`
2. CSS wird geladen (`shell.css`, `ferber.css`)
3. jQuery wird geladen
4. `zoom_pageinfo.js` wird geladen — definiert die globale Variable `pagedata` (Array mit Seitendaten für Volltextsuche)
5. `shell.js` wird geladen — registriert die globalen Callback-Funktionen `hmLoadTOC()` und `hmLoadIndex()`
6. `hmcontent.js` wird geladen — ruft sofort `hmLoadTOC(data)` auf → initialisiert die Shell
7. `hmkwindex.js` wird geladen — ruft sofort `hmLoadIndex(data)` auf → baut Keyword-Index


## 6. JavaScript-Architektur

### shell.js — Kernmodul

Die gesamte Shell-Logik liegt in einer einzigen IIFE (Immediately Invoked Function Expression):

```javascript
(function() {
    'use strict';
    // Globaler State
    let tocData = null;       // TOC-Baumdaten
    let keywordsData = null;  // Keyword-Daten
    let flatToc = [];         // Linearisierte TOC-Liste
    let currentTopic = null;  // Aktuelle Topic-URL
    // ...
})();
```

#### TOC-Aufbau

| Funktion | Beschreibung |
|----------|-------------|
| `hmLoadTOC(data)` | Globaler Callback, empfängt TOC-Daten von `hmcontent.js`. Speichert Daten, linearisiert den Baum, startet `initShell()` |
| `flattenToc(items)` | Rekursiv: Erstellt `flatToc[]`-Array für sequenzielle Prev/Next-Navigation |
| `buildTocTree(items, container)` | Rekursiv: Baut `<ul>/<li>`-Baum mit expandierbaren Knoten. Jeder Link navigiert zum Topic und toggled expand/collapse |
| `updateTocHighlight(url)` | Markiert aktives Topic im TOC, expandiert Elternknoten, scrollt zur Position |
| `updateTocIcons()` | Aktualisiert die Sprite-Icons je nach expanded/collapsed-State |
| `scrollTocToActive(activeLink)` | Scrollt den TOC-Container, damit der aktive Eintrag sichtbar ist |

TOC-Datenstruktur (von H+M):
```javascript
{
    items: [
        {
            cp: "Kapiteltitel",    // Caption
            hf: "fs_abc123.html", // HTML-Dateiname
            items: [...]          // Unterkapitel (rekursiv)
        }
    ]
}
```

#### Schlagwortsuche (Keywords)

| Funktion | Beschreibung |
|----------|-------------|
| `hmLoadIndex(data)` | Globaler Callback, empfängt Keywords von `hmkwindex.js`. Baut Keyword-Baum und initialisiert Filter |
| `buildKeywordsTree(items, container)` | Rekursiv: Baut `<ul>/<li>`-Baum. Keywords mit Links sind klickbar, Sub-Keywords immer sichtbar |
| `initKeywordsFilter()` | Bindet Input-Handler an `#keywords-input` für Live-Filterung |
| `filterKeywords(filter)` | Filtert Keywords nach Suchbegriff. Zeigt auch Eltern-Items wenn Kinder matchen |
| `updateKeywordsCount()` | Zählt alle Keywords (inkl. Sub-Keywords) und zeigt Anzahl an |

Keyword-Datenstruktur (von H+M):
```javascript
{
    keywords: [
        {
            kw: "Stichwort",          // Keyword-Text
            hrefs: ["fs_abc.html"],   // Zugehörige Topics
            captions: ["Titel"],      // Topic-Titel
            subkw: [...]              // Sub-Keywords (rekursiv)
        }
    ]
}
```

#### Volltextsuche

| Funktion | Beschreibung |
|----------|-------------|
| `initFulltextSearch()` | Bindet Click- und Enter-Handler an Suchfeld/Button |
| `performSearch()` | Sucht in `pagedata` (aus `zoom_pageinfo.js`). Alle Suchbegriffe müssen in Titel oder Beschreibung vorkommen. Sortiert nach Relevanz (Titel-Match gewichtet höher) |

Suchdaten-Struktur (`pagedata` aus `zoom_pageinfo.js`):
```javascript
var pagedata = [
    ["./fs_abc.html", "Seitentitel", "Beschreibungstext", "bild.png"],
    // ...
];
```

#### Topic-Loading (iframe + postMessage)

| Funktion | Beschreibung |
|----------|-------------|
| `loadTopic(url)` | Hauptfunktion: Lädt ein Topic via versteckten iframe + postMessage. Aktualisiert Content, Navigation, Breadcrumb, TOC-Highlighting. Fügt "Themen:"-Links für Unterkapitel an |
| `loadTopicFromHash()` | Liest URL-Hash (`#fs_abc.html`) und lädt entsprechendes Topic |
| `loadMultipleTopics(topics)` | Lädt mehrere Topics parallel (für "Unterkapitel laden") |
| `getFirstTopic()` | Gibt die URL des ersten Topics im TOC zurück |

Ablauf von `loadTopic()`:

```
1. URL-Hash aktualisieren (history.pushState)
2. Versteckten iframe mit Topic-URL erstellen
3. iframe.onload → postMessage('getContent') an iframe senden
4. Topic-Script im iframe antwortet mit { doc: outerHTML }
5. HTML parsen, Body extrahieren, in #content einfügen
6. "Themen:"-Section mit Unterkapitel-Links anhängen
7. Event-Delegation für Content-Links einrichten
8. Navigation aktualisieren (Prev/Next Buttons)
9. Breadcrumb aktualisieren
10. TOC-Highlighting aktualisieren
11. iframe entfernen
```

#### Navigation

| Funktion | Beschreibung |
|----------|-------------|
| `updateNavigation(url, doc)` | Aktiviert/deaktiviert Prev/Next-Buttons. Liest `<link rel="prev/next">` aus Topic-HTML, Fallback auf `flatToc` |
| `navigatePrev()` / `navigateNext()` | Navigiert zum vorherigen/nächsten Topic in `flatToc` |
| `updateBreadcrumb(url)` | Baut Breadcrumb aus TOC-Pfad (nur Eltern, ohne aktuelle Seite) |
| `getTocPath(url)` | Sucht den Pfad von der TOC-Wurzel zum angegebenen Topic |

#### Accordion

| Funktion | Beschreibung |
|----------|-------------|
| `initAccordion()` | Immer genau ein Panel offen. Klick auf Header → altes Panel slideUp, neues Panel slideDown (200ms Animation) |

#### Toolbar

| Funktion | Beschreibung |
|----------|-------------|
| `initToolbar()` | Bindet Click-Handler an alle Toolbar-Buttons |
| `openGotoDialog()` | `prompt()`-Dialog für Topic-ID-Suche (partieller Match) |
| `collapseToc()` | Klappt alle TOC-Knoten zu |
| `loadAllSubchapters()` | Sammelt alle Unterkapitel des aktuellen Topics und lädt sie zusammen in den Content-Bereich |
| `findTocItem(items, url)` | Rekursiv: Findet ein TOC-Item anhand der URL |
| `collectChildTopics(items, result)` | Rekursiv: Sammelt alle Kind-Topic-URLs |

#### Hilfsfunktionen

| Funktion | Beschreibung |
|----------|-------------|
| `escapeHtml(text)` | XSS-sichere HTML-Escaping via `textContent`/`innerHTML` |
| `truncateText(text, maxLength)` | Kürzt Text mit "..." |

### Andere JS-Dateien

Von H+M mitgelieferte Scripts im Baggage (Pre-/Post-Scripts für H+M's eigene Seitenlogik):

| Datei | Beschreibung |
|-------|-------------|
| `hm_tocscript.js` / `hm_tocprescript.js` | TOC-Rendering und Vorab-Initialisierung |
| `hm_indexscript.js` / `hm_indexprescript.js` | Index-Rendering und Vorab-Initialisierung |
| `hm_searchscript.js` / `hm_searchprescript.js` | Such-Rendering und Vorab-Initialisierung |
| `hm_pagescript.js` / `hm_pageprescript.js` | Seiten-Initialisierung |
| `getUrlParams.js` | URL-Parameter-Handling |
| `postloadFuncs.js` | Post-Load-Funktionen |


## 7. CSS-Architektur

### shell.css — Shell-Layout (784 Zeilen)

Steuert das gesamte Seitenlayout und die Shell-UI-Komponenten:

| Abschnitt | Beschreibung |
|-----------|-------------|
| Reset & Base | Box-sizing, body-Font (`Segoe UI`, `0.8em`), Hintergrund `#dfeaf7` |
| Shell Grid | CSS-Grid-Layout (`344px 1fr`), `100vh` Höhe |
| Sidebar | Flexbox-Column, weiß, Border rechts |
| Accordion | Header-Styles, Toggle-Arrows (Sprite), Panel-Icons (CSS `::before`), Labels |
| TOC (Hilfe) | Verschachtelte Listen, Icon-Sprites, Hover/Active-States, Einrückung |
| Schlagwortsuche | Filter-Input, Keywords-Liste, Hover-Effekte |
| Volltextsuche | Suchformular, Ergebnisliste, Fehlermeldungen |
| Toolbar | Ribbon-ähnliche Gruppen, Button-Layout, Labels |
| Breadcrumb | Link-Farben, Separator-Styling |
| Content | Overflow-Scroll, Loading-State, Fehler-Styling |
| Related Topics | "Themen:"-Section am Ende von Topics |
| Responsive | 3 Breakpoints: 900px, 768px, 480px |
| Print | Sidebar und Toolbar ausblenden |

### ferber.css — Topic-Content-Styling

Styles für den Topic-Inhalt, basiert auf den Referenz-CSS-Dateien (`D2H_Handbuch_HTML.css`, `TRMS.css`). Enthält auch die ehemals separaten Styles aus `jquery-ui.css` und `user.css`, die beim Baggage-Cleanup konsolidiert wurden.

| Abschnitt | Beschreibung |
|-----------|-------------|
| Headings | H1-H6 in `Segoe UI`, verschiedene Größen (20pt bis 12pt) |
| Normal Text | `.MsoNormal`, `.p_Normal` — 11pt Segoe UI |
| Listen | Aufzählung 1-3, MsoListBullet 1-5 — verschachtelte Einrückungen |
| Custom Headings | `.berschriftEinfach`, `.p_UeberschriftEinfach` — Semibold |
| Code | `.Quellcode` (blau), `.QuellcodeKonsole` (grau), `.QuellcodeXml` (türkis), `.QuellcodeJavaScript` (grün) |
| Einrückungen | Einzug 1-3 mit zunehmenden Margins |
| Meldungstexte | Grauer Hintergrund, spezielle Margins |
| Editionshinweise | Farbige Span-Styles für IKAROS-Editionen |
| Tabellen | Einheitlicher hellblauer Hintergrund (`#E1EAF6`), Text-Shadow auf th |
| Links | Blaue Unterstreichung |
| Inline-Formatting | `.f_Strong` mit text-shadow |

### Wichtige Referenz-Werte

| Aspekt | Wert | Quelle |
|--------|------|--------|
| Hauptfont | `"Segoe UI", Arial, sans-serif` | shell.css, ferber.css |
| Basis-Fontgröße | `0.8em` (≈ 12.8px) | shell.css body |
| TOC-Textfarbe | `#1E395B` | shell.css .toc-link |
| TOC-Fontgröße | `0.72rem` (≈ 11.52px) | shell.css .toc-link |
| Selektion-Hintergrund | `#cbe1fc` | shell.css hover-states |
| Aktiv-State-Hintergrund | `#c4ddfc` | shell.css .accordion-panel.expanded |
| Sidebar-Breite | `344px` | shell.css #shell grid-template-columns |
| Content-Hintergrund | `#ffffff` | shell.css #content-area |
| Shell-Hintergrund | `#dfeaf7` | shell.css body |
| Toolbar-Label-Farbe | `#738399` | shell.css .toolbar-label |
| Link-Farbe (Content) | `blue` | ferber.css a |
| Code-Hintergrund | `#e1eaf6` (Standard), `#d9d9d9` (Konsole) | ferber.css |


## 8. Zusammenspiel mit H+M-Export

### Was H+M beim Export generiert

| Generierte Datei | Beschreibung |
|-----------------|-------------|
| `fs_*.html` | Topic-Dateien (eine pro Topic), basierend auf dem Topic-Template |
| `js/hmcontent.js` | TOC-Daten als JavaScript. Ruft `hmLoadTOC(data)` auf |
| `js/hmkwindex.js` | Keyword-Index als JavaScript. Ruft `hmLoadIndex(data)` auf |
| `zoom_pageinfo.js` | Volltext-Suchdaten als `pagedata`-Array |
| `js/hmcontextids.js` | Context-ID-Mapping |
| `js/helpman_settings.js` | Export-Einstellungen |
| `css/hmprojectstyles.css` | Projekt-spezifische Styles (von H+M generiert) |

### Baggage-Mapping: Skin → Export

H+M sortiert Baggage-Dateien beim Export automatisch in Unterverzeichnisse:

| Baggage-Pfad | Export-Pfad | Regel |
|-------------|------------|-------|
| `Baggage/Help.html` | `Help.html` | HTML-Dateien → Wurzelverzeichnis |
| `Baggage/shell.js` | `js/shell.js` | JS-Dateien → `js/` |
| `Baggage/shell.css` | `css/shell.css` | CSS-Dateien → `css/` |
| `Baggage/home.png` | `images/home.png` | Bilder → `images/` |
| `Baggage/favicon.ico` | `favicon.ico` | ICO → Wurzelverzeichnis |

### Datenfluss

```
H+M Export
    │
    ├── Generiert Topic-Dateien (fs_*.html) mit Topic-Template
    │
    ├── Generiert hmcontent.js ──→ ruft hmLoadTOC() auf
    │                                    │
    │                                    ▼
    │                              shell.js empfängt TOC-Daten
    │                              → buildTocTree()
    │                              → initShell()
    │
    ├── Generiert hmkwindex.js ──→ ruft hmLoadIndex() auf
    │                                    │
    │                                    ▼
    │                              shell.js empfängt Keywords
    │                              → buildKeywordsTree()
    │
    ├── Generiert zoom_pageinfo.js ──→ definiert pagedata[]
    │                                        │
    │                                        ▼
    │                                  performSearch() nutzt
    │                                  pagedata[] für Suche
    │
    └── Kopiert Baggage-Dateien ──→ Shell-UI ist komplett
```


## 9. Technische Konzepte

### iframe + postMessage (CORS-Workaround)

Bei `file://`-Protokoll blockiert der Browser AJAX-Requests (XMLHttpRequest/fetch). Die Lösung:

1. Shell erstellt einen versteckten `<iframe>` mit `src="topic.html"`
2. Der Browser lädt die Topic-Datei komplett im iframe
3. Das Topic-Template enthält einen `postMessage`-Listener:
   ```javascript
   window.addEventListener('message', function(e) {
       if (e.data === 'getContent' && window.parent) {
           window.parent.postMessage({
               doc: document.documentElement.outerHTML
           }, '*');
       }
   });
   ```
4. Die Shell sendet `postMessage('getContent', '*')` an den iframe
5. Das Topic antwortet mit seinem kompletten HTML (`outerHTML`)
6. Die Shell parst das HTML, extrahiert den `<body>` und zeigt ihn im `#content` an
7. Der iframe wird entfernt

Dieses Pattern funktioniert sowohl mit `file://` als auch mit `http://`.

### H+M-Callback-Pattern

H+M's generierte Daten-Dateien (`hmcontent.js`, `hmkwindex.js`) verwenden ein Callback-Pattern:

```javascript
// hmcontent.js (H+M-generiert):
hmLoadTOC({
    items: [
        { cp: "Kapitel 1", hf: "fs_abc.html", items: [...] },
        // ...
    ]
});

// hmkwindex.js (H+M-generiert):
hmLoadIndex({
    keywords: [
        { kw: "Stichwort", hrefs: ["fs_abc.html"], captions: ["Titel"], subkw: [...] },
        // ...
    ]
});
```

Die Shell registriert die Callback-Funktionen **vor** dem Laden der Daten-Scripts:

```javascript
// shell.js (wird vor hmcontent.js geladen):
window.hmLoadTOC = function(data) { ... };
window.hmLoadIndex = function(data) { ... };
```

Wenn `hmcontent.js` geladen wird, existiert `hmLoadTOC` bereits als globale Funktion und wird sofort aufgerufen.

### Topic-Template-Variablen

Das Topic-Template in `project.hmxp` definiert, wie jede Topic-HTML-Datei aussieht:

```html
<html>
<head>
    <title><%TOPIC_TITLE%></title>
    <meta charset="<%DOCCHARSET%>" />
    <link rel="stylesheet" href="./css/ferber.css" />
    <script>/* postMessage-Listener */</script>
    <IF_PREVIOUS_PAGE>
        <link rel="prev" href="<%HREF_PREVIOUS_PAGE%>" />
    </IF_PREVIOUS_PAGE>
    <IF_NEXT_PAGE>
        <link rel="next" href="<%HREF_NEXT_PAGE%>" />
    </IF_NEXT_PAGE>
</head>
<body data-topic-id="<%TOPICID%>">
    <h1><%TOPIC_TITLE%></h1>
    <%TOPIC_TEXT%>
</body>
</html>
```

Wichtige Aspekte:
- Topics laden nur `ferber.css` (nicht `shell.css`) — sie werden im Content-Bereich der Shell angezeigt
- Der `postMessage`-Listener ermöglicht das iframe-basierte Loading
- `<link rel="prev/next">` wird von der Shell für die Navigation ausgelesen
- `data-topic-id` enthält die H+M Topic-ID
- `<IF_PREVIOUS_PAGE>` / `<IF_NEXT_PAGE>` sind bedingte Tags — der Inhalt wird nur generiert, wenn eine vorherige/nächste Seite existiert
