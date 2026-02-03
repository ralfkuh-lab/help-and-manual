# Help+Manual zu NetHelp Konvertierung

## Berechtigungen
Voller Zugriff auf alle Dateien, Git-Operationen erlaubt

## Projektziel
Konvertierung von Help+Manual (H&M) WebHelp-Export zum NetHelp-Format (ohne iframes),
um die alte Doc-To-Help-generierte Hilfe zu ersetzen.

## Verzeichnisstruktur
```
help-and-manual/
├── hm-projekt/           # H&M Quelldateien (.hmxp etc.)
├── hm-export/            # WebHelp-Export von H&M
├── docs/                 # Referenzmaterial
│   └── help-and-manual-html-skins/
├── archiv/
│   └── postprocessing/   # Legacy-Ansatz (nicht mehr aktiv)
│       ├── postprocess.py
│       └── readme.md
├── referenz-output/      # Zielformat-Referenz
├── fertige-hilfe/        # Finaler Output
├── Ferber.hmskin         # Aktive Skin-Konfiguration
└── CLAUDE.md
```

## .hmskin Dateiformat
- .hmskin ist ein ZIP-Archiv
- Enthält: project.hmxp (Hauptkonfiguration), helpproject.xsl, CSS, Bilder
- `TOPICTEMPLATES` in project.hmxp definiert das HTML-Template für jede Seite
- Variablen: `<%TOPIC_TITLE%>`, `<%TOPIC_TEXT%>`, `<%STYLESHEET%>` etc.

### Wichtig: Alle WebHelp-Skins verwenden iframes!
- Standard WebHelp-Export von H&M verwendet immer iframes/framesets
- `navigationstyle` Einstellung ändert nur das Aussehen, nicht die Frame-Struktur
- Es gibt kein "frameless" WebHelp-Format in H&M

### Dateien im H&M-Export:
- `index.html` - Frameset (Haupt-Entry-Point)
- `hmcontent.html` - TOC als HTML
- `fs_*.html` - Topic-Seiten
- `css/default.css` - Haupt-Stylesheet
- `js/` - JavaScript-Dateien für Navigation

## Archivierte Erkenntnisse (Postprocessing-Ansatz)

Der Postprocessing-Ansatz wurde archiviert. Details siehe `archiv/postprocessing/readme.md`.

### Zusammenfassung:
- **Funktionierte**: Styling-Anpassungen, Bullet-Points, Titel-Extraktion
- **Zu komplex**: Root-Page generieren, TOC umstrukturieren, Parent-Page-Links

### Technische Details:
- H&M verwendet `<span class="f_Strong">` statt `<strong>`
- H&M verwendet Unicode-Bullets statt Bullet-Images
- H&M Titel enthalten Breadcrumb-Pfade: "Parent > Child > Topic"
