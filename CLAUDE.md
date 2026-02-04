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
├── hmskin-extract.sh     # Extrahiert Skin nach hmskin-work/
└── hmskin-pack.sh        # Packt hmskin-work/ zurück zu Ferber.hmskin
```

## Skin-Bearbeitung

### Workflow
```bash
./hmskin-extract.sh       # Skin entpacken
# Dateien in hmskin-work/ bearbeiten
./hmskin-pack.sh          # Skin packen
git commit && git push    # Änderungen pushen
# User: git pull (Windows) → H&M Export → git push hm-export/
```

### .hmskin Struktur
```
Ferber.hmskin (ZIP)
├── Baggage/              # CSS, JS, Bilder (werden mit exportiert)
│   ├── Help.html         # Shell-Einstiegspunkt
│   ├── shell.js          # Shell-Logik (TOC, Navigation, Topic-Loading)
│   ├── shell.css         # Shell-Styling
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
- [x] CSS: `trms_styles.css` mit Referenz-Styles + H&M-Klassenmappings
- [x] Toolbar mit Navigation (Prev/Next/Home/Goto), Chapters (Collapse/Load) und Print
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
<link rel="stylesheet" type="text/css" href="./css/trms_styles.css" />
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
- [ ] Suche implementieren (H&M generiert zoom_index.js mit Suchdaten)
- [ ] Index-Tab (H&M generiert hmkeywords.js)
- [ ] Breadcrumb-Navigation
- [ ] Print-Funktion
- [ ] Styling-Feinschliff (Vergleich mit referenz-output/)

### Erkenntnisse
- H&M WebHelp hat eigene Navigation-Shell (iframes) - wir nutzen eigene Shell
- H&M generiert TOC-Daten als JavaScript (hmcontent.js mit hmLoadTOC Callback)
- AJAX funktioniert nicht bei `file://` - gelöst mit iframe + postMessage
- Shell-Dateien (Help.html, shell.js, shell.css) werden via Baggage/ mit exportiert

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

**Lösung**: Keine Dateien mit gleichem Namen aber unterschiedlicher Groß-/Kleinschreibung.

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

### hmskin-pack.sh
Das Pack-Script verwendet Python für Windows-kompatible ZIPs:
- `create_system = 0` (MS-DOS/FAT statt Unix)
- `external_attr = 0x10` für Verzeichnisse, `0x20` für Dateien
- Keine Unix-spezifischen Extra-Felder
