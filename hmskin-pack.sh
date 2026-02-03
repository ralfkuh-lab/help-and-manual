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

# ZIP erstellen (überschreibt vorhandene Datei)
echo "Packe $WORK_DIR zu $SKIN_FILE..."
cd "$WORK_DIR"
zip -q -r "$SKIN_FILE" .

echo "Fertig. Inhalt von $SKIN_FILE:"
unzip -l "$SKIN_FILE"
