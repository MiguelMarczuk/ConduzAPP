. "$PSScriptRoot\scripts\ambiente.ps1"
& node scripts/prepare-demo.cjs
if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar demonstracao. Inicie os emuladores com Iniciar-ConduzAPP.ps1 e tente novamente.' }
