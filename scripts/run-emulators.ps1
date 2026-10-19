. "$PSScriptRoot\ambiente.ps1"
$firebaseArgs = @('node_modules/firebase-tools/lib/bin/firebase.js','emulators:start','--project','demo-conduzapp','--export-on-exit','.emulator-data')
if (Test-Path -LiteralPath .emulator-data/firebase-export-metadata.json) { $firebaseArgs += @('--import','.emulator-data') }
& node @firebaseArgs
