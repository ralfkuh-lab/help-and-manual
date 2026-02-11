# Extrahiert Ferber.hmskin in das Arbeitsverzeichnis hmskin-work/

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$WorkDir = Join-Path $ScriptDir "hmskin-work"
$SkinFile = Join-Path $ScriptDir "Ferber.hmskin"

# Prüfen ob Skin-Datei existiert
if (-not (Test-Path $SkinFile)) {
    Write-Host "Fehler: $SkinFile nicht gefunden" -ForegroundColor Red
    exit 1
}

# Arbeitsverzeichnis erstellen oder leeren
if (Test-Path $WorkDir) {
    Write-Host "Leere $WorkDir..." -ForegroundColor Yellow
    Remove-Item -Path "$WorkDir\*" -Recurse -Force
} else {
    Write-Host "Erstelle $WorkDir..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $WorkDir | Out-Null
}

# Extrahieren mit .NET (Expand-Archive unterstützt nur .zip Extension)
Write-Host "Extrahiere $SkinFile..." -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($SkinFile, $WorkDir)

Write-Host "Fertig. Inhalt von $WorkDir`:" -ForegroundColor Green
Get-ChildItem -Path $WorkDir | Format-Table Name, Length, LastWriteTime -AutoSize
