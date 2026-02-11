# Help+Manual zu NetHelp Konvertierung

## Berechtigungen
Voller Zugriff auf alle Dateien, Git-Operationen erlaubt, voller Zugriff auf Playwright MCP

## WICHTIG: Keine Änderungen an hm-export/
Das Verzeichnis `hm-export/` wird **ausschließlich** durch H&M's Export-Funktion erstellt.
Claude darf hier **keine** Dateien ändern, hinzufügen oder löschen!

Alle Anpassungen erfolgen über:
- `Ferber.hmskin` (die Skin-Datei)
- `hmskin-work/` (Arbeitsverzeichnis für Skin-Bearbeitung)

## Projektziel
H&M Skin so anpassen, dass der WebHelp-Export direkt NetHelp-kompatibles HTML produziert.
Das Ziel ist die alte Doc-To-Help-generierte Hilfe (referenz-output/) zu ersetzen.

## Verzeichnisstruktur
```
help-and-manual/
├── hm-projekt/           # H&M Quelldateien (.hmxp etc.)
├── hm-export/            # WebHelp-Export von H&M - NICHT MANUELL ÄNDERN!
├── docs/                 # Referenzmaterial (extracted/ ist in .gitignore)
├── referenz-output/      # NetHelp-Zielformat (Doc-To-Help generiert)
├── Ferber.hmskin         # Aktive Skin-Konfiguration (ZIP)
├── hmskin-work/          # Entpackte Skin zum Bearbeiten (in .gitignore)
├── hmskin-extract.ps1    # Extrahiert Skin nach hmskin-work/ (Windows PowerShell)
├── hmskin-pack.ps1       # Packt hmskin-work/ zurück zu Ferber.hmskin (Windows PowerShell)
├── hmskin-extract.sh     # Extrahiert Skin nach hmskin-work/ (Linux/Bash)
└── hmskin-pack.sh        # Packt hmskin-work/ zurück zu Ferber.hmskin (Linux/Bash)
```

## Skin-Bearbeitung

### Workflow (Windows)
```powershell
.\hmskin-extract.ps1      # Skin entpacken
# Dateien in hmskin-work/ bearbeiten
.\hmskin-pack.ps1         # Skin packen
git commit && git push    # Skin-Änderungen pushen
# H&M Export durchführen (manuelle Aktion in Help+Manual)
git add hm-export/ && git commit && git push  # Export-Ergebnis pushen
```

### Workflow (Linux)
```bash
./hmskin-extract.sh       # Skin entpacken
# Dateien in hmskin-work/ bearbeiten
./hmskin-pack.sh          # Skin packen
git commit && git push    # Skin-Änderungen pushen
```

### .hmskin Struktur
```
Ferber.hmskin (ZIP)
├── Baggage/              # CSS, JS, Bilder (werden mit exportiert)
│   ├── Help.html         # Shell-Einstiegspunkt
│   ├── shell.js          # Shell-Logik (TOC, Navigation, Topic-Loading)
│   ├── shell.css         # Shell-Styling
│   ├── ferber.css        # Topic-Content-Styling
│   └── ...
├── project.hmxp          # Hauptkonfiguration mit TOPICTEMPLATES
├── helpproject.xsl
└── helpproject.xsd
```

### Wichtige Stellen in project.hmxp
- `TOPICTEMPLATES` → HTML-Template für Topic-Seiten
- Variablen: `<%TOPIC_TITLE%>`, `<%TOPIC_TEXT%>`, `<%TOPICID%>`, `<%DOCCHARSET%>` etc.
- Bedingte Tags: `<IF_PREVIOUS_PAGE>`, `<IF_NEXT_PAGE>` etc.

## Aktueller Stand

### Was funktioniert
- [x] Eigene Help-Shell (Help.html) mit Sidebar und Content-Bereich
- [x] TOC-Baum aus H&M's hmcontent.js via `hmLoadTOC` Callback
- [x] Topic-Loading via iframe + postMessage (funktioniert mit file:// und http://)
- [x] Prev/Next Navigation aus `<link rel="prev/next">` Tags
- [x] TOC-Highlighting und Auto-Expand bei Navigation
- [x] CSS: `ferber.css` mit Referenz-Styles + H&M-Klassenmappings
- [x] Toolbar mit Navigation (Prev/Next/Home/Goto), Chapters (Collapse/Load) und Print
- [x] Unterkapitel laden: Level-basierte sequentielle Logik, startet mit aktueller Seite, zeigt TopicID
- [x] Schlagwortsuche (Keywords) Panel mit Filter
- [x] Volltextsuche Panel

### Layout
```
┌─────────────────────────────────────────────────┐
│ Toolbar: [<][>][Home][ID] | [Tree][Load] | [Print]
├───────────────┬─────────────────────────────────┤
│ Sidebar       │ Breadcrumb (leer)               │
│ ┌───────────┐ │─────────────────────────────────│
│ │ Hilfe     │ │                                 │
│ │ (TOC)     │ │ Content                         │
│ ├───────────┤ │                                 │
│ │Schlagwort │ │                                 │
│ ├───────────┤ │                                 │
│ │Volltext   │ │                                 │
│ └───────────┘ │                                 │
└───────────────┴─────────────────────────────────┘
```

### Architektur

```
Help.html (Shell)
    ├── Lädt jquery.js, shell.js, shell.css
    ├── Lädt hmcontent.js (H&M-generiert, ruft hmLoadTOC auf)
    ├── Lädt hmkeywords.js (H&M-generiert, ruft hmLoadIndex auf)
    ├── Lädt zoom_pageinfo.js (H&M-generiert, Volltext-Suchdaten)
    │
    └── shell.js
        ├── hmLoadTOC(data)     - Empfängt TOC-Daten von hmcontent.js
        ├── hmLoadIndex(data)   - Empfängt Keywords von hmkeywords.js
        ├── buildTocTree()      - Baut TOC als <ul>/<li> Struktur
        ├── loadTopic(url)      - Lädt Topic via iframe + postMessage
        ├── updateNavigation()  - Aktualisiert Prev/Next Links
        ├── Accordion-Panel-Logik (Hilfe/Schlagwort/Volltext)
        ├── Toolbar-Button-Handler (Navigation, Chapters, Print)
        └── Volltextsuche (nutzt zoom_pageinfo.js Daten)

Topic-Dateien (fs_*.html)
    └── postMessage-Listener sendet HTML zurück an Shell
```

### Topic-Loading (iframe + postMessage)
Löst das CORS-Problem bei `file://` Protokoll:

1. Shell erstellt versteckte `<iframe src="topic.html">`
2. iframe lädt Topic-HTML komplett
3. Shell sendet `postMessage('getContent', '*')` an iframe
4. Topic-Script im iframe antwortet mit `{ doc: outerHTML }`
5. Shell parst HTML, extrahiert Body, zeigt Content an
6. iframe wird entfernt

### Aktuelles Topic-Template
```html
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title><%TOPIC_TITLE%></title>
<meta charset="<%DOCCHARSET%>" />
<meta name="generator" content="Help+Manual" />
<link rel="stylesheet" type="text/css" href="./css/ferber.css" />
<script>
// postMessage listener for iframe-based loading (file:// CORS workaround)
window.addEventListener('message', function(e) {
    if (e.data === 'getContent' && window.parent) {
        window.parent.postMessage({ doc: document.documentElement.outerHTML }, '*');
    }
});
</script>
<IF_PREVIOUS_PAGE><link rel="prev" href="<%HREF_PREVIOUS_PAGE%>" /></IF_PREVIOUS_PAGE>
<IF_NEXT_PAGE><link rel="next" href="<%HREF_NEXT_PAGE%>" /></IF_NEXT_PAGE>
</head>
<body data-topic-id="<%TOPICID%>">
<h2><%TOPIC_TITLE%></h2>
<%TOPIC_TEXT%>
</body>
</html>
```

### Offene Punkte
- [x] Suche implementieren (Volltextsuche über zoom_pageinfo.js)
- [x] Index-Tab (Schlagwortsuche über hmkeywords.js)
- [x] Breadcrumb-Navigation
- [x] Unterkapitel laden mit Level-Logik (sequentiell, startet mit aktueller Seite, TopicID im Titel)
- [ ] Print-Funktion
- [ ] Titelmenu-Überarbeitung

### Erkenntnisse
- H&M WebHelp hat eigene Navigation-Shell (iframes) - wir nutzen eigene Shell
- H&M generiert TOC-Daten als JavaScript (hmcontent.js mit hmLoadTOC Callback)
- TOC-Daten enthalten Level-Information (`lv` Property) für hierarchische Navigation
- AJAX funktioniert nicht bei `file://` - gelöst mit iframe + postMessage
- Shell-Dateien (Help.html, shell.js, shell.css) werden via Baggage/ mit exportiert
- "Unterkapitel laden" nutzt Level-basierte Logik: lädt aktuelle Seite + alle folgenden mit höherem Level, stoppt bei gleicher Ebene

## Vergleich Output vs. Referenz — Bekannte Fallstricke

Beim visuellen und technischen Vergleich zwischen `hm-export/` (unser Output) und `referenz-output/` (Ziel) auf folgende Punkte achten:

### H&M generiert andere HTML-Elemente als erwartet
- **Tabellenheader**: H&M nutzt manchmal `<td>` statt `<th>` für Header-Zeilen, und manchmal fehlt `<thead>`. CSS-Regeln nur auf `th` reichen nicht → `table:not(:has(thead)) > tbody > tr:first-child > td` als Fallback nötig.
- **Inline-Styles**: H&M setzt `font-size: 0.80rem` direkt auf `<span>`-Elemente, was CSS-Klassen-Styles überschreibt. Gegenmaßnahme: `#content [style*="font-size: 0.80rem"] { font-size: inherit !important; }`.
- Generell: Immer den **generierten HTML-Quelltext** in `hm-export/` prüfen, nicht nur die CSS-Regeln.

### Referenz-Layout-Details die leicht übersehen werden
- **Breadcrumb-Strich**: Endet nicht am Rand — `padding: 5px 20px 0` auf dem Wrapper (`#topic-bar`), Border nur auf innerem `#breadcrumb`.
- **Tabellen**: Referenz hat responsive Breite (`width: auto, min-width: 50%, max-width: 90%`), nicht 100%.
- **Font-Size-Kette**: Shell body `0.8em` (12.8px) → Content-Paragraphs `11pt` (14.67px). Inline-Spans von H&M können diese Kette brechen.

### Vergleichs-Methode
1. **Browser DevTools** → Computed Styles vergleichen (nicht nur geschriebene Rules)
2. **HTML-Quelltext lesen** → `hm-export/fs_*.html` direkt lesen um zu sehen welche Elemente H&M tatsächlich generiert
3. **Selektiv prüfen** → Nicht nur die "heilen" Tabellen, sondern auch Tabellen ohne `<thead>` oder mit unerwarteten Strukturen testen

## Arbeitsweise für CSS-Änderungen

### Workflow mit Verifikation
1. **Vor Änderungen**: Referenz-CSS lesen (`referenz-output/themes/FSNetHelpTheme/`)
2. **Nach Export**: Exportierte CSS lesen (`hm-export/css/shell.css`) um zu prüfen ob Änderungen angekommen sind
3. **Vergleichen**: Systematisch Referenz vs. Export vergleichen
4. **Kleine Schritte**: Eine Änderung → Testen → Nächste Änderung
5. **Screenshots analysieren**: Genau hinschauen was Links (Referenz) vs. Rechts (Unser Output) zeigt

### Referenz-CSS Dateien
- `referenz-output/themes/FSNetHelpTheme/user.css` - Hauptstyles
- `referenz-output/themes/FSNetHelpTheme/theme.css` - Theme-Grundlagen
- `referenz-output/css/jquery-ui/FsG4Style/jquery-ui.css` - UI-Komponenten, Accordion
- `referenz-output/css/nethelp.css` - TOC-Struktur (minifiziert)

### Wichtige Referenz-Werte
| Aspekt | Wert | Quelle |
|--------|------|--------|
| Font | `"Segoe UI",Arial,sans-serif` | user.css:731 |
| Font-Size | `0.8em` | user.css:732 |
| TOC Text-Farbe | `#1E395B` | user.css:594 |
| Selektion-HG | `#cbe1fc` | user.css:673, jquery-ui.css:957 |
| Aktiv-State HG | `#c4ddfc` | jquery-ui.css:986 |
| Hilfe-Tab-Icon | `help.png` | user.css:621 |

## .hmskin Kompatibilität (H+M Premium Pack)

### Bekannte Probleme und Lösungen

#### 1. Keine doppelten Dateinamen (case-insensitive)
Windows ist case-insensitive - `favicon.ico` und `FavIcon.ico` sind dort dieselbe Datei.
Solche Duplikate führen zum Fehler: *"Invalid project file: ungültige Daten auf Stammebene"*

**Gilt für ALLE Verzeichnisse** (Baggage/, referenz-output/, hm-export/ etc.):
- Keine zwei Dateien die sich nur in Groß-/Kleinschreibung unterscheiden (z.B. `Index.png` + `index.png`)
- Keine Symlinks als Workaround — Windows kann damit nicht umgehen
- Beim Umbenennen immer auf lowercase normalisieren
- Beim Hinzufügen neuer Dateien prüfen ob ein case-insensitiver Duplikat existiert
- **Beim Umbenennen von Baggage-Dateien immer auch `project.hmxp` anpassen!** (Dateireferenzen unter `<files>`)

**Lösung**: Alle Dateinamen lowercase halten. Keine Dateien mit gleichem Namen aber unterschiedlicher Groß-/Kleinschreibung.

#### 2. Kein UTF-8 BOM in Baggage-Dateien
UTF-8 BOM (`EF BB BF`) am Dateianfang kann Probleme verursachen.

**Lösung**: BOM aus allen `.html`, `.htm`, `.css`, `.js` Dateien im Baggage entfernen:
```bash
# BOM aus einer Datei entfernen
sed -i '1s/^\xEF\xBB\xBF//' datei.html

# Alle Dateien mit BOM finden
for f in Baggage/*.{html,htm,css,js}; do
    head -c 3 "$f" | grep -q $'\xef\xbb\xbf' && echo "$f"
done
```

#### 3. Baggage-Dateien müssen in project.hmxp registriert sein
Neue Dateien im Baggage/ müssen in `project.hmxp` unter `<files>` eingetragen werden:
```xml
<file href="Baggage/dateiname.png" build="ALL" filetype="baggage" />
```

**Tipp**: H+M Premium Pack registriert fehlende Dateien automatisch beim Speichern.

### Pack-Scripts

**hmskin-pack.ps1 (Windows PowerShell)**:
- Verwendet .NET `System.IO.Compression.ZipFile`
- Forward-Slashes in ZIP-Pfaden (`Baggage/Help.html`)
- Explizite `Baggage/` Directory-Entry als erster Eintrag
- Keine UTF-8 BOM in Dateien

**hmskin-pack.sh (Linux Bash)**:
- Verwendet Python für Windows-kompatible ZIPs
- `create_system = 0` (MS-DOS/FAT statt Unix)
- `external_attr = 0x10` für Verzeichnisse, `0x20` für Dateien
- Forward-Slashes in ZIP-Pfaden
- Keine Unix-spezifischen Extra-Felder
