# UNZE — Dev-Server sauber neu starten (Cache kaputt / 500 / Error-Overlay)
# WICHTIG: Waehrend npm run dev laeuft NIEMALS npm run build ausfuehren!
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "Stoppe Prozesse auf Port 3000..."
$connections = netstat -ano | Select-String ":3000\s"
$pids = $connections | ForEach-Object { ($_ -split "\s+")[-1] } | Sort-Object -Unique
foreach ($procId in $pids) {
  if ($procId -match "^\d+$" -and $procId -ne "0") {
    taskkill /PID $procId /F 2>$null | Out-Null
  }
}

Start-Sleep -Seconds 2

if (Test-Path ".next") {
  Write-Host "Loesche .next Cache..."
  Remove-Item -Recurse -Force ".next"
}

Write-Host "Starte UNZE mit Turbopack auf http://localhost:3000"
Write-Host "NICHT Port 3001 (My Organizer)!"
Write-Host "Waehrend dev laeuft: kein npm run build!"
npm run dev
