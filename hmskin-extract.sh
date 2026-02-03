#!/bin/bash
# Extrahiert Ferber.hmskin in das Arbeitsverzeichnis hmskin-work/

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="$SCRIPT_DIR/hmskin-work"
SKIN_FILE="$SCRIPT_DIR/Ferber.hmskin"

if [[ ! -f "$SKIN_FILE" ]]; then
    echo "Fehler: $SKIN_FILE nicht gefunden"
    exit 1
fi

# Arbeitsverzeichnis erstellen oder leeren
if [[ -d "$WORK_DIR" ]]; then
    echo "Leere $WORK_DIR..."
    rm -rf "$WORK_DIR"/*
else
    echo "Erstelle $WORK_DIR..."
    mkdir -p "$WORK_DIR"
fi

# Extrahieren
echo "Extrahiere $SKIN_FILE..."
unzip -q "$SKIN_FILE" -d "$WORK_DIR"

echo "Fertig. Inhalt von $WORK_DIR:"
ls -la "$WORK_DIR"
