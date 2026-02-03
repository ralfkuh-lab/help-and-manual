# Help+Manual zu NetHelp Transformation

Dieses Projekt ermöglicht die Transformation von Help+Manual WebHelp-Exporten in das NetHelp-Format (ohne iFrames).

## Projektübersicht

Das Projekt besteht aus:

| Datei/Ordner | Beschreibung |
|--------------|--------------|
| `Ferber.hmskin` | Help+Manual Skin für den WebHelp-Export |
| `postprocess.py` | Python-Skript zur Transformation in NetHelp-Format |
| `nethelp-template/` | Template mit NetHelp-Framework (js/, css/, themes/) |
| `DESIRED-OUTPUT-FORMAT/` | Referenz-Output (Original NetHelp-Hilfe, nicht verändern) |
| `HTML-OUTPUT/` | Beispiel H&M WebHelp-Export |

## Voraussetzungen

### Software
- **Help+Manual** (für den WebHelp-Export)
- **Python 3.8+** (für das Post-Processing)
  - Windows: [Python aus Microsoft Store](https://apps.microsoft.com/detail/9NRWMJP3717K) oder [python.org](https://www.python.org/downloads/)
  - Bei der Installation "Add to PATH" aktivieren

### Python-Pakete
```bash
pip install beautifulsoup4 lxml
```

## Workflow

### Schritt 1: Export aus Help+Manual

1. Help+Manual öffnen
2. Ihr Hilfeprojekt laden
3. **Publizieren** > **WebHelp** wählen
4. Skin auswählen: `Ferber.hmskin` (aus diesem Verzeichnis)
5. Ausgabeverzeichnis wählen (z.B. `HTML-OUTPUT`)
6. Export durchführen

### Schritt 2: Post-Processing ausführen

```bash
python postprocess.py <H&M-Export-Dir> <Output-Dir>
```

**Beispiel:**
```bash
python postprocess.py HTML-OUTPUT fertige-hilfe
```

Das Skript führt folgende Schritte aus:
1. Kopiert das NetHelp-Framework aus `nethelp-template/`
2. Transformiert die Content-Seiten (entfernt H&M-Navigation)
3. Generiert `toc.xml` aus `hmcontent.html`
4. Kopiert `keywords.xml` aus dem Template
5. Generiert `settings.xml`
6. Erstellt `Help.html` Startdatei
7. Kopiert Bilder nach `ImagesExt/`
8. Kopiert CSS-Dateien nach `LinksExt/`

### Schritt 3: Testen

Öffnen Sie `Help.html` im Ausgabeverzeichnis:
- Auf Windows: Doppelklick auf `Help.html`
- Oder mit lokalem Webserver für volle Funktionalität:
  ```bash
  cd fertige-hilfe
  python -m http.server 8000
  ```
  Dann `http://localhost:8000/Help.html` öffnen

## Konfiguration

### postprocess.py anpassen

Am Anfang der Datei `postprocess.py` können Sie folgende Einstellungen anpassen:

```python
# Pfad zum NetHelp-Framework (relativ zum Skript)
NETHELP_TEMPLATE_DIR = r"nethelp-template"

# Standard-Startseite
DEFAULT_HOME_PAGE = "Documents/fs_8bd7d2d2d793.html"
```

### settings.xml anpassen

Nach dem Post-Processing können Sie `settings.xml` im Output-Verzeichnis bearbeiten:

```xml
<settings>
  <strings>
    <pageHeaderText>Hilfe</pageHeaderText>           <!-- Seitentitel -->
    <emailAddress>support@example.de</emailAddress>  <!-- Support-Email -->
  </strings>
  <topic>
    <home>Documents/startseite.html</home>           <!-- Startseite -->
  </topic>
</settings>
```

## Dateistruktur nach Post-Processing

```
Output/
├── Help.html                    # Startdatei (öffnen im Browser)
├── settings.xml                 # Konfiguration
├── toc.xml                      # Inhaltsverzeichnis
├── keywords.xml                 # Stichwortindex
├── context.xml                  # Context-IDs
├── local.js                     # Lokalisierung
├── searchindex.js               # Suchindex
├── css/
│   ├── nethelp.css
│   ├── nethelp.responsive.css
│   └── jquery-ui/
├── js/
│   ├── nethelp.js
│   ├── nethelp.connect.js
│   ├── nethelp.responsive.js
│   ├── jquery.js
│   └── jquery-ui.js
├── themes/FSNetHelpTheme/
│   ├── layout.html
│   ├── theme.css
│   ├── topic.css
│   └── theme.js
├── Documents/                   # Konvertierte Content-Seiten
│   └── fs_*.html
├── ImagesExt/                   # Bilder
│   └── *.png
└── LinksExt/                    # CSS-Dateien
    ├── TRMS.css
    └── HelpAndManual.css
```

## Troubleshooting

### "BeautifulSoup ist nicht installiert"
```bash
pip install beautifulsoup4 lxml
```

Falls pip nicht gefunden wird:
```bash
python -m pip install beautifulsoup4 lxml
```

### "hmcontent.html nicht gefunden"
Stellen Sie sicher, dass Sie den korrekten H&M-Export-Ordner angeben. Der Ordner muss enthalten:
- `hmcontent.html` (Inhaltsverzeichnis)
- `fs_*.html` (Content-Seiten)
- `images/` (Bilder)
- `css/` (Stylesheets)

### Bilder werden nicht angezeigt
Das Skript kopiert Bilder von `images/` nach `ImagesExt/`. Falls Bilder fehlen:
1. Prüfen Sie, ob alle Bilder im H&M-Export enthalten sind
2. Prüfen Sie die Bildpfade in den HTML-Dateien (`../ImagesExt/...`)

### Styles sehen falsch aus
Die CSS-Dateien werden aus dem H&M-Export kopiert:
- `css/default.css` → `LinksExt/HelpAndManual.css`

Falls Styles fehlen, prüfen Sie ob die Datei im H&M-Export vorhanden ist.

### Navigation funktioniert nicht
Öffnen Sie die Hilfe mit einem lokalen Webserver:
```bash
cd fertige-hilfe
python -m http.server 8000
```
Dann `http://localhost:8000/Help.html` öffnen.

### Suchfunktion funktioniert nicht
Die Suchfunktion benötigt `searchindex.js` und `local.js` aus dem Template.
Diese werden automatisch aus `nethelp-template/` kopiert.

## Skin-Anpassung (Ferber.hmskin)

Der Skin basiert auf dem H&M Standard-WebHelp-Skin mit Anpassungen für den Post-Processing-Workflow.

### Skin selbst anpassen

1. `.hmskin` Datei mit ZIP-Programm öffnen (ist ein ZIP-Archiv)
2. Dateien bearbeiten:
   - `project.hmxp` - Skin-Konfiguration
   - `helpproject.xsl` - Transformations-Template
3. Archiv wieder als `.hmskin` speichern

## Technische Details

### Content-Transformation

Das Skript extrahiert den Hauptinhalt aus H&M-Seiten:
1. Findet `<div id="idcontent">` oder `<div id="innerdiv">`
2. Entfernt H&M-Navigation und Header
3. Korrigiert Bildpfade (`./images/` → `../ImagesExt/`)
4. Entfernt `target="hmcontent"` Attribute
5. Fügt NetHelp-Wrapper hinzu

### TOC-Generierung

Parst `hmcontent.html` (H&M Inhaltsverzeichnis):
1. Findet `<ul id="toc">`
2. Extrahiert hierarchische Struktur aus verschachtelten `<li>` Elementen
3. Konvertiert zu NetHelp `toc.xml` Format mit CDATA-Titeln

### CSS-Mapping

| H&M Datei | NetHelp Datei |
|-----------|---------------|
| `css/default.css` | `LinksExt/HelpAndManual.css` |
| `css/custom.css` | `LinksExt/custom.css` |

## Lizenz

Dieses Projekt ist für den internen Gebrauch bei Ferber Software bestimmt.
