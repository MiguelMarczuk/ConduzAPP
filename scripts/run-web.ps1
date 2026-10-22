. "$PSScriptRoot\ambiente.ps1"
# O modo CI desativa a observação de arquivos do Metro no desenvolvimento.
# Testes/build continuam usando CI definido em ambiente.ps1.
$env:CI = $null
$env:EXPO_PUBLIC_FIREBASE_MODE = 'emulator'
$env:EXPO_NO_TELEMETRY = '1'
$env:EXPO_OFFLINE = '1'
& node node_modules/expo/bin/cli start --web --port 8081 --localhost
