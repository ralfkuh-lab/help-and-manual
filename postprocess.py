#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Help+Manual zu NetHelp Post-Processing-Skript

Transformiert den WebHelp-Export von Help+Manual in das NetHelp-Format
(ohne iFrames). Das NetHelp-Framework wird aus einem Template-Verzeichnis
kopiert.

Verwendung:
    python postprocess.py [H&M-Export-Dir] [Output-Dir]

Ohne Parameter werden die Standardwerte aus der Konfiguration verwendet.

Voraussetzungen:
    - Python 3.8+
    - pip install beautifulsoup4 lxml
"""

import os
import sys
import shutil
import re
from pathlib import Path
from typing import Optional, List, Tuple
from xml.etree import ElementTree as ET
from xml.dom import minidom

# ============================================================
# KONFIGURATION - Hier anpassen!
# ============================================================

# Pfad zum NetHelp-Framework (js/, css/, themes/ werden von hier kopiert)
# Dies ist das angepasste Template-Verzeichnis mit H&M-Kompatibilitaet
NETHELP_TEMPLATE_DIR = r"nethelp-template"

# Standard-Input-Verzeichnis (H&M WebHelp-Export)
DEFAULT_INPUT_DIR = r"HTML-OUTPUT"

# Standard-Output-Verzeichnis (fertige NetHelp-Hilfe)
DEFAULT_OUTPUT_DIR = r"fertige-hilfe"

# Standard-Startseite (wird in settings.xml verwendet)
DEFAULT_HOME_PAGE = "Documents/fs_8bd7d2d2d793.html"

# ============================================================

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("FEHLER: BeautifulSoup ist nicht installiert.")
    print("Bitte installieren Sie es mit: pip install beautifulsoup4 lxml")
    sys.exit(1)


def show_config_and_confirm(input_dir: str, output_dir: str, template_dir: str) -> bool:
    """Zeigt Konfiguration an und fragt nach Bestätigung."""
    print("=" * 60)
    print("HELP+MANUAL POST-PROCESSING")
    print("=" * 60)
    print()
    print("Dieses Skript transformiert den H&M WebHelp-Export")
    print("in das NetHelp-Format (ohne iFrames).")
    print()
    print("KONFIGURATION:")
    print(f"  Input-Verzeichnis:  {input_dir}")
    print(f"  Output-Verzeichnis: {output_dir}")
    print(f"  NetHelp-Template:   {template_dir}")
    print()
    print("  Aus dem Template werden kopiert:")
    print("    - js/        (JavaScript-Framework)")
    print("    - css/       (Stylesheets)")
    print("    - themes/    (Layout-Templates)")
    print("    - LinksExt/  (Externe Links/Styles, falls vorhanden)")
    print()
    print("HINWEIS: Verzeichnisse können auch als Parameter übergeben werden:")
    print("  python postprocess.py [Input-Dir] [Output-Dir]")
    print()

    if not os.path.isdir(template_dir):
        print(f"FEHLER: NetHelp-Template-Verzeichnis existiert nicht: {template_dir}")
        return False

    if not os.path.isdir(input_dir):
        print(f"FEHLER: Input-Verzeichnis existiert nicht: {input_dir}")
        return False

    response = input("Fortfahren? (j/n): ")
    return response.lower() in ['j', 'ja', 'y', 'yes']


def copy_nethelp_framework(template_dir: str, output_dir: str) -> None:
    """Kopiert das NetHelp-Framework aus dem Template-Verzeichnis."""
    print("\n[1/7] Kopiere NetHelp-Framework...")

    # Verzeichnisse die kopiert werden sollen
    dirs_to_copy = ['js', 'css', 'themes', 'LinksExt']

    for dirname in dirs_to_copy:
        src = os.path.join(template_dir, dirname)
        dst = os.path.join(output_dir, dirname)
        if os.path.isdir(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            print(f"  Kopiert: {dirname}/")
        else:
            print(f"  Übersprungen (nicht vorhanden): {dirname}/")

    # Einzelne Dateien die kopiert werden sollen
    files_to_copy = [
        'local.js',
        'searchindex.js',
        'groups.js',
        'groups.xml',
        'nethelppage.js',
        'context.xml'
    ]

    for filename in files_to_copy:
        src = os.path.join(template_dir, filename)
        dst = os.path.join(output_dir, filename)
        if os.path.isfile(src):
            shutil.copy2(src, dst)
            print(f"  Kopiert: {filename}")


def extract_body_content(soup: BeautifulSoup) -> str:
    """Extrahiert den Body-Content aus einer H&M HTML-Datei."""
    # Suche nach dem Content-DIV (idcontent oder innerdiv)
    content_div = soup.find('div', id='idcontent')
    if content_div:
        inner_div = content_div.find('div', id='innerdiv')
        if inner_div:
            return str(inner_div)
        return str(content_div)

    # Fallback: Ganzen Body nehmen
    body = soup.find('body')
    if body:
        return str(body)

    return ""


def get_page_title(soup: BeautifulSoup) -> str:
    """Extrahiert den Seitentitel aus einer H&M HTML-Datei."""
    title_tag = soup.find('title')
    if title_tag:
        return title_tag.get_text(strip=True)

    # Fallback: H1 suchen
    h1 = soup.find('h1')
    if h1:
        return h1.get_text(strip=True)

    return "Untitled"


def fix_image_paths(content: str) -> str:
    """Korrigiert Bildpfade von ./images/ zu ../ImagesExt/."""
    # H&M verwendet ./images/, NetHelp verwendet ../ImagesExt/
    content = re.sub(r'src="\.?/?images/', 'src="../ImagesExt/', content)
    content = re.sub(r"src='\.?/?images/", "src='../ImagesExt/", content)
    return content


def fix_internal_links(content: str) -> str:
    """Korrigiert interne Links zu anderen Seiten."""
    # Entferne target="hmcontent" Attribute
    content = re.sub(r'\s+target=["\']hmcontent["\']', '', content)
    return content


def fix_heading_borders(content: str) -> str:
    """Ergänzt border-bottom bei Überschriften mit Strich.

    Die Klasse p_UeberschriftEinfach_Gross hat in default.css border-width: 0,
    wodurch die inline-Styles border-top/right/left: none nicht zum gewünschten
    Strich führen. Diese Funktion fügt explizit border-bottom hinzu.
    """
    pattern = r'class="p_UeberschriftEinfach_Gross"([^>]*?)style="([^"]*?)"'

    def add_border_bottom(match):
        attrs = match.group(1)
        style = match.group(2)
        if 'border-bottom' not in style:
            style += '; border-bottom: 1px solid #000'
        return f'class="p_UeberschriftEinfach_Gross"{attrs}style="{style}"'

    return re.sub(pattern, add_border_bottom, content)


def fix_bullet_points(content: str) -> str:
    """Ersetzt Unicode-Bullet-Zeichen durch Bild (wie in alter Hilfe).

    H&M generiert: <span class="f_Aufzaehlung1" style="...;display:inline-block;width:24px;margin-left:-24px">&#8226;</span>
    Gewünscht:     <span style="display:inline-block;width:24px;margin-left:-24px"><img .../></span>

    Die Einrückung muss beibehalten werden.
    """
    # Pattern für Aufzählungs-Bullets mit Styles
    pattern = r'<span class="f_Aufzaehlung\d+"([^>]*)>(?:&#8226;|&#8211;|•|–)</span>'

    def replace_bullet(match):
        attrs = match.group(1)
        return f'<span{attrs}><img src="../ImagesExt/image10_1.png" alt="" /></span>'

    return re.sub(pattern, replace_bullet, content)


def fix_table_headers(content: str) -> str:
    """Korrigiert die Tabellen-Header-Styles.

    H&M generiert thead/th mit inline-styles, die wir für das gewünschte
    Aussehen (blauer Hintergrund, weiße Schrift) anpassen müssen.
    """
    # th-Elemente mit background-color im style
    def fix_th_style(match):
        full_match = match.group(0)
        # Ersetze background-color Wert durch #4F81BD
        full_match = re.sub(
            r'background-color:\s*#[0-9a-fA-F]+',
            'background-color:#4F81BD',
            full_match
        )
        return full_match

    content = re.sub(r'<th[^>]*style="[^"]*"[^>]*>', fix_th_style, content)

    # strong in thead mit color:#ffffff sicherstellen
    def fix_strong_in_header(match):
        full_match = match.group(0)
        # Stelle sicher dass color:#ffffff gesetzt ist
        if 'color:' in full_match:
            full_match = re.sub(r'color:\s*#[0-9a-fA-F]+', 'color:#ffffff', full_match)
        else:
            full_match = full_match.replace('style="', 'style="color:#ffffff; ')
        return full_match

    # Strong-Tags in thead
    content = re.sub(
        r'<thead>.*?</thead>',
        lambda m: re.sub(r'<strong[^>]*style="[^"]*"[^>]*>', fix_strong_in_header, m.group(0)),
        content,
        flags=re.DOTALL
    )

    return content


def create_nethelp_document(title: str, content: str, filename: str,
                           prev_page: Optional[str] = None,
                           next_page: Optional[str] = None) -> str:
    """Erstellt ein NetHelp-kompatibles Dokument."""

    # Links für Navigation
    prev_link = f'<link rel="prev" href="{prev_page}" />' if prev_page else ''
    next_link = f'<link rel="next" href="{next_page}" />' if next_page else ''

    # H1-Titel am Anfang hinzufügen (wie im Original Doc-To-Help Format)
    h1_title = f'<h1>{title}</h1>\n'

    html = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>{title}</title>
<meta charset="utf-8" />
<link rel="stylesheet" type="text/css" href="../LinksExt/TRMS.css" />
<link rel="stylesheet" type="text/css" href="../LinksExt/HelpAndManual.css" />
<script src="../js/nethelp.redirector.js" type="text/javascript"></script>
{prev_link}{next_link}
<meta name="Generator" content="Help+Manual PostProcessor" />
</head>
<body>
{h1_title}{content}
</body></html>
'''
    return html


def convert_content_pages(input_dir: str, output_dir: str) -> List[Tuple[str, str]]:
    """Konvertiert alle Content-Seiten aus dem H&M-Export."""
    print("\n[2/7] Konvertiere Content-Seiten...")

    documents_dir = os.path.join(output_dir, 'Documents')
    os.makedirs(documents_dir, exist_ok=True)

    # Finde alle fs_*.html Dateien
    pages = []
    for filename in os.listdir(input_dir):
        if filename.startswith('fs_') and filename.endswith('.html'):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(documents_dir, filename)

            with open(input_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'lxml')

            title = get_page_title(soup)
            content = extract_body_content(soup)

            # Pfade korrigieren
            content = fix_image_paths(content)
            content = fix_internal_links(content)
            content = fix_heading_borders(content)
            content = fix_bullet_points(content)
            content = fix_table_headers(content)

            # NetHelp-Dokument erstellen
            html = create_nethelp_document(title, content, filename)

            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html)

            pages.append((filename, title))

    print(f"  Konvertiert: {len(pages)} Seiten")
    return pages


def parse_hmcontent_toc(soup: BeautifulSoup, ul_element) -> List[dict]:
    """Parst rekursiv die TOC-Struktur aus hmcontent.html."""
    items = []

    for li in ul_element.find_all('li', recursive=False):
        item = {}

        # Link und Titel finden
        a = li.find('a', recursive=False)
        if a:
            href = a.get('href', '')
            # Nur Dateiname extrahieren, ohne Pfad
            if '/' in href:
                href = href.split('/')[-1]
            item['url'] = f'Documents/{href}'

            span = a.find('span')
            if span:
                item['title'] = span.get_text(strip=True)
            else:
                item['title'] = a.get_text(strip=True)

        # Kinder finden (verschachtelte ul)
        child_ul = li.find('ul', recursive=False)
        if child_ul:
            item['children'] = parse_hmcontent_toc(soup, child_ul)

        if 'url' in item and 'title' in item:
            items.append(item)

    return items


def toc_to_xml_element(items: List[dict], parent: ET.Element) -> None:
    """Konvertiert TOC-Items rekursiv zu XML-Elementen."""
    for item in items:
        elem = ET.SubElement(parent, 'item', url=item['url'])

        title = ET.SubElement(elem, 'title')
        title.text = item['title']

        tooltip = ET.SubElement(elem, 'tooltip')
        tooltip.text = item['title']

        if 'children' in item:
            toc_to_xml_element(item['children'], elem)


def prettify_xml(elem: ET.Element) -> str:
    """Formatiert XML mit Einrückung."""
    rough_string = ET.tostring(elem, encoding='unicode')
    # CDATA für Titel hinzufügen
    rough_string = re.sub(r'<title>([^<]*)</title>',
                         r'<title><![CDATA[\1]]></title>', rough_string)
    rough_string = re.sub(r'<tooltip>([^<]*)</tooltip>',
                         r'<tooltip><![CDATA[\1]]></tooltip>', rough_string)

    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ", encoding=None)


def generate_toc_xml(input_dir: str, output_dir: str) -> Optional[str]:
    """Generiert toc.xml aus hmcontent.html."""
    print("\n[3/7] Generiere toc.xml...")

    hmcontent_path = os.path.join(input_dir, 'hmcontent.html')
    if not os.path.isfile(hmcontent_path):
        print("  WARNUNG: hmcontent.html nicht gefunden!")
        return None

    with open(hmcontent_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'lxml')

    # TOC-Liste finden
    toc_ul = soup.find('ul', id='toc')
    if not toc_ul:
        print("  WARNUNG: TOC-Liste nicht gefunden!")
        return None

    # Parsen
    toc_items = parse_hmcontent_toc(soup, toc_ul)

    # XML erstellen
    root = ET.Element('toc')
    toc_to_xml_element(toc_items, root)

    # XML formatieren und speichern
    xml_str = '<?xml version="1.0" encoding="utf-8"?>\n'
    xml_str += ET.tostring(root, encoding='unicode')

    # CDATA hinzufügen
    xml_str = re.sub(r'<title>([^<]*)</title>',
                     r'<title><![CDATA[\1]]></title>', xml_str)
    xml_str = re.sub(r'<tooltip>([^<]*)</tooltip>',
                     r'<tooltip><![CDATA[\1]]></tooltip>', xml_str)

    output_path = os.path.join(output_dir, 'toc.xml')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(xml_str)

    print(f"  Erstellt: toc.xml ({len(toc_items)} Top-Level-Einträge)")

    # Erste Seite als Startseite zurückgeben
    if toc_items:
        return toc_items[0].get('url', DEFAULT_HOME_PAGE)
    return DEFAULT_HOME_PAGE


def parse_hmkwindex_keywords(soup: BeautifulSoup) -> List[dict]:
    """Parst die Keyword-Struktur aus hmkwindex.html."""
    keywords = []

    # Die Keywords sind in einer Select-Liste oder als strukturierte Links
    # Versuche zuerst die Links zu finden
    keyword_links = soup.find_all('a', href=True)

    current_keyword = None
    for link in keyword_links:
        href = link.get('href', '')
        text = link.get_text(strip=True)

        if href.startswith('fs_') and href.endswith('.html'):
            # Nur Dateiname
            if '/' in href:
                href = href.split('/')[-1]

            keyword = {
                'text': text,
                'url': f'Documents/{href}',
                'link_text': text
            }
            keywords.append(keyword)

    return keywords


def generate_keywords_xml(input_dir: str, output_dir: str) -> None:
    """Generiert keywords.xml aus hmkwindex.html."""
    print("\n[4/7] Generiere keywords.xml...")

    hmkwindex_path = os.path.join(input_dir, 'hmkwindex.html')
    if not os.path.isfile(hmkwindex_path):
        print("  WARNUNG: hmkwindex.html nicht gefunden!")
        # Leere keywords.xml erstellen
        xml_str = '<?xml version="1.0" encoding="utf-8"?>\n<keywords>\n</keywords>'
        output_path = os.path.join(output_dir, 'keywords.xml')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(xml_str)
        return

    # Versuche die vorhandene keywords.xml aus dem Template zu verwenden
    # da die H&M-Struktur komplex ist
    template_keywords = os.path.join(NETHELP_TEMPLATE_DIR, 'keywords.xml')
    if os.path.isfile(template_keywords):
        shutil.copy2(template_keywords, os.path.join(output_dir, 'keywords.xml'))
        print("  Kopiert: keywords.xml (aus Template)")
        return

    # Fallback: Leere keywords.xml
    xml_str = '<?xml version="1.0" encoding="utf-8"?>\n<keywords>\n</keywords>'
    output_path = os.path.join(output_dir, 'keywords.xml')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(xml_str)
    print("  Erstellt: keywords.xml (leer)")


def generate_settings_xml(output_dir: str, home_page: str) -> None:
    """Generiert settings.xml."""
    print("\n[5/7] Generiere settings.xml...")

    settings_xml = f'''<?xml version="1.0" encoding="utf-8"?>
<settings>
  <theme>
    <layout>themes/FSNetHelpTheme/layout.html</layout>
    <stylesheet>css/jquery-ui/FsG4Style/jquery-ui.css</stylesheet>
  </theme>
  <references>
    <join>themes/FSNetHelpTheme/settings.theme.xml</join>
    <join>themes/FSNetHelpTheme/settings.de.xml</join>
    <css>LinksExt/TRMS.css</css>
    <css>LinksExt/HelpAndManual.css</css>
  </references>
  <strings>
    <pageHeaderText>Hilfe</pageHeaderText>
    <emailAddress>support@ferber-software.de</emailAddress>
  </strings>
  <topic>
    <home>{home_page}</home>
  </topic>
  <windows>
    <window>
      <name>proc</name>
      <features>left=680,top=10,height=500,width=315,resizable=1,scrollbars=1</features>
    </window>
  </windows>
</settings>
'''

    output_path = os.path.join(output_dir, 'settings.xml')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(settings_xml)

    print("  Erstellt: settings.xml")


def generate_help_html(output_dir: str) -> None:
    """Generiert die minimale Help.html Startdatei."""
    help_html = '''<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <title> </title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <script type="text/javascript" src="js/nethelp.connect.js"></script>
</head>
<body>
    <p id="c1noscript">The content is not shown because JavaScript is disabled.</p>
    <script type="text/javascript">nethelpRender();</script>
</body>
</html>
'''

    output_path = os.path.join(output_dir, 'Help.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(help_html)


def copy_images(input_dir: str, output_dir: str, template_dir: str) -> None:
    """Kopiert Bilder aus dem H&M-Export und Template."""
    print("\n[6/7] Kopiere Bilder...")

    # H&M verwendet ./images/, NetHelp verwendet ImagesExt/
    src_images = os.path.join(input_dir, 'images')
    dst_images = os.path.join(output_dir, 'ImagesExt')

    os.makedirs(dst_images, exist_ok=True)

    # Zuerst Template-Bilder kopieren (z.B. Bullet-Bild)
    template_images = os.path.join(template_dir, 'ImagesExt')
    if os.path.isdir(template_images):
        for filename in os.listdir(template_images):
            src_file = os.path.join(template_images, filename)
            dst_file = os.path.join(dst_images, filename)
            if os.path.isfile(src_file):
                shutil.copy2(src_file, dst_file)

    # Dann H&M-Bilder kopieren (überschreiben Template-Bilder falls gleichnamig)
    if os.path.isdir(src_images):
        for filename in os.listdir(src_images):
            src_file = os.path.join(src_images, filename)
            dst_file = os.path.join(dst_images, filename)
            if os.path.isfile(src_file):
                shutil.copy2(src_file, dst_file)

    file_count = len([f for f in os.listdir(dst_images) if os.path.isfile(os.path.join(dst_images, f))])
    print(f"  Kopiert: {file_count} Bilder nach ImagesExt/")


def copy_hm_css(input_dir: str, output_dir: str) -> None:
    """Kopiert die CSS-Dateien aus dem H&M-Export nach LinksExt/."""
    print("\n[7/7] Kopiere H&M CSS-Dateien...")

    src_css_dir = os.path.join(input_dir, 'css')
    dst_linksext = os.path.join(output_dir, 'LinksExt')
    os.makedirs(dst_linksext, exist_ok=True)

    copied_files = []

    # default.css -> HelpAndManual.css
    src_default = os.path.join(src_css_dir, 'default.css')
    if os.path.isfile(src_default):
        dst_file = os.path.join(dst_linksext, 'HelpAndManual.css')
        shutil.copy2(src_default, dst_file)
        copied_files.append('default.css -> HelpAndManual.css')

    # custom.css auch kopieren falls vorhanden
    src_custom = os.path.join(src_css_dir, 'custom.css')
    if os.path.isfile(src_custom):
        dst_file = os.path.join(dst_linksext, 'custom.css')
        shutil.copy2(src_custom, dst_file)
        copied_files.append('custom.css')

    if copied_files:
        for f in copied_files:
            print(f"  Kopiert: {f}")
    else:
        print("  Keine CSS-Dateien in css/ gefunden")


def resolve_path(path: str, script_dir: str) -> str:
    """Löst einen Pfad relativ zum Skript-Verzeichnis auf."""
    if os.path.isabs(path):
        return path
    return os.path.join(script_dir, path)


def main():
    """Hauptfunktion."""
    # Skript-Verzeichnis ermitteln
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Argumente oder Defaults verwenden
    if len(sys.argv) >= 3:
        # Parameter wurden übergeben
        input_dir = os.path.abspath(sys.argv[1])
        output_dir = os.path.abspath(sys.argv[2])
    elif len(sys.argv) == 2:
        # Nur Input angegeben, Output aus Konfiguration
        input_dir = os.path.abspath(sys.argv[1])
        output_dir = resolve_path(DEFAULT_OUTPUT_DIR, script_dir)
    else:
        # Keine Parameter - Defaults aus Konfiguration verwenden
        input_dir = resolve_path(DEFAULT_INPUT_DIR, script_dir)
        output_dir = resolve_path(DEFAULT_OUTPUT_DIR, script_dir)

    # Template-Verzeichnis relativ zum Skript-Verzeichnis auflösen
    template_dir = resolve_path(NETHELP_TEMPLATE_DIR, script_dir)

    # Bestätigung einholen
    if not show_config_and_confirm(input_dir, output_dir, template_dir):
        print("Abgebrochen.")
        sys.exit(0)

    # Output-Verzeichnis erstellen
    os.makedirs(output_dir, exist_ok=True)

    # 1. NetHelp-Framework kopieren
    copy_nethelp_framework(template_dir, output_dir)

    # 2. Content-Seiten konvertieren
    pages = convert_content_pages(input_dir, output_dir)

    # 3. TOC generieren
    home_page = generate_toc_xml(input_dir, output_dir)
    if not home_page:
        home_page = DEFAULT_HOME_PAGE

    # 4. Keywords generieren
    generate_keywords_xml(input_dir, output_dir)

    # 5. settings.xml generieren
    generate_settings_xml(output_dir, home_page)

    # 6. Help.html generieren
    generate_help_html(output_dir)

    # 7. Bilder kopieren
    copy_images(input_dir, output_dir, template_dir)

    # 8. H&M CSS-Dateien kopieren
    copy_hm_css(input_dir, output_dir)

    # Zusammenfassung
    print()
    print("=" * 60)
    print("FERTIG!")
    print("=" * 60)
    print()
    print(f"Die transformierte Hilfe befindet sich in:")
    print(f"  {output_dir}")
    print()
    print("Zum Testen öffnen Sie:")
    print(f"  {os.path.join(output_dir, 'Help.html')}")
    print()


if __name__ == '__main__':
    main()
