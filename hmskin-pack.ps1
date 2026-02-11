# Packt hmskin-work/ zu Ferber.hmskin
# Erstellt ZIP-Struktur exakt wie das Bash/Python-Script:
# 1. Baggage/ Directory-Entry
# 2. Baggage-Dateien (alphabetisch)
# 3. Root-Dateien (helpproject.xsl, project.hmxp, helpproject.xsd)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$WorkDir = Join-Path $ScriptDir "hmskin-work"
$SkinFile = Join-Path $ScriptDir "Ferber.hmskin"

# Prüfen ob Arbeitsverzeichnis existiert
if (-not (Test-Path $WorkDir)) {
    Write-Host "Fehler: $WorkDir nicht gefunden" -ForegroundColor Red
    Write-Host "Führe zuerst hmskin-extract.ps1 aus" -ForegroundColor Yellow
    exit 1
}

# Prüfen ob Arbeitsverzeichnis Inhalt hat
$items = Get-ChildItem -Path $WorkDir
if ($items.Count -eq 0) {
    Write-Host "Fehler: $WorkDir ist leer" -ForegroundColor Red
    exit 1
}

# Alte Datei löschen falls vorhanden
if (Test-Path $SkinFile) {
    Remove-Item -Path $SkinFile -Force
}

Write-Host "Packe $WorkDir zu $SkinFile..." -ForegroundColor Cyan

# .NET ZIP-Klassen laden
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

# Dateien sammeln und sortieren
$baggageFiles = @()
$rootFiles = @()
$baggageDir = $null

Get-ChildItem -Path $WorkDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($WorkDir.Length + 1)
    # WICHTIG: ZIP-Pfade mit Forward-Slashes (wie in project.hmxp)
    $archivePath = $relativePath.Replace('\', '/')
    if ($relativePath.StartsWith("Baggage\")) {
        $baggageFiles += @{Path = $_.FullName; ArchivePath = $archivePath}
    } else {
        $rootFiles += @{Path = $_.FullName; ArchivePath = $archivePath}
    }
}

# Baggage-Verzeichnis finden
$baggageDirPath = Join-Path $WorkDir "Baggage"
if (Test-Path $baggageDirPath) {
    $baggageDir = Get-Item $baggageDirPath
}

# Baggage-Dateien alphabetisch sortieren
$baggageFiles = $baggageFiles | Sort-Object { $_.ArchivePath.ToLower() }

# Root-Dateien in spezifischer Reihenfolge
$rootOrder = @('helpproject.xsl', 'project.hmxp', 'helpproject.xsd')
$rootFiles = $rootFiles | Sort-Object {
    $idx = $rootOrder.IndexOf($_.ArchivePath)
    if ($idx -ge 0) { $idx } else { 999 }
}

# ZIP erstellen mit manueller Kontrolle
$zip = [System.IO.Compression.ZipFile]::Open($SkinFile, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    # 1. Baggage/ Directory-Entry ZUERST (kritisch für H&M!)
    if ($baggageDir) {
        $dirEntry = $zip.CreateEntry("Baggage/")
        # DOS Directory-Attribut setzen
        $dirEntry.ExternalAttributes = 0x10
    }

    # 2. Baggage-Dateien
    foreach ($file in $baggageFiles) {
        $entry = $zip.CreateEntry($file.ArchivePath, [System.IO.Compression.CompressionLevel]::Optimal)
        # DOS Archive-Attribut setzen
        $entry.ExternalAttributes = 0x20

        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($file.Path)
        try {
            $fileStream.CopyTo($entryStream)
        } finally {
            $fileStream.Close()
            $entryStream.Close()
        }
    }

    # 3. Root-Dateien
    foreach ($file in $rootFiles) {
        $entry = $zip.CreateEntry($file.ArchivePath, [System.IO.Compression.CompressionLevel]::Optimal)
        # DOS Archive-Attribut setzen
        $entry.ExternalAttributes = 0x20

        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($file.Path)
        try {
            $fileStream.CopyTo($entryStream)
        } finally {
            $fileStream.Close()
            $entryStream.Close()
        }
    }
} finally {
    $zip.Dispose()
}

Write-Host "Fertig. Datei erstellt: $SkinFile" -ForegroundColor Green

# Dateigröße anzeigen
$fileInfo = Get-Item $SkinFile
Write-Host "Größe: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray

Write-Host "`nStruktur (erste 10 Einträge):" -ForegroundColor Gray
$verifyZip = [System.IO.Compression.ZipFile]::OpenRead($SkinFile)
try {
    $verifyZip.Entries | Select-Object -First 10 | ForEach-Object {
        Write-Host "  $($_.FullName)" -ForegroundColor DarkGray
    }
} finally {
    $verifyZip.Dispose()
}
