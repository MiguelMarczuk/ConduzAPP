param([string]$ConfigPath = '.tools/cloud-demo/config.json')
. "$PSScriptRoot\ambiente.ps1"
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $ConfigPath)) { throw 'Configure o projeto online primeiro. Veja docs/AMBIENTE_ONLINE.md.' }
$taskConfig = Get-Content -Raw -LiteralPath $ConfigPath | ConvertFrom-Json
if ($taskConfig.projectId -notmatch '^[a-z][a-z0-9-]{4,28}[a-z0-9]$' -or $taskConfig.projectId.StartsWith('demo-')) { throw 'Projeto online inválido.' }
$taskKeys = @('EXPO_PUBLIC_FIREBASE_MODE','EXPO_PUBLIC_FIREBASE_API_KEY','EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN','EXPO_PUBLIC_FIREBASE_PROJECT_ID','EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET','EXPO_PUBLIC_FIREBASE_APP_ID')
$taskPrevious = @{}
foreach ($taskKey in $taskKeys) { $taskPrevious[$taskKey] = [Environment]::GetEnvironmentVariable($taskKey, 'Process') }
try {
  $env:EXPO_PUBLIC_FIREBASE_MODE = 'cloud-demo'
  $env:EXPO_PUBLIC_FIREBASE_API_KEY = $taskConfig.web.apiKey
  $env:EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = $taskConfig.web.authDomain
  $env:EXPO_PUBLIC_FIREBASE_PROJECT_ID = $taskConfig.projectId
  $env:EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = $taskConfig.storageBucket
  $env:EXPO_PUBLIC_FIREBASE_APP_ID = $taskConfig.web.appId
  & node node_modules/expo/bin/cli export --platform web --clear
  if ($LASTEXITCODE -ne 0) { throw 'Build online não aprovado; nada foi publicado.' }
  $taskGit = Get-Command git -ErrorAction SilentlyContinue
  $taskCommit = if ($taskGit) { & $taskGit.Source rev-parse HEAD } else { 'git-indisponivel-no-PATH' }
  @{ projectId=$taskConfig.projectId; scope=$taskConfig.scope; commit=$taskCommit; builtAt=(Get-Date).ToUniversalTime().ToString('o') } | ConvertTo-Json | Set-Content '.tools/cloud-demo/build.json'
} finally {
  foreach ($taskKey in $taskKeys) { [Environment]::SetEnvironmentVariable($taskKey, $taskPrevious[$taskKey], 'Process') }
}
