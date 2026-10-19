. "$PSScriptRoot\ambiente.ps1"
& node --test tests/domain.test.cjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& node node_modules/typescript/bin/tsc --noEmit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& node --test tests/emulators.test.cjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$env:EXPO_NO_TELEMETRY='1'
$env:EXPO_OFFLINE='1'
& node node_modules/expo/bin/cli export --platform web
exit $LASTEXITCODE
