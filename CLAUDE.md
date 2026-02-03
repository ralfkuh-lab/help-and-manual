# Help+Manual zu NetHelp Konvertierung

## Berechtigungen
Voller Zugriff auf alle Dateien, Git-Operationen erlaubt

## Projektziel
H&M Skin so anpassen, dass der WebHelp-Export direkt NetHelp-kompatibles HTML produziert.
Das Ziel ist die alte Doc-To-Help-generierte Hilfe (referenz-output/) zu ersetzen.

## Verzeichnisstruktur
```
help-and-manual/
├── hm-projekt/           # H&M Quelldateien (.hmxp etc.)
├── hm-export/            # WebHelp-Export von H&M (aktueller Stand)
├── docs/                 # Referenzmaterial
├── archiv/               # Legacy-Ansätze
├── referenz-output/      # NetHelp-Zielformat (Doc-To-Help generiert)
├── fertige-hilfe/        # Finaler Output
├── Ferber.hmskin         # Aktive Skin-Konfiguration (ZIP)
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
├── Baggage/              # CSS, JS, Bilder
├── project.hmxp          # Hauptkonfiguration mit TOPICTEMPLATES
├── helpproject.xsl
└── helpproject.xsd
```

### Wichtige Stellen in project.hmxp
- `TOPICTEMPLATES` → HTML-Template für Topic-Seiten
- Variablen: `<%TOPIC_TITLE%>`, `<%TOPIC_TEXT%>`, `<%STYLESHEET%>` etc.
- iframes für Navigation sind in Zeilen ~299-307 definiert

## NetHelp-Zielformat (referenz-output/)

### Struktur
```
referenz-output/
├── Help.html             # Thin Shell (lädt JS)
├── Documents/            # Topic-Seiten (reiner Content)
│   └── fs_*.html
├── js/
│   ├── nethelp.js        # Navigation-Rendering
│   └── nethelp.redirector.js  # Redirect bei Direktzugriff
├── css/
├── toc.js                # TOC-Daten
└── keywords.js           # Index-Daten
```

### Topic-Seiten (Documents/fs_*.html)
```html
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Topic Titel</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="../LinksExt/TRMS.css" />
  <script src="../js/nethelp.redirector.js"></script>
  <link rel="prev" href="fs_prev.html" />
  <link rel="next" href="fs_next.html" />
</head>
<body data-c1-topic-id="guid">
  <h2>Topic Titel</h2>
  <p>Content ohne Navigation-Shell...</p>
</body>
</html>
```

**Wichtig:** Keine iframes, keine Navigation im Topic - nur Content!

## Aktueller Ansatz

### Strategie
TOPICTEMPLATES in der Skin komplett umschreiben, um NetHelp-Format zu produzieren.
Iterativ vorgehen: Skin ändern → Export → Ergebnis prüfen → wiederholen.

### Status
- [x] Skin-Bearbeitungs-Scripte erstellt
- [ ] TOPICTEMPLATES auf minimales NetHelp-Format umstellen
- [ ] NetHelp-JS-Infrastruktur einbinden
- [ ] Styling angleichen
