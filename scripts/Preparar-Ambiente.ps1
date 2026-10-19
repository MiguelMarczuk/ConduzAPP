$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
New-Item -ItemType Directory -Force .tools | Out-Null
if (-not (Test-Path .tools/node)) {
 Invoke-WebRequest -Uri 'https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt' -OutFile .tools/node-shasums.txt
 $line = Get-Content .tools/node-shasums.txt | Where-Object { $_ -match 'win-x64.zip$' }
 $filename = ($line -split '\s+')[1]
 Invoke-WebRequest -Uri ('https://nodejs.org/dist/latest-v22.x/' + $filename) -OutFile .tools/node.zip
 if ((Get-FileHash .tools/node.zip -Algorithm SHA256).Hash.ToLower() -ne ($line -split '\s+')[0]) { throw 'Checksum Node inválido' }
 Expand-Archive -LiteralPath .tools/node.zip -DestinationPath .tools/node
}
if (-not (Test-Path .tools/java)) {
 Invoke-WebRequest -Uri 'https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jre/hotspot/normal/eclipse' -OutFile .tools/java.zip
 Expand-Archive -LiteralPath .tools/java.zip -DestinationPath .tools/java
}
. "$PSScriptRoot\ambiente.ps1"
& node "$($nodeFolder.FullName)\node_modules\npm\bin\npm-cli.js" ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Falha nas dependências do aplicativo.' }
& node "$($nodeFolder.FullName)\node_modules\npm\bin\npm-cli.js" ci --prefix functions --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Falha nas dependências das Functions.' }
Write-Output 'Ambiente pronto. Execute .\Iniciar-ConduzAPP.ps1'
