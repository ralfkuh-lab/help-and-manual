# Help+Manual zu NetHelp Konvertierung

## Berechtigungen
Voller Zugriff auf alle Dateien, Git-Operationen erlaubt

## Projektziel
Konvertierung von Help+Manual (H&M) WebHelp-Export zum NetHelp-Format (ohne iframes),
um die alte Doc-To-Help-generierte Hilfe zu ersetzen.

## Erkenntnisse aus Postprocessing-Ansatz

### Was funktioniert gut mit postprocess.py:
- **Styling-Anpassungen**: Heading-Borders, Fonts, Text-Shadow etc. via CSS-Regeln
- **Bullet-Points**: Unicode-Zeichen (&#8226;) durch Bilder ersetzen
- **Titel-Extraktion**: Breadcrumb-Pfade aus `<title>` entfernen
- **Einfache HTML-Transformationen**: Tag-Attribute ergänzen/ändern

### Was NICHT funktioniert / zu komplex ist:
- **Root-Page generieren**: H&M-Export ist flach strukturiert, Doc-To-Help hatte hierarchische Startseite
- **TOC umstrukturieren**: Die TOC-Hierarchie ist fundamental anders
- **Parent-Page-Topic-Links**: Automatische "Themen in diesem Kapitel"-Listen erfordern komplexe Logik
- **Tabellen-Header-Styling**: CSS-Spezifität-Probleme durch NetHelp-Layout-Struktur

### Technische Details:
- H&M verwendet `<span class="f_Strong">` statt `<strong>`
- H&M verwendet Unicode-Bullets statt Bullet-Images
- H&M Titel enthalten Breadcrumb-Pfade: "Parent > Child > Topic"
- NetHelp lädt CSS aus themes/, Document-Level-Stylesheets haben niedrigere Priorität
- `#c1topic` ist der Content-Container im NetHelp-Layout

### Empfehlung:
Für strukturelle Änderungen (nicht nur Styling) besser direkt in H&M konfigurieren
(.hmskin Datei) statt nachträglich zu transformieren.

## .hmskin Dateiformat
- .hmskin ist ein ZIP-Archiv
- Enthält: project.hmxp (Hauptkonfiguration), helpproject.xsl, CSS, Bilder
- `TOPICTEMPLATES` in project.hmxp definiert das HTML-Template für jede Seite
- Variablen: `<%TOPIC_TITLE%>`, `<%TOPIC_TEXT%>`, `<%STYLESHEET%>` etc.

### Wichtig: Alle WebHelp-Skins verwenden iframes!
- Standard WebHelp-Export von H&M verwendet immer iframes/framesets
- `navigationstyle` Einstellung ändert nur das Aussehen, nicht die Frame-Struktur
- Es gibt kein "frameless" WebHelp-Format in H&M
- Für iframe-freies Ergebnis muss postprocess.py den Output transformieren

### Aktueller Workflow:
1. H&M exportiert WebHelp (mit iframes) nach `HTML-OUTPUT/`
2. `postprocess.py` transformiert zu NetHelp-Format (ohne iframes) nach `fertige-hilfe/`
3. NetHelp-Template aus `nethelp-template/` wird verwendet

### Dateien im H&M-Export:
- `index.html` - Frameset (Haupt-Entry-Point)
- `hmcontent.html` - TOC als HTML
- `fs_*.html` - Topic-Seiten
- `css/default.css` - Haupt-Stylesheet
- `js/` - JavaScript-Dateien für Navigation
