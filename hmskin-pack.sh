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

# Create ZIP with explicit Windows compatibility
with zipfile.ZipFile(skin_file, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(work_dir):
        # Verzeichnisse zuerst hinzufügen
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            arc_name = os.path.relpath(dir_path, work_dir) + '/'
            info = zipfile.ZipInfo(arc_name)
            # Set create_system to 0 (MS-DOS/Windows) instead of 3 (Unix)
            info.create_system = 0
            # Set external_attr for directory (0x10 = directory attribute in DOS)
            info.external_attr = 0x10 << 16
            # Preserve modification time for directory
            mtime = os.path.getmtime(dir_path)
            info.date_time = time.localtime(mtime)[:6]
            zf.writestr(info, '')
        # Dann Dateien
        for file_name in files:
            file_path = os.path.join(root, file_name)
            arc_name = os.path.relpath(file_path, work_dir)
            # Read file content
            with open(file_path, 'rb') as f:
                data = f.read()
            info = zipfile.ZipInfo(arc_name)
            # Set create_system to 0 (MS-DOS/Windows)
            info.create_system = 0
            # Set external_attr for regular file (0x20 = archive attribute in DOS)
            info.external_attr = 0x20 << 16
            # Preserve modification time
            mtime = os.path.getmtime(file_path)
            info.date_time = time.localtime(mtime)[:6]
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, data)
PYEOF

echo "Fertig. Inhalt von $SKIN_FILE:"
unzip -l "$SKIN_FILE"
