. "$PSScriptRoot\ambiente.ps1"
$env:EXPO_NO_TELEMETRY = '1'
$env:EXPO_OFFLINE = '1'
& node node_modules/expo/bin/cli start --web --port 8081 --localhost
