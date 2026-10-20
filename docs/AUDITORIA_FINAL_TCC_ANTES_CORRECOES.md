# ConduzAPP — Auditoria final da recuperação do TCC

Data: **19/10/2026**. Apresentação: **30/10/2026**. Base: branch `recuperacao-tcc`, HEAD `0124992`.

**Conclusão:** o fluxo central de solicitação → aceite → pagamento simulado → conclusão → avaliação foi recuperado. A lista desta auditoria ainda não está integralmente atendida. Entre 55 itens individualizados, há quatro ausências, seis requisitos parciais e um implementado sem validação específica. Dois defeitos merecem prioridade antes de declarar recuperação completa: contestação após registro de falta e exposição de avaliações de alunos a terceiros.

A comparação usa os requisitos fornecidos e o código disponível. **Não comprova equivalência integral com a última versão inacessível do computador anterior.** Nenhuma funcionalidade, teste persistente ou configuração foi alterada. Nenhum commit, push ou deploy foi realizado. O único arquivo criado é este relatório.

## Método e alcance

- **U01–U19:** testes unitários existentes em `tests/domain.test.cjs`. Os **19 passaram novamente nesta auditoria**. Não usam Auth, Firestore ou Storage.
- **I01–I07:** testes de integração em `tests/emulators.test.cjs`, com Auth, endpoint Functions, transações e regras Firestore/Storage. **Sete aprovações registradas na recuperação anterior**, no mesmo HEAD. Código e asserções revisados; não reexecutados nesta auditoria porque sobrescrevem temporariamente o mesmo `private/state` da demonstração aberta.
- **V anterior:** conferências manuais no navegador registradas em `docs/VALIDACAO.md` e na sessão de recuperação. Não repetidas nesta auditoria. Não existe suíte automatizada de interface/E2E.
- **E01–E13:** verificações adicionais desta auditoria, contra objetos fictícios em memória. Não acessam emuladores, não foram adicionadas à suíte e **não aumentam o total oficial de 26 testes**.
- **L:** inspeção estática, sem equivaler a execução. Para a regra negativa “não inventar integração com Detran”, a inspeção estrutural é a evidência adequada.
- **TypeScript:** `tsc --noEmit` executado novamente, sem erros, saída 0.
- **Build web:** aprovação anterior conferida em `docs/VALIDACAO.md`, com 23 rotas. Não recompilado nesta auditoria; a implementação não mudou.

“Implementada e validada” exige evidência direta identificada por U, I anterior, V anterior ou E; não significa cobertura exaustiva. “Implementada, mas não validada” significa código encontrado sem exercício específico suficiente. **D** = domínio; **UI** = painel; **API** = Function; **FR/ST** = regras Firestore/Storage. Links indicam a linha auditada.

## Matriz de regras

### Agendamentos

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| A01 — Novas aulas de 60 minutos | Implementada e validada | U06; I02 anterior | [D:325](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:325>) | Sem migração da base antiga; preservação de duração é verificada no modelo atual. |
| A02 — Início em horas cheias | Implementada e validada | U06 | [D:63](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:63>) | Sem integração específica de minutos/segundos inválidos. |
| A03 — Disponibilidade semanal do instrutor | Implementada e validada | U02/U04/U05; I04 e V anteriores | [D:310](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:310>), [UI:425](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:425>) | Sem períodos, não há horários. |
| A04 — Vários períodos no mesmo dia | Implementada e validada | U05; V anterior | [D:32](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:32>), [UI:468](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:468>) | Limite adicional de 28 períodos não constava do requisito. |
| A05 — Bloqueios de datas específicas | Parcialmente implementada | U04 para data válida; E12 para falha | [D:56](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:56>), [UI:486](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:486>) | Datas válidas bloqueiam; `2026-99-99` também é aceita e não bloqueia nada. Falta validar existência da data. |
| A06 — Próximos sete dias | Implementada e validada | U06; V anterior | [D:101](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:101>), [UI:267](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:267>) | Janela móvel de 168h, incluindo hoje. Confirmar se eram esperados sete dias de calendário completos. |
| A07 — Reserva bloqueia horário | Implementada e validada | U07; I02/I03 e V anteriores | [D:89](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:89>) | Solicitação não paga também ocupa horário; não há expiração automática. |
| A08 — Proteção contra concorrência | Implementada e validada | I02 anterior: duas chamadas simultâneas, uma aceita | [API:35](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js:35>), [D:325](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:325>) | Transação serializa documento agregado; não é arquitetura dimensionada para produção. |
| A09 — Alterar disponibilidade preserva aulas anteriores | Implementada e validada | E01; sem teste persistente dedicado | [D:310](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:310>) | Retirar períodos ou adicionar bloqueio não modifica a reserva existente. |

### Preços e pagamentos

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| P01 — Instrutor define preço | Implementada e validada | E02 via `profile`; sem U/I dedicado à edição | [D:244](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:244>), [UI:905](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:905>) | Backend impõe R$ 1–1.000. Piso/teto não constavam da lista esperada. |
| P02 — Preço congelado na reserva | Implementada e validada | U06; E02 | [D:338](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:338>) | U06 modifica perfil diretamente; E02 confirmou também pela operação do domínio. |
| P03 — Comissão de 3% no backend | Implementada e validada | U06; I02 anterior | [D:347](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:347>) | Centavos com arredondamento inteiro; não representa liquidação financeira. |
| P04 — Aceite gera aguardando pagamento | Implementada e validada | U08; I03 e V anteriores | [D:358](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:358>) | Aceite expirado é recusado, coberto por U18. |
| P05 — Só pagamento validado confirma aula | Implementada e validada | U08; I03 e V anteriores | [D:366](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:366>), [UI:578](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:578>) | Validação exclusivamente simulada: aluno participante aciona backend após aceite. Sem webhook ou validação financeira real. |
| P06 — Simulação separada de pagamentos reais | Implementada e validada | U08; L; rótulos em V anterior | [D:350](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:350>), [API:1](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js:1>) | Separação por ambiente emulado e ausência de integração real. Não existe adaptador real recuperado do Mercado Pago; isso não impede a simulação do TCC. |
| P07 — Elegibilidade não é transferência | Implementada e validada | U15/U19; E07 | [D:458](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:458>), [UI:702](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:702>) | Apenas flag, consultada explicitamente após a janela; nenhum dinheiro transferido. |

### Cancelamentos e faltas

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| CF01 — Aluno, mais de 2h: 100% | Implementada e validada | U09 | [D:378](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:378>) | Registra estorno simulado pendente, sem devolução real. |
| CF02 — Até 2h, antes do início: 50% | Implementada e validada | U09: exatamente 2h e recusa no início | [D:385](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:385>) | Sem integração específica da política. |
| CF03 — No-show do aluno: sem reembolso | Implementada e validada | U16 | [D:574](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:574>) | Confirmação administrativa, sem detecção automática. Ver contestação após falta. |
| CF04 — Instrutor cancela: reembolso integral | Implementada e validada | U10 | [D:384](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:384>) | E10 confirmou conclusão de estorno simulado exclusiva do admin. |
| CF05 — Tolerância de 20 minutos | Implementada e validada | U16: 19 e 20min | [D:585](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:585>) | Falta a partir de 20min, por decisão manual; sem check-in/geolocalização. |
| CF06 — Cinco cancelamentos relevantes: alerta | Parcialmente implementada | U10; E05 | [D:394](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:394>), [UI:1110](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:1110>) | Conta todo cancelamento do instrutor, inclusive solicitação não aceita/não paga. “Relevante” não é filtrado. Alerta é flag no painel, sem notificação interna. |
| CF07 — Três faltas administrativas: suspensão temporária | Implementada e validada | U16; E09; I04 anterior para bloqueio | [D:594](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:594>) | Sete dias e alerta. Teste parte do contador 2, não percorre três aulas. Retorno após prazo é automático, sem nova análise obrigatória. |
| CF08 — Penalização não altera estrelas | Implementada e validada | E08 com avaliação preexistente; U16 é fraco neste ponto | [D:378](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:378>), [D:574](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:574>) | U16 compara avaliações inicialmente vazias. E08 verificou nota/comentário preexistentes. |

### Remarcação

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| R01 — Ambos participantes podem propor | Implementada e validada | U11: instrutor; E03: aluno | [D:400](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:400>), [UI:601](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:601>) | Sem integração ou visual específico de remarcação. |
| R02 — Aceite da outra parte | Implementada e validada | U11; E03 | [D:413](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:413>) | Proponente não aceita a própria proposta. |
| R03 — Solicitação até três horas antes | Implementada e validada | U11 recusa 2h; E03 aceita exatamente 3h | [D:400](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:400>) | Restrições extras: aceite também antes do limite e novo horário com 3h de antecedência. Confirmar a política anterior. |
| R04 — Original válida até aceite | Implementada e validada | U11/U12; E03 | [D:411](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:411>) | E03 confirmou bloqueio do horário original enquanto proposta fica pendente. |
| R05 — Preço/duração originais preservados | Implementada e validada | U11, inclusive duração legada de 50min | [D:436](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:436>) | Reserva fictícia no esquema atual; não há importação da base antiga. |
| R06 — Backend impede conflitos | Implementada e validada | U12: instrutor; E11: agenda do aluno | [D:424](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:424>) | Revalida no aceite. Sem integração de remarcação concorrente. Choque do aluno só é recusado no aceite, não na proposta. |

### Conclusão, avaliações e disputas

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| AV01 — Concluir após término e pagamento | Implementada e validada | U13; I05 e V anteriores | [D:441](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:441>) | Exige também credenciamento válido do instrutor no momento da conclusão. Sem conclusão administrativa por ele. |
| AV02 — Confirmação do aluno não obrigatória | Implementada e validada | U15; U13/I05 concluem sem depender dela | [D:441](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:441>), [D:458](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:458>) | Omissão do aluno não bloqueia conclusão/elegibilidade. |
| AV03 — Avaliações bilaterais | Implementada e validada | U13; I05 e V anteriores | [D:474](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:474>) | Só após aula concluída e paga. |
| AV04 — Uma avaliação por participante/aula | Implementada e validada | U13; I05 anterior | [D:486](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:486>) | ID composto por aula e autor. Sem integração de duas avaliações simultâneas do mesmo autor. |
| AV05 — Contestação até 24h após término | Parcialmente implementada | U14 e I05 anterior: estados normais; E04: exceção | [D:500](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:500>), [UI:682](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:682>) | Só aceita `confirmado`/`concluido`. Após `falta_aluno` ou `falta_instrutor`, contestação é bloqueada mesmo dentro da janela. |
| AV06 — Disputa bloqueia elegibilidade | Implementada e validada | E07 isolou a condição; U14/I05 têm cobertura parcial | [D:458](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:458>), [D:513](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:513>) | U14 consulta elegibilidade de aula ainda não concluída: passaria mesmo sem verificar disputa. I05 só confere a flag. Falta regressão persistente do caso E07. |
| AV07 — Evidências privadas | Implementada e validada | I07 anterior: escrita/leitura/listagem; L da UI | [ST:4](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/storage.rules:4>), [UI:747](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:747>) | Participantes/admin. Upload exige disputa aberta, imagem e tamanho <5MiB. Seletor/renderização não tiveram ensaio visual; faltam testes completos de limites. |
| AV08 — Análise administrativa de disputas | Implementada e validada | U14: resolução; V anterior: suporte; E10: estorno | [D:536](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:536>), [UI:1143](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:1143>) | Sem integração de resolução/estorno. Reabertura e resolução sucessivas podem sobrescrever valor/status anterior de estorno; não há livro financeiro. |

### Credenciamento e segurança

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| S01 — Administrador verifica documentação manualmente | Parcialmente implementada | U03 cobre vencimento; L do cadastro/análise | [D:265](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:265>), [UI:970](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:970>), [UI:1093](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:1093>) | Número, validade, parecer e decisão existem. Sem envio/visualização de documentos de credenciamento. Conferência documental deve ocorrer fora do app; não é comprovada pelo sistema. |
| S02 — Não aprovado não recebe reservas | Implementada e validada | U02/U03; I04 anterior | [D:27](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:27>), [D:63](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:63>) | Cadastro inicia pendente, validade 0 e agenda vazia. |
| S03 — Suspenso não opera normalmente | Implementada e validada | U03; I04 anterior; E09 para aceite/conclusão | [D:27](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:27>), [D:232](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:232>) | Impede reservas, aceite, conclusão e remarcação válida. Perfil, chat, suporte e cancelamento continuam disponíveis. Contato antigo pode ver perfil sem horários. |
| S04 — Sem integração automática fictícia com Detran | Implementada e validada | L: busca de código/configurações e textos explícitos | [UI:1074](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:1074>), [cadastro:105](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/components/auth-screen.tsx:105>) | Ausência de integração confirmada; não é verificação oficial de autorização profissional. |
| S05 — Dados sensíveis com controle de acesso | Parcialmente implementada | U17; I03/I06/I07 anteriores; E06: exposição adicional | [D:115](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:115>), [D:175](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:175>) | Reservas, mensagens, credencial e evidências são filtradas. Porém toda avaliação, inclusive de alunos, com comentário/IDs de autor, destinatário e aula, é enviada a qualquer usuário com perfil. Definir/restringir visibilidade. |
| S06 — Operações críticas validadas no backend | Implementada e validada | U01/U08/U13; I01/I03 anteriores; E09/E10 | [API:24](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js:24>), [D:192](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:192>) | UID/claim vêm do token, não do payload. Suíte não cobre negativamente todos os perfis em todas as operações. |
| S07 — Regras Firestore/Storage adequadas à demonstração | Implementada e validada | I06/I07 anteriores; L do isolamento | [FR:1](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/firestore.rules:1>), [ST:1](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/storage.rules:1>), [emulador:4](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/emulator-db.js:4>) | Firestore nega acesso direto; servidor admin precisa filtrar respostas. Isso não corrige S05. Emuladores em loopback não equivalem a segurança pronta para produção. |

### Funcionalidades complementares

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| F01 — Busca por instrutor/região | Implementada, mas não validada | L; sem teste específico de filtro/resultado | [UI:333](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:333>) | Lista/perfil vistos antes; sem evidência específica de busca por nome/região, acentos, vazio e nenhum resultado. |
| F02 — Favoritos | Implementada e validada | E13; V anterior; sem U/I dedicado | [D:315](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:315>), [UI:258](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:258>) | Domínio adiciona/remove e interface filtra. |
| F03 — Perfil profissional | Implementada e validada | V anterior; L | [UI:246](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:246>), [UI:905](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:905>) | Região, bio/especialidade e avaliações existem. Sem teste automatizado de interface. |
| F04 — Informações do veículo | Implementada e validada | V anterior; L | [D:246](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:246>), [UI:250](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:250>) | Carro e câmbio; não inferir cadastro documental de veículo ou integração oficial. |
| F05 — Chat antes de existir reserva | Ausente | U17 confirma a restrição oposta; L | [D:611](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:611>), [UI:826](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:826>) | Backend exige reserva em comum; UI só lista contatos vindos de reservas. Recuperação exigirá rever autorização e teste, não só adicionar botão. |
| F06 — Tag “Sem agendamento” no chat | Ausente | L; sem cobertura | [UI:821](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:821>) | Sem classificação de conversa sem reserva. |
| F07 — Tag “AGENDADO” no chat | Ausente | L; sem cobertura | [UI:821](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:821>) | Badges de aula não são tags de relacionamento da conversa. |
| F08 — Notificações internas | Ausente | L; sem cobertura | [sessão:137](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/services/session.tsx:137>), [UI:1030](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:1030>) | Polling de 10s, “Alteração salva”, contadores e log administrativo não são notificações com eventos/destinatário/leitura. |
| F09 — Suporte administrativo | Implementada e validada | V anterior: abertura/resolução; L | [D:525](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:525>), [UI:995](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:995>) | Sem U/I dedicado ao suporte genérico, privacidade e decisão dos tickets. |
| F10 — Endereço de encontro com CEP opcional | Parcialmente implementada | Campo livre em V anterior; L | [D:351](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js:351>), [UI:292](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx:292>) | Só `location` livre, opcional, até 300 caracteres. Pode conter CEP digitado no texto, mas não há campo próprio, estrutura ou validação. |

**Contagem:** 44 implementadas e validadas; 1 implementada, mas não validada; 6 parciais; 4 ausentes. A contagem separa itens compostos, como busca/favoritos/perfil e as duas tags; não é percentual da versão perdida.

## O que os testes existentes realmente cobrem

Fontes: [unitários](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/tests/domain.test.cjs:1>) e [integrados](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/tests/emulators.test.cjs:1>).

| Teste unitário | Linha | Cobertura efetiva |
| --- | --- | --- |
| U01 | 50 | UID obrigatório no domínio, cadastro não admite role admin, aluno não aprova instrutor. Não testa login/senha do Firebase. |
| U02 | 67 | Cadastro de instrutor pendente e sem horários. |
| U03 | 75 | Reserva recusada para pendente/vencido/suspenso; aprovação recusada por validade ausente. |
| U04 | 100 | Agenda vazia não gera horário; bloqueio válido impede reserva. |
| U05 | 115 | Dois períodos válidos e recusa de sobreposição. |
| U06 | 136 | 60min, hora cheia, preço/3% armazenados, preço anterior preservado e data além de sete dias recusada. |
| U07 | 160 | Sobreposição sequencial recusada e duração legada preservada. Não é concorrência real. |
| U08 | 169 | Pagamento após aceite, terceiro não aceita reserva, modo simulado e pagamento repetido recusado. |
| U09 | 184 | Cancelamento acima de 2h, exatamente 2h e recusa no início. |
| U10 | 200 | Cancelamento do instrutor integral; contador previamente em 4 gera alerta. Não define relevância nem percorre cinco aulas. |
| U11 | 207 | Proposta do instrutor, recusa de autoaceite, aceite do aluno, original/valor/50min preservados, proposta com 2h recusada. |
| U12 | 232 | Outra reserva ocupa novo horário antes do aceite; recusa remarcação e preserva original. |
| U13 | 251 | Recusa conclusão precoce e avaliação antes da conclusão; avaliações bilaterais e duplicidade. |
| U14 | 269 | Disputa durante aula, recusa antes/depois da janela, resolução com estorno pendente. Bloqueio de elegibilidade não isola a condição de disputa. |
| U15 | 315 | Elegibilidade depois da janela sem confirmação do aluno; campo de transferência inexistente. |
| U16 | 321 | Falta de aluno aos 19/20min, reembolso zero, terceira falta do instrutor/suspensão; avaliações preservadas só com coleção vazia. |
| U17 | 355 | Mensagens/reservas privadas para terceiro, credencial omitida. Exige reserva para mensagem. Não examina `reviews`. |
| U18 | 369 | Aceite expirado e credencial vencendo antes da aula recusados. |
| U19 | 381 | Elegibilidade recusada com estorno integral ou parcial pendente em reserva concluída fictícia. |

| Teste de integração | Linha | Cobertura efetiva |
| --- | --- | --- |
| I01 | 116 | Endpoint anônimo retorna 401; aluno não aprova instrutor. |
| I02 | 126 | Duas chamadas simultâneas pelo mesmo horário: uma aceita, uma recusa; reserva tem 60min/preço/comissão. |
| I03 | 145 | Solicitar/aceitar/simular pagamento; privacidade de reservas, credencial e mensagens; cancelamento de terceiro recusado. |
| I04 | 168 | Fixture alterada para testar pendência, agenda vazia, vencimento e suspensão via endpoint. Não percorre credenciamento completo. |
| I05 | 186 | Aula paga passada concluída pelo endpoint; duas avaliações, duplicidade recusada, disputa e flag inelegível. |
| I06 | 218 | Leitura/escrita direta do Firestore negadas para anônimo, aluno e admin cliente. |
| I07 | 232 | Upload de imagem, leitura instrutor/admin, listagem autorizada, terceiros/anônimo negados, MIME texto e pasta de outro dono negados. Não prova exibição de imagem real. |

**Sem testes persistentes específicos:** filtro de busca; favoritos; edição de perfil/preço pelo endpoint; preservar reservas ao editar agenda; cadastro/renovação/aprovação/rejeição completos; privacidade das avaliações de alunos; pós-falta/contestação; cancelamento relevante; remarcação pelos dois perfis no endpoint e sua concorrência; prazo exatamente +24h; resolução/estorno via endpoint; suporte genérico; todas as combinações de role/operação; limites de foto e disputa encerrada; retorno de suspensão; limites de volume e funcionamento nativo. Alguns foram exercitados somente por E ou V anterior, como discriminado na matriz.

Não há teste automatizado de interface, seletor de fotos ou execução física Android/iOS. TypeScript e build web validam tipos/compilação, não essas regras por si sós.

### Segurança da própria suíte integrada

[I:70](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/tests/emulators.test.cjs:70>) salva o estado; [I:107](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/tests/emulators.test.cjs:107>) substitui `private/state` a cada teste; [I:110](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/tests/emulators.test.cjs:110>) tenta restaurar ao final. Usa o mesmo projeto/portas da demonstração, não uma instância isolada.

Interrupção pode deixar fixture temporária ativa. Cleanup possui ramo de exclusão quando `backup` não foi obtido e não restaura globalmente os espelhos `bookingAccess`/arquivos Storage dos testes. São dados fictícios locais, mas isso não deve ser tratado como banco de testes isolado descartável. Por isso a suíte não foi reexecutada sobre o app aberto.

## Defeitos, diferenças e impacto na apresentação

Não foi identificado bloqueio estrutural de todo o fluxo central já demonstrado. Isso **não** autoriza apresentar todos os itens como recuperados.

| ID | Prioridade | Achado e evidência | Impacto no TCC de 30/10 | Encaminhamento proposto, sem implementação |
| --- | --- | --- | --- | --- |
| D01 | Alta — regra de negócio | E04: admin registra falta aos 20min; aluno não contesta aos 21min, ainda dentro da janela. Backend e UI excluem estados de falta. | Impede demonstrar corretamente falta → contestação. Fluxo feliz de aula realizada funciona. | Definir estados contestáveis e garantir recurso previsto, com regressão. Priorizar antes de afirmar cobertura total de disputas. |
| D02 | Alta — privacidade | E06: terceiro sem reserva recebe comentário/nota de aluno e IDs de aula/participantes em `reviews`. U17/I03 não verificam isso. | Base é fictícia, mas não permite afirmar isolamento completo de perfis/avaliações. Não foi demonstrado vazamento de fotos ou mensagens. | Definir visibilidade de avaliações de alunos e filtrar backend; revisar necessidade de IDs públicos. |
| D03 | Necessária — preparação operacional | Último snapshot documentado: preparado em 19/10, aula futura de 20/10 e histórica já concluída/avaliada. Seed preserva a base, sem renovar ciclos/datas. | Reusar sem novas fixtures em 30/10 impede repetir conclusão/primeira avaliação e perde janela de disputa da aula antiga. | Preparar/ensaiar base fictícia recente perto da banca; separar aula futura de histórica ainda demonstrável. Não alterar relógio para contornar regras. |
| D04 | Média — definição de regra | E05: solicitação não aceita/não paga conta para cinco cancelamentos relevantes. | Alerta pode aparecer antes do esperado no cenário de penalidade; não bloqueia reserva normal. | Definir “relevante” e verificar sequência de cinco aulas do fluxo fictício. |
| D05 | Média — validação | E12: `2026-99-99` é aceita como bloqueio. | Data válida funciona; inválida pode não bloquear sem informar erro. | Validar existência da data e adicionar regressão. |
| D06 | Média — processo de teste | Suíte integrada substitui estado da demonstração e depende de cleanup. | Interrupção perto da banca pode estragar fixtures. | Isolar instância e fortalecer backup/cleanup antes dos ensaios finais. |
| D07 | Lacunas de escopo | Chat pré-reserva, duas tags e notificações ausentes; CEP e documentação no app parciais. | Bloqueiam esses cenários se forem obrigatórios no roteiro. Não impedem o fluxo central. | Decidir escopo antes do acabamento; não anunciar itens como prontos. |
| D08 | Alinhamento | Preço R$ 1–1.000; 168h móveis; aceite de remarcação também limitado a 3h; suspensão retorna após sete dias. | São decisões extras não totalmente especificadas, não falhas necessariamente. | Confirmar política; não mudar silenciosamente nesta auditoria. |
| D09 | Depois da apresentação | Documento agregado: <300 reservas, <2.000 eventos, até 1.500 mensagens e <850KB; sem expiração de solicitações/escalabilidade. | Não bloqueia base pequena ensaiada. Limites atingidos podem recusar operações. | Monitorar fixtures; particionamento/retenção/produção em etapa posterior. |

**Antes da apresentação:** fixtures válidas para a data são indispensáveis. D01/D02 devem ser priorizados para declarar recuperação completa/correta; D04 precisa de definição se penalizações forem exibidas. D07 exige decisão explícita de escopo. Fotos precisam de ensaio visual se forem demonstradas. Escala, automações e expansão de cadastro podem ficar depois, desde que não prometidas à banca.

Pagamentos/repasses reais, integração automática com Detran e acesso a dados reais **não são pendências para este TCC simulado**. Não devem ser adicionados para “completar” a demonstração.

## Verificações adicionais em memória

| ID | Resultado observado nesta auditoria |
| --- | --- |
| E01 | Retirar períodos/bloquear data preserva integralmente reserva anterior. |
| E02 | Edição de perfil altera preço futuro, preservando preço e comissão contratados. |
| E03 | Aluno propõe exatamente 3h antes, original continua bloqueada, instrutor aceita e data muda. |
| E04 | Registro de falta impede contestação dentro da janela — defeito reproduzido. |
| E05 | Cancelamento de solicitação não aceita/não paga eleva contador e gera quinto alerta. |
| E06 | Terceiro sem reservas recebe avaliação de aluno, comentário e identificadores. |
| E07 | Ordem cronológica: concluir, abrir disputa na janela, consultar elegibilidade depois dela. Disputa impede; controle com flag removida é aceito. |
| E08 | Nota/comentário preexistentes ficam iguais após cancelamento e terceira falta. |
| E09 | Instrutor suspenso não aceita nem conclui. |
| E10 | Aluno não conclui estorno; admin altera para `concluido_simulado`. |
| E11 | Aceite recusa choque com aula do aluno em outro instrutor, preservando original. |
| E12 | Bloqueio com data impossível aceito — defeito reproduzido. |
| E13 | Favoritos adicionam e removem instrutor. |

Execuções somente em memória, sem alterar banco, arquivos de teste ou implementação.

## Git e preservação

Árvore limpa **antes da criação deste relatório**: sem alterações staged/unstaged ou arquivos não registrados. `main` está em `23eefb5`, igual à referência local `origin/main`. `recuperacao-tcc` contém exatamente os três commits abaixo após essa referência:

| Commit | Data | Etapa | Resumo do Git |
| --- | --- | --- | --- |
| `da53886` | 19/10/2026 | Recupera backend isolado e regras de negocio com testes | 12 arquivos; +430/−15 |
| `dd102f0` | 19/10/2026 | Reconstrói fluxos dos tres perfis e demonstracao local | 43 arquivos; +10.903/−3.171 |
| `0124992` | 19/10/2026 | Valida MVP nos emuladores e corrige inicializacao no Windows | 22 arquivos; +3.171/−610 |

Comparação com referência remota já existente localmente, sem `fetch`, rede, push ou deploy. Não certifica estado atual do servidor GitHub. Ferramentas, dependências, build e `.emulator-data` são ignorados; árvore limpa não significa que esses dados estejam versionados ou sem mudanças.

**Depois desta auditoria:** somente `docs/AUDITORIA_FINAL_TCC.md` fica novo e não commitado. Três commits e implementação preservados.

