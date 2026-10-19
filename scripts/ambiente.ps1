$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$nodeFolder = Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools\node') -Directory | Select-Object -First 1
$javaFolder = Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools\java') -Directory | Select-Object -First 1
if (-not $nodeFolder -or -not $javaFolder) { throw 'Execute scripts\Preparar-Ambiente.ps1 primeiro.' }
$env:PATH = $nodeFolder.FullName + ';' + (Join-Path $javaFolder.FullName 'bin') + ';' + $env:PATH
$env:JAVA_HOME = $javaFolder.FullName
$env:FIREBASE_CLI_DISABLE_MOTD = '1'
$env:CI = '1'
$env:npm_config_cache = Join-Path $projectRoot '.tools\npm-cache'
