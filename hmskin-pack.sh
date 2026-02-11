#!/bin/bash
# Packt hmskin-work/ zu Ferber.hmskin

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="$SCRIPT_DIR/hmskin-work"
SKIN_FILE="$SCRIPT_DIR/Ferber.hmskin"

if [[ ! -d "$WORK_DIR" ]]; then
    echo "Fehler: $WORK_DIR nicht gefunden"
    echo "Führe zuerst hmskin-extract.sh aus"
    exit 1
fi

# Prüfen ob Arbeitsverzeichnis Inhalt hat
if [[ -z "$(ls -A "$WORK_DIR")" ]]; then
    echo "Fehler: $WORK_DIR ist leer"
    exit 1
fi

# Alte Datei löschen falls vorhanden
rm -f "$SKIN_FILE"

# ZIP erstellen mit Python für maximale Windows-Kompatibilität
# Python's zipfile Modul erstellt "saubere" ZIPs ohne Unix-Metadaten
echo "Packe $WORK_DIR zu $SKIN_FILE..."
export WORK_DIR SKIN_FILE
python3 << 'PYEOF'
import zipfile
import os
import time

work_dir = os.environ['WORK_DIR']
skin_file = os.environ['SKIN_FILE']

def add_directory(zf, dir_path, arc_name):
    """Add a directory entry to the ZIP."""
    info = zipfile.ZipInfo(arc_name)
    info.create_system = 0
    # 0x10 = directory attribute in DOS
    info.external_attr = 0x10
    mtime = os.path.getmtime(dir_path)
    info.date_time = time.localtime(mtime)[:6]
    zf.writestr(info, '')

def add_file(zf, file_path, arc_name):
    """Add a file to the ZIP with Windows-compatible attributes."""
    with open(file_path, 'rb') as f:
        data = f.read()
    info = zipfile.ZipInfo(arc_name)
    info.create_system = 0
    # 0x20 = archive attribute in DOS
    info.external_attr = 0x20
    mtime = os.path.getmtime(file_path)
    info.date_time = time.localtime(mtime)[:6]
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, data)

# Collect all files
baggage_files = []
root_files = []
baggage_dir = None

for root, dirs, files in os.walk(work_dir):
    rel_root = os.path.relpath(root, work_dir)
    if rel_root == 'Baggage':
        baggage_dir = root
    for file_name in files:
        file_path = os.path.join(root, file_name)
        arc_name = os.path.relpath(file_path, work_dir)
        # WICHTIG: Immer Forward-Slashes für ZIP-Pfade (cross-platform)
        arc_name = arc_name.replace('\\', '/')
        if arc_name.startswith('Baggage/'):
            baggage_files.append((file_path, arc_name))
        else:
            root_files.append((file_path, arc_name))

# Sort Baggage files alphabetically
baggage_files.sort(key=lambda x: x[1].lower())

# Root files in specific order (like the working reference)
root_order = ['helpproject.xsl', 'project.hmxp', 'helpproject.xsd']
root_files.sort(key=lambda x: root_order.index(x[1]) if x[1] in root_order else 999)

# Create ZIP with structure matching the working reference:
# 1. Baggage/ directory entry
# 2. Baggage files
# 3. Root files (helpproject.xsl, project.hmxp, helpproject.xsd)
with zipfile.ZipFile(skin_file, 'w', zipfile.ZIP_DEFLATED) as zf:
    # Add Baggage directory entry first
    if baggage_dir:
        add_directory(zf, baggage_dir, 'Baggage/')
    # Add Baggage files
    for file_path, arc_name in baggage_files:
        add_file(zf, file_path, arc_name)
    # Add root files
    for file_path, arc_name in root_files:
        add_file(zf, file_path, arc_name)
PYEOF

echo "Fertig. Inhalt von $SKIN_FILE:"
unzip -l "$SKIN_FILE"
