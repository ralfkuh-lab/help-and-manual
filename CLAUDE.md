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
- [x] Minimales Topic-Template (kein iframe, kein Navigation-Shell)
- [x] H2-Überschrift mit `<%TOPIC_TITLE%>`
- [x] `data-c1-topic-id` Attribut mit `<%TOPICID%>`
- [x] Prev/Next Links
- [x] CSS: `trms_styles.css` mit Referenz-Styles + H&M-Klassenmappings
- [x] `nethelp.redirector.js` eingebunden

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
<script src="./js/nethelp.redirector.js" type="text/javascript"></script>
<IF_PREVIOUS_PAGE><link rel="prev" href="<%HREF_PREVIOUS_PAGE%>" /></IF_PREVIOUS_PAGE>
<IF_NEXT_PAGE><link rel="next" href="<%HREF_NEXT_PAGE%>" /></IF_NEXT_PAGE>
</head>
<body data-c1-topic-id="<%TOPICID%>">
<h2><%TOPIC_TITLE%></h2>
<%TOPIC_TEXT%>
</body>
</html>
```

### Offene Punkte
- [ ] NetHelp-Shell (Menu, Toolbar, Breadcrumb) - H&M exportiert nur Topic-Content, keine Shell
- [ ] TOC-Navigation - H&M generiert eigene JS-basierte TOC, nicht NetHelp's toc.xml
- [ ] Bildpfade könnten angepasst werden müssen (./images/ vs ../ImagesExt/)

### Erkenntnisse
- H&M WebHelp hat eigene Navigation-Shell (iframes) - wir haben diese entfernt
- NetHelp-Shell benötigt: Help.html, js/nethelp.js, themes/, toc.xml, settings.xml
- Diese Infrastruktur kann H&M nicht direkt generieren
- Option: Separates Script das nach Export die NetHelp-Shell hinzufügt
