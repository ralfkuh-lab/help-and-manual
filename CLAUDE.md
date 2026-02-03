# Help+Manual zu NetHelp Konvertierung

## Berechtigungen
Voller Zugriff auf alle Dateien, Git-Operationen erlaubt

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
- [x] Responsive Sidebar (Toggle auf Mobile)
- [x] CSS: `trms_styles.css` mit Referenz-Styles + H&M-Klassenmappings

### Architektur

```
Help.html (Shell)
    ├── Lädt jquery.js, shell.js, shell.css
    ├── Lädt hmcontent.js (H&M-generiert, ruft hmLoadTOC auf)
    │
    └── shell.js
        ├── hmLoadTOC(data) - Empfängt TOC-Daten von hmcontent.js
        ├── buildTocTree()  - Baut TOC als <ul>/<li> Struktur
        ├── loadTopic(url)  - Lädt Topic via iframe + postMessage
        └── updateNavigation() - Aktualisiert Prev/Next Links

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
