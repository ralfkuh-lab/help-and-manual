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

def add_file(zf, file_path, arc_name):
    """Add a file to the ZIP with Windows-compatible attributes."""
    with open(file_path, 'rb') as f:
        data = f.read()
    info = zipfile.ZipInfo(arc_name)
    # Set create_system to 0 (MS-DOS/Windows)
    info.create_system = 0
    # Set external_attr for regular file with archive attribute (0x20)
    info.external_attr = 0x20
    # Preserve modification time
    mtime = os.path.getmtime(file_path)
    info.date_time = time.localtime(mtime)[:6]
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, data)

# Collect all files (no directory entries, like the reference)
baggage_files = []
root_files = []

for root, dirs, files in os.walk(work_dir):
    for file_name in files:
        file_path = os.path.join(root, file_name)
        arc_name = os.path.relpath(file_path, work_dir)
        if arc_name.startswith('Baggage/'):
            baggage_files.append((file_path, arc_name))
        else:
            root_files.append((file_path, arc_name))

# Sort alphabetically (like the reference)
baggage_files.sort(key=lambda x: x[1].lower())
root_files.sort(key=lambda x: x[1].lower())

# Create ZIP: Baggage files first, then root files (like the reference)
with zipfile.ZipFile(skin_file, 'w', zipfile.ZIP_DEFLATED) as zf:
    for file_path, arc_name in baggage_files:
        add_file(zf, file_path, arc_name)
    for file_path, arc_name in root_files:
        add_file(zf, file_path, arc_name)
PYEOF

echo "Fertig. Inhalt von $SKIN_FILE:"
unzip -l "$SKIN_FILE"
