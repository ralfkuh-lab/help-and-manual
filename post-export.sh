#!/bin/bash
# Post-Export Script: Generiert NetHelp XML-Dateien aus H&M Export
# Ausführen nach jedem H&M WebHelp-Export

cd "$(dirname "$0")"

EXPORT_DIR="hm-export"

if [ ! -d "$EXPORT_DIR" ]; then
    echo "Fehler: $EXPORT_DIR nicht gefunden"
    exit 1
fi

echo "Generiere NetHelp XML-Dateien aus H&M Export..."

# 1. Finde das erste Topic als Home-Topic
FIRST_TOPIC=$(grep -oP 'hf:"[^"]+\.html"' "$EXPORT_DIR/js/hmcontent.js" | head -1 | sed 's/hf:"\(.*\)"/\1/')
echo "Home-Topic: $FIRST_TOPIC"

# 2. Aktualisiere settings.xml mit korrektem Home-Topic
if [ -f "$EXPORT_DIR/settings.xml" ]; then
    sed -i "s|<home>.*</home>|<home>$FIRST_TOPIC</home>|" "$EXPORT_DIR/settings.xml"
    echo "settings.xml aktualisiert"
fi

# 3. Generiere toc.xml aus hmcontent.js
python3 << 'PYTHON_SCRIPT'
import re

with open('hm-export/js/hmcontent.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extrahiere alle Felder mit Positionen
cps = [(m.start(), m.group(1)) for m in re.finditer(r'cp:"([^"]*)"', content)]
hfs = [(m.start(), m.group(1)) for m in re.finditer(r'hf:"([^"]*)"', content)]
lvs = [(m.start(), m.group(1)) for m in re.finditer(r'lv:(\d+)', content)]

# Kombiniere nach Position
entries = []
for cp_pos, cp_val in cps:
    hf_val = next((hf for pos, hf in hfs if pos > cp_pos - 50 and pos < cp_pos + 200), None)
    lv_val = next((lv for pos, lv in lvs if pos > cp_pos - 100 and pos < cp_pos + 50), None)

    if hf_val and lv_val:
        entries.append({
            'title': cp_val,
            'url': hf_val,
            'level': int(lv_val)
        })

print(f"Gefundene Topics: {len(entries)}")

# Baue XML
xml = '<?xml version="1.0" encoding="utf-8"?>\n<toc>\n'

stack = []
for i, entry in enumerate(entries):
    level = entry['level']
    title = entry['title']
    url = entry['url']

    while stack and stack[-1] >= level:
        stack.pop()
        xml += '  ' * (len(stack) + 1) + '</item>\n'

    has_children = (i + 1 < len(entries) and entries[i+1]['level'] > level)

    indent = '  ' * (len(stack) + 1)
    xml += f'{indent}<item url="{url}">\n'
    xml += f'{indent}  <title><![CDATA[{title}]]></title>\n'
    xml += f'{indent}  <tooltip><![CDATA[{title}]]></tooltip>\n'

    if has_children:
        stack.append(level)
    else:
        xml += f'{indent}</item>\n'

while stack:
    stack.pop()
    xml += '  ' * (len(stack) + 1) + '</item>\n'

xml += '</toc>\n'

with open('hm-export/toc.xml', 'w', encoding='utf-8') as f:
    f.write(xml)

print("toc.xml generiert")
PYTHON_SCRIPT

echo "Fertig."
