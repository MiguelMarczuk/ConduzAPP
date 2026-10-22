# Ambiente compartilhado da apresentação

Status: **preparação de código; conta Google, projeto, faturamento, deploy e validação em dispositivos ainda pendentes**. Nenhuma base online ou faturamento foi criado automaticamente.

O GitHub `MiguelMarczuk/ConduzAPP` foi tornado público a pedido do responsável. A revisão abrangeu 25 commits e 431 blobs, sem credenciais privadas identificadas. As 22 ocorrências de senhas literais são exclusivas dos testes/emuladores e não serão usadas online. Repositório público não torna o banco público.

## Configuração e proteção

- O modo padrão permanece local. `scripts/run-web.ps1` força o uso dos emuladores.
- `cloud-demo` exige projeto explícito e consistente em frontend e backend, sem fallback para localhost. Authentication guarda as contas, Firestore os registros e referências, Storage os arquivos e Hosting serve a interface HTTPS.
- O backend e o Storage online exigem claims assinadas `conduzDemo` e `stateScope`, provisionadas pelo responsável. Cadastro comum não concede acesso ao cenário.
- As senhas online são aleatórias e diferentes das contas locais. O manifesto privado fica em `.tools/cloud-demo/acessos.json`, ignorado pelo Git; compartilhe apenas com os integrantes autorizados, nunca no GitHub ou em prints.
- Documentos continuam privados para dono/admin. Evidências exigem vínculo de aula e o mesmo cenário. Leituras/escritas diretas do cliente no Firestore permanecem negadas.
- A preparação configura CORS de leitura para as duas origens HTTPS do Hosting, preservando as entradas existentes do bucket. Isso permite carregar fotos pelo SDK sem tornar objetos públicos. Referência: [download com controle de acesso](https://firebase.google.com/docs/storage/web/download-files).
- Pagamentos e estornos continuam simulados. O relógio de ensaio exige administrador e cenário isolado, com limite de sete dias. Não altera o relógio dos dispositivos.
- O servidor usa identidade gerenciada, sem chave administrativa no frontend. A preparação usa a sessão Google da CLI em memória, sem gerar chave de serviço.

## Antes de publicar

Entre em https://console.firebase.google.com/ com a conta Google do TCC. Se existir projeto antigo, inspecione antes de usar. Prefira um projeto dedicado à apresentação, sem dados de produção.

Functions e Storage online exigem o plano Blaze vinculado a faturamento. Existem franquias gratuitas, mas não é possível garantir custo zero. A ativação deve ser revisada e concluída pelo responsável; os scripts apenas verificam se já está habilitada. Alertas de orçamento não são teto rígido de gastos.

Fontes oficiais consultadas em 21/10/2026: [planos](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Storage e Blaze](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [Functions](https://firebase.google.com/docs/functions/get-started), [Hosting](https://firebase.google.com/docs/hosting/quickstart).

## Preparação após escolher o projeto

No PowerShell, na pasta do ConduzAPP:

```powershell
. .\scripts\ambiente.ps1
node node_modules/firebase-tools/lib/bin/firebase.js login
node node_modules/firebase-tools/lib/bin/firebase.js projects:list
```

Conclua o login no navegador. Não envie códigos, senhas ou tokens pelo chat.

No projeto escolhido, preparar Authentication com E-mail/Senha, Firestore nativo e o bucket padrão do Storage, inicialmente com regras fechadas. Registrar um aplicativo web e obter o App ID. Não importar automaticamente os dados do projeto antigo.

```powershell
node scripts/configure-cloud.cjs SEU-PROJETO APP-ID-WEB demo-tcc-2026
node scripts/prepare-cloud-demo.cjs
```

O primeiro comando consulta a configuração web autenticada e gera `.tools/cloud-demo/config.json` e `functions/.env.SEU-PROJETO`, ambos ignorados pelo Git. O segundo exige faturamento já habilitado e prepara novos UIDs, senhas aleatórias, fotos ilustrativas, agenda e aula histórica da fixture existente. O Firestore recebe referências; nenhuma imagem Base64 é salva nele. As fotos pessoais e os dados locais não são migrados automaticamente e permanecem preservados neste computador.

Reexecutar preserva os documentos e objetos existentes. Não renova datas nem desfaz operações do ensaio. Os scripts recusam mudança silenciosa de projeto/cenário; para renovar, preserve os manifestos e planeje explicitamente outro cenário.

## Verificação, build e publicação

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Verificar.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\Build-Online.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\Deploy-Online.ps1 -ProjectId SEU-PROJETO
```

O deploy usa `firebase.cloud.json`, `dist`, regras Firestore fechadas, `storage.cloud.rules` e a Function autenticada. Verificar permissões de Firestore e leitura do Storage para a identidade de execução no projeto escolhido. A Function tem uma instância máxima e nenhuma mínima; isso não garante limite financeiro.

O build online é separado do servidor local. Publicar só o frontend não disponibiliza banco, arquivos nem contas. O modo online só deve ser considerado pronto após validar no endereço HTTPS real:

1. Dois dispositivos/navegadores independentes acessam o mesmo aluno, instrutor e dados.
2. Foto real de teste: selecionar → prévia → salvar → recarregar → foto persistente na outra sessão. Repetir para instrutor e após logout/login.
3. Agenda, reserva, aceite, pagamento simulado, bloqueio de horário, mensagens, avaliações e administração funcionam na mesma base.
4. Acesso anônimo, conta sem convite e terceiros não obtêm documentos/avaliações privadas/evidências.
5. Relógio do ensaio permite demonstrar código e conclusão; restaurar depois. Conferir datas antes de 30/10.

Testes locais e builds não comprovam uma publicação online. Projeto, provisionamento, deploy e essa validação externa continuam pendentes. Não foi alterada a branch `main` nem a base principal dos emuladores.

## Verificações executadas na preparação

- 62 testes unitários aprovados, incluindo ambiente explícito, proteção por convite/cenário, ausência de fallback local, serialização das referências e CORS.
- 27 testes de integração/autorização aprovados nos emuladores, incluindo duas verificações das regras online. O Storage Emulator resolve vínculos Firestore no projeto principal: a suíte espelha somente um documento auxiliar com UUID exclusivo e o remove ao final, sem tocar na base principal.
- TypeScript e build web local aprovados, com 23 rotas.
- Build `cloud-demo` aprovado com configuração fictícia e sem deploy, com 23 rotas. Isso valida a compilação da variante online, não o acesso a um projeto real.
- Sintaxe dos scripts PowerShell de build/deploy validada.
- Arquivos de configuração real, credenciais e snapshots continuam ignorados pelo Git. As contas online não foram criadas porque o login Google ainda está pendente.
