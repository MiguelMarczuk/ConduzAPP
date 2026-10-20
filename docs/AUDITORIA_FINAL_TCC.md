# ConduzAPP — Auditoria final e correções prioritárias do TCC

Atualizado em **19/10/2026 (Brasília)**. Apresentação: **30/10/2026**. Branch: `recuperacao-tcc`.

**Resultado atual: 50 regras implementadas e validadas, 1 implementada sem validação específica, 4 parciais e nenhuma ausente, entre os mesmos 55 itens da auditoria.** Os defeitos de privacidade e contestação após falta foram corrigidos. Chat antes da reserva, tags e notificações internas foram recuperados. A validação nova soma **31 testes unitários e 15 de integração aprovados**, além de TypeScript, build web e conferência manual descrita abaixo.

A auditoria original (44 validadas, 1 sem validação, 6 parciais e 4 ausentes) foi preservada em [AUDITORIA_FINAL_TCC_ANTES_CORRECOES.md](AUDITORIA_FINAL_TCC_ANTES_CORRECOES.md). É um registro histórico do HEAD `0124992`, não a situação atual. Não houve redesign, push, deploy, pagamento real ou migração de produção. A equivalência integral com a versão perdida continua impossível de comprovar sem o código antigo.

## Correções e checkpoints locais

| Commit | Correção | Evidência nova |
| --- | --- | --- |
| `a2ed481` | Privacidade das avaliações no backend, projeção pública mínima e isolamento da base de testes por claim | Autor/destinatário/admin autorizados; terceiro sem comentário/nota privada nem IDs de reserva/autor nas avaliações públicas. Firestore nega leitura direta. |
| `1d1aa6a` | Contestação após falta do aluno ou instrutor no backend e UI | Até término +24h, bloqueio financeiro e valores preservados; decisão exclusiva do admin. |
| `3972d13` | Conversas antes de reserva no serviço existente | Aprovação válida para iniciar, participantes autorizados, histórico antigo e reenvio concorrente com uma mensagem gravada. |
| `9c62b85` | Tags calculadas pelo backend | Solicitação/aceite/confirmada = AGENDADO; sem essas reservas = SEM AGENDAMENTO. |
| `801759b` | Notificações internas | Eventos na mesma transação; acesso/leitura somente pelo destinatário; apresentação com componentes atuais. |
| `cf6e63a` | Preparação reproduzível e isolada do ensaio | Nova base por execução, datas relativas ao servidor, histórico pago ainda concluível, agenda e administração fictícias. |

## Validação realmente executada nesta tarefa

| Verificação | Resultado | Alcance |
| --- | --- | --- |
| Unitários de domínio | **28/28** | `tests/domain.test.cjs`; inclui U20–U28 adicionados nesta tarefa. Sem serviços Firebase. |
| Unitários da preparação | **3/3** | `tests/demo.test.cjs`; cenário em 30/10, renovação de datas, conclusão/avaliações e recusa de conclusão futura. |
| Integração local | **15/15** | `tests/emulators.test.cjs`: Auth, callable Functions, transações Firestore, regras Firestore/Storage, concorrência real e fluxos corrigidos. |
| Autorização | **Aprovada na integração** | Anônimo, terceiro, aluno, instrutor, admin, avaliações privadas, mensagens, notificações, evidências e tentativa de trocar ambiente pelo payload. |
| TypeScript | **Sem erros; saída 0** | `tsc --noEmit` executado nesta tarefa. |
| Build web | **Aprovado; saída 0, 23 rotas** | `expo export --platform web`, artefato local em `dist`. |
| Navegador | **Ensaio manual** | Três perfis; agenda preparada; conclusão histórica; avaliações bilaterais; chat anterior à reserva futura; tags; solicitação/aceite/pagamento simulado; horário bloqueado; avisos e leitura; painel administrativo. Não é teste E2E automatizado. |

A execução de `scripts/Verificar.ps1` passou com 30 unitários e 14 integrações. Depois foram acrescentadas duas regressões para condições já apontadas na auditoria: bloqueio de elegibilidade isolado com controle positivo e tentativa de trocar cenário pelo payload, além da asserção de preservação de `private/state`. A execução final das suítes passou com **31 e 15**, respectivamente. Nenhum código de aplicação mudou depois do TypeScript/build aprovados. Registros locais: `.tools/validacao-final.log` e `.tools/integracao-final.log`. Resultados anteriores de 19+7 são históricos e não entram nessa soma.

U01–U19/I01–I07 identificam os testes originais, todos reexecutados. U17 foi atualizado para a nova autorização de conversa. **V histórico** e **E01–E13** continuam sendo evidências anteriores, não novas execuções. D = domínio; UI = painel; API = Function; FR/ST = regras. Os links da matriz apontam os arquivos atuais; os números de linha antigos permanecem só no relatório histórico.

## Matriz de regras

### Agendamentos

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| A01 — Novas aulas de 60 minutos | Implementada e validada | U06; I02 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Sem migração da base antiga; preservação de duração é verificada no modelo atual. |
| A02 — Início em horas cheias | Implementada e validada | U06 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Sem integração específica de minutos/segundos inválidos. |
| A03 — Disponibilidade semanal do instrutor | Implementada e validada | U02/U04/U05; I04 e V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Sem períodos, não há horários. |
| A04 — Vários períodos no mesmo dia | Implementada e validada | U05; V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Limite adicional de 28 períodos não constava do requisito. |
| A05 — Bloqueios de datas específicas | Parcialmente implementada | U04 para data válida; E12 para falha | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Datas válidas bloqueiam; `2026-99-99` também é aceita e não bloqueia nada. Falta validar existência da data. |
| A06 — Próximos sete dias | Implementada e validada | U06; V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Janela móvel de 168h, incluindo hoje. Confirmar se eram esperados sete dias de calendário completos. |
| A07 — Reserva bloqueia horário | Implementada e validada | U07; I02/I03 e V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Solicitação não paga também ocupa horário; não há expiração automática. |
| A08 — Proteção contra concorrência | Implementada e validada | I02: duas chamadas simultâneas, uma aceita | [API](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js>), [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Transação serializa documento agregado; não é arquitetura dimensionada para produção. |
| A09 — Alterar disponibilidade preserva aulas anteriores | Implementada e validada | E01; sem teste persistente dedicado | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Retirar períodos ou adicionar bloqueio não modifica a reserva existente. |

### Preços e pagamentos

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| P01 — Instrutor define preço | Implementada e validada | E02 via `profile`; sem U/I dedicado à edição | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Backend impõe R$ 1–1.000. Piso/teto não constavam da lista esperada. |
| P02 — Preço congelado na reserva | Implementada e validada | U06; E02 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | U06 modifica perfil diretamente; E02 confirmou também pela operação do domínio. |
| P03 — Comissão de 3% no backend | Implementada e validada | U06; I02 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Centavos com arredondamento inteiro; não representa liquidação financeira. |
| P04 — Aceite gera aguardando pagamento | Implementada e validada | U08; I03 e V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Aceite expirado é recusado, coberto por U18. |
| P05 — Só pagamento validado confirma aula | Implementada e validada | U08; I03 e V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Validação exclusivamente simulada: aluno participante aciona backend após aceite. Sem webhook ou validação financeira real. |
| P06 — Simulação separada de pagamentos reais | Implementada e validada | U08; L; rótulos em V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [API](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js>) | Separação por ambiente emulado e ausência de integração real. Não existe adaptador real recuperado do Mercado Pago; isso não impede a simulação do TCC. |
| P07 — Elegibilidade não é transferência | Implementada e validada | U15/U19; E07 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Apenas flag, consultada explicitamente após a janela; nenhum dinheiro transferido. |

### Cancelamentos e faltas

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| CF01 — Aluno, mais de 2h: 100% | Implementada e validada | U09 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Registra estorno simulado pendente, sem devolução real. |
| CF02 — Até 2h, antes do início: 50% | Implementada e validada | U09: exatamente 2h e recusa no início | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Sem integração específica da política. |
| CF03 — No-show do aluno: sem reembolso | Implementada e validada | U16 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Confirmação administrativa, sem detecção automática. Ver contestação após falta. |
| CF04 — Instrutor cancela: reembolso integral | Implementada e validada | U10 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | E10 confirmou conclusão de estorno simulado exclusiva do admin. |
| CF05 — Tolerância de 20 minutos | Implementada e validada | U16: 19 e 20min | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Falta a partir de 20min, por decisão manual; sem check-in/geolocalização. |
| CF06 — Cinco cancelamentos relevantes: alerta | Parcialmente implementada | U10; E05 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Conta todo cancelamento do instrutor, inclusive solicitação não aceita/não paga. “Relevante” não é filtrado. Alerta é flag no painel, sem notificação interna. |
| CF07 — Três faltas administrativas: suspensão temporária | Implementada e validada | U16; E09; I04 para bloqueio | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Sete dias e alerta. Teste parte do contador 2, não percorre três aulas. Retorno após prazo é automático, sem nova análise obrigatória. |
| CF08 — Penalização não altera estrelas | Implementada e validada | E08 com avaliação preexistente; U16 é fraco neste ponto | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | U16 compara avaliações inicialmente vazias. E08 verificou nota/comentário preexistentes. |

### Remarcação

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| R01 — Ambos participantes podem propor | Implementada e validada | U11: instrutor; E03: aluno | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Sem integração ou visual específico de remarcação. |
| R02 — Aceite da outra parte | Implementada e validada | U11; E03 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Proponente não aceita a própria proposta. |
| R03 — Solicitação até três horas antes | Implementada e validada | U11 recusa 2h; E03 aceita exatamente 3h | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Restrições extras: aceite também antes do limite e novo horário com 3h de antecedência. Confirmar a política anterior. |
| R04 — Original válida até aceite | Implementada e validada | U11/U12; E03 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | E03 confirmou bloqueio do horário original enquanto proposta fica pendente. |
| R05 — Preço/duração originais preservados | Implementada e validada | U11, inclusive duração legada de 50min | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Reserva fictícia no esquema atual; não há importação da base antiga. |
| R06 — Backend impede conflitos | Implementada e validada | U12: instrutor; E11: agenda do aluno | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Revalida no aceite. Sem integração de remarcação concorrente. Choque do aluno só é recusado no aceite, não na proposta. |

### Conclusão, avaliações e disputas

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| AV01 — Concluir após término e pagamento | Implementada e validada | U13; I05 e V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Exige também credenciamento válido do instrutor no momento da conclusão. Sem conclusão administrativa por ele. |
| AV02 — Confirmação do aluno não obrigatória | Implementada e validada | U15; U13/I05 concluem sem depender dela | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Omissão do aluno não bloqueia conclusão/elegibilidade. |
| AV03 — Avaliações bilaterais | Implementada e validada | U13; I05 e V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Só após aula concluída e paga. |
| AV04 — Uma avaliação por participante/aula | Implementada e validada | U13; I05 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | ID composto por aula e autor. Sem integração de duas avaliações simultâneas do mesmo autor. |
| AV05 — Contestação até 24h após término | Implementada e validada | U14/U22; I05/I09 atuais; UI conferida por código | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Estados confirmado, concluido, falta_aluno e falta_instrutor aceitam contestação até término +24h, inclusive no limite. Abrir não altera pagamentos/estornos. |
| AV06 — Disputa bloqueia elegibilidade | Implementada e validada | U22/U28; I09 atual | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Flag bloqueada ao abrir disputa. U28 isola a condição com controle sem disputa em aula concluída após a janela. |
| AV07 — Evidências privadas | Implementada e validada | I07: escrita/leitura/listagem; L da UI | [ST](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/storage.rules>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Participantes/admin. Upload exige disputa aberta, imagem e tamanho <5MiB. Seletor/renderização não tiveram ensaio visual; faltam testes completos de limites. |
| AV08 — Análise administrativa de disputas | Implementada e validada | U14/U22; I09/I14 atuais; V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Admin decide expressamente. Abertura de contestação não movimenta valores. Estorno continua somente simulado; não existe livro financeiro de produção. |

### Credenciamento e segurança

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| S01 — Administrador verifica documentação manualmente | Parcialmente implementada | U03 cobre vencimento; L do cadastro/análise | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Número, validade, parecer e decisão existem. Sem envio/visualização de documentos de credenciamento. Conferência documental deve ocorrer fora do app; não é comprovada pelo sistema. |
| S02 — Não aprovado não recebe reservas | Implementada e validada | U02/U03; I04 | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Cadastro inicia pendente, validade 0 e agenda vazia. |
| S03 — Suspenso não opera normalmente | Implementada e validada | U03; I04; E09 para aceite/conclusão | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | Impede reservas, aceite, conclusão e remarcação válida. Perfil, chat, suporte e cancelamento continuam disponíveis. Contato antigo pode ver perfil sem horários. |
| S04 — Sem integração automática fictícia com Detran | Implementada e validada | L: busca de código/configurações e textos explícitos | [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>), [cadastro](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/components/auth-screen.tsx>) | Ausência de integração confirmada; não é verificação oficial de autorização profissional. |
| S05 — Dados sensíveis com controle de acesso | Implementada e validada | U17/U20/U23/U24/U27; I03/I06/I07/I08/I10/I13 atuais | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [API](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js>), [FR](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/firestore.rules>), [ST](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/storage.rules>) | Avaliação de aluno só para autor, destinatário e admin. Avaliação pública de instrutor omite autor/reserva e usa ID opaco para terceiros. Não substitui auditoria de produção. |
| S06 — Operações críticas validadas no backend | Implementada e validada | U01/U08/U13; I01/I03; E09/E10 | [API](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js>), [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>) | UID/claim vêm do token, não do payload. Suíte não cobre negativamente todos os perfis em todas as operações. |
| S07 — Regras Firestore/Storage adequadas à demonstração | Implementada e validada | I06/I07/I08/I15 atuais | [FR](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/firestore.rules>), [ST](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/storage.rules>), [API](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/index.js>) | Firestore continua negando todo acesso direto, inclusive avaliações e cenários isolados. Storage preservado e revalidado. Apenas emuladores locais. |

### Funcionalidades complementares

| Regra | Implementada | Testada | Arquivos responsáveis | Pendência |
| ----- | ------------ | ------- | --------------------- | --------- |
| F01 — Busca por instrutor/região | Implementada, mas não validada | L; sem teste específico de filtro/resultado | [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Lista/perfil vistos antes; sem evidência específica de busca por nome/região, acentos, vazio e nenhum resultado. |
| F02 — Favoritos | Implementada e validada | E13; V histórico; sem U/I dedicado | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Domínio adiciona/remove e interface filtra. |
| F03 — Perfil profissional | Implementada e validada | V histórico; L | [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Região, bio/especialidade e avaliações existem. Sem teste automatizado de interface. |
| F04 — Informações do veículo | Implementada e validada | V histórico; L | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Carro e câmbio; não inferir cadastro documental de veículo ou integração oficial. |
| F05 — Chat antes de existir reserva | Implementada e validada | U23/U24/U25; I10/I11/I14 atuais; V atual | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>), [sessão](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/services/session.tsx>) | Aluno inicia com instrutor aprovado/válido/não suspenso. Mesmo serviço messages, histórico legado, ACL de participantes e deduplicação por remetente/requestId. Atualização pelo polling existente de 10s. |
| F06 — Tag “Sem agendamento” no chat | Implementada e validada | U26; I12/I14 atuais; V atual | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | SEM AGENDAMENTO quando não há solicitado, aguardando_pagamento ou confirmado entre o par. Conclusões/cancelamentos/faltas não contam. |
| F07 — Tag “AGENDADO” no chat | Implementada e validada | U26; I12/I14 atuais; V atual | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | AGENDADO já na solicitação, independentemente do pagamento. Backend deriva do estado atual; não é editável pelo cliente. |
| F08 — Notificações internas | Implementada e validada | U27; I13/I14 atuais; V atual | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>), [sessão](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/services/session.tsx>) | Eventos persistidos na mesma transação, com destinatário e leitura autorizada. Solicitação, aceite, confirmação, cancelamento, remarcação, conclusão e ocorrências. Sem push; polling de 10s. |
| F09 — Suporte administrativo | Implementada e validada | I14 atual; V histórico | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Cenário fictício inclui suporte aberto e decisão administrativa exercitada pelo endpoint. Sem envio de mensagens externas. |
| F10 — Endereço de encontro com CEP opcional | Parcialmente implementada | Campo livre em V histórico; L | [D](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/functions/domain.js>), [UI](<C:/Users/cleyd/OneDrive/Documentos/ChatGPT/tcc 2/ConduzAPP/src/app/painel.tsx>) | Só `location` livre, opcional, até 300 caracteres. Pode conter CEP digitado no texto, mas não há campo próprio, estrutura ou validação. |


**Contagem atual:** 50 implementadas e validadas; 1 implementada, mas não validada; 4 parciais; 0 ausentes.

## Cobertura nova dos fluxos corrigidos

| Testes | O que comprovam |
| --- | --- |
| U20 / I08 | Aluno e autor veem a avaliação privada; admin pode analisar; terceiro não recebe esses dados. Avaliação pública do instrutor permanece acessível e omite vínculo privado. Leitura direta de avaliações/estado no Firestore é recusada. |
| U21 / I15 | Documento do cenário vem de claim provisionada pelo Admin SDK local. Payload de cliente não escolhe ambiente. |
| U22 / I09 | Falta registrada de ambas as partes seguida de contestação; até o limite exato de 24h no unitário; prazo vencido/terceiro recusados; pagamento, preço, comissão e estorno não mudam na abertura; admin resolve explicitamente. |
| U23–U25 / I10–I11 | Chat sem reserva, aprovação exigida, instrutor aguarda contato inicial, histórico legado e ACL. Dois envios simultâneos com mesma chave gravam uma mensagem; mesma chave com conteúdo diferente é recusada. |
| U26 / I12 | Tag por par e estados, incluindo várias reservas, pendência sem pagamento, cancelamento e conclusão. |
| U27 / I13 | Eventos essenciais persistidos; destinatário lê/marca; terceiro não acessa; operação recusada não gera aviso. |
| U28 | Aula concluída com disputa recusa elegibilidade depois da janela; a mesma aula sem disputa permite. Evita o falso positivo de testar apenas um status já inelegível. |
| 3 testes de demo / I14 | Mesma fábrica utilizada pelo script; autenticação, agenda/slots, conversa, reserva/aceite/pagamento, conflito, conclusão passada, avaliação bilateral e suporte administrativo. |

Não existe suíte automatizada de interface, teste em aparelho Android/iOS ou validação visual nova do seletor/renderização de fotos. As regras de fotos foram efetivamente executadas na integração. Continuam sem cobertura dedicada completa, entre outros: filtros de busca, limites de foto/volume, retorno de suspensão e todas as combinações de perfil/operação.

## Preparação segura da demonstração

Execute `Iniciar-ConduzAPP.ps1` e depois `Preparar-Demonstracao.ps1`. Cada preparação cria `private/demo-<UUID>` e seleciona esse cenário nas três contas fictícias. A base `private/state` e ensaios anteriores não são sobrescritos. Endereços e projeto são fixos nos emuladores; o backend recusa execução fora desse ambiente. A claim não é fornecida pelo frontend. IDs de aulas históricas são próprios de cada cenário, inclusive nos espelhos de acesso a evidências.

**Saia e entre novamente após preparar**, pois sessões antigas podem manter o token/ambiente anterior. O manifesto local fica em `.tools/demo-current.json`. Execute novamente no dia **30/10**, pois a aula histórica precisa estar dentro da janela recente e ainda sem avaliações. Não há relógio fictício na aplicação nem botão para concluir aula futura: só o script local cria o histórico de demonstração. A API continua usando `Date.now()` do servidor.

O cenário contém três contas, instrutor aprovado, 14 períodos semanais, horários futuros livres, uma aula histórica paga/confirmada ainda não concluída, suporte aberto e instrutor fictício pendente para análise administrativa. **Conclua a aula histórica primeiro** para exibir SEM AGENDAMENTO antes da primeira reserva futura; enquanto ela estiver confirmada, ela também conta como AGENDADO, conforme a regra por estado. Roteiro completo em [DEMONSTRACAO.md](DEMONSTRACAO.md).

Testes criam contas com claim `test-<UUID>`, usam documento próprio e removem apenas seus registros temporários/espelhos conhecidos. O hook final verifica que `private/state` permaneceu idêntico, sem restaurá-lo ou sobrescrevê-lo. Arquivos de imagem de teste podem permanecer no Storage local com nomes exclusivos; não se misturam ao histórico das contas da apresentação.

## Pendências e impacto em 30/10

**Não foi encontrado bloqueio restante no roteiro solicitado e ensaiado.** Isso vale para demonstração local com dados fictícios, não para uso em produção.

| Pendência | Impacto | Encaminhamento |
| --- | --- | --- |
| Datas inválidas aceitas como bloqueio (A05 / D05 original) | Data impossível não bloqueia a agenda. Datas válidas funcionam. | Fora das correções solicitadas; usar datas válidas no roteiro. |
| “Cancelamentos relevantes” ainda conta toda desistência do instrutor (CF06 / D04) | Pode antecipar alerta em cenário de penalidades. | Definir relevância antes de alterar regra já existente. Não compromete o fluxo central da banca. |
| Documentos de credenciamento sem upload/visualização no app (S01) | A demonstração mostra número, validade, parecer e aprovação manual. | Não apresentar como verificação documental automática/completa. |
| Endereço livre, sem campo estruturado de CEP (F10) | Endereço sem CEP funciona; não existe consulta postal. | Pode ficar depois da apresentação. |
| Busca sem teste dedicado (F01) | Implementação mantida, sem validação específica nova de filtros. | Ensaio adicional se esse detalhe for cobrado. |
| Fotos: seletor/renderização não ensaiados visualmente | Regras aprovadas; não prova o seletor no dispositivo da banca. | Ensaiar antes se for mostrar anexos; não bloqueia os 12 itens pedidos. |
| Android/iOS e produção | Apenas execução web conferida. Documento agregado tem limites de demonstração. | Adiar escala, produção, push e integrações financeiras. |

**Cuidados que podem comprometer a apresentação:** esquecer de iniciar emuladores; reaproveitar histórico consumido/antigo; não sair/entrar após preparar novo cenário; esperar atualização instantânea, pois a arquitetura existente consulta a cada 10s (ou pelo botão Atualizar). Preparação nova e roteiro ensaiado resolvem os dois primeiros sem apagar a base antiga ou alterar o relógio.

## Arquivos alterados e preservação do Git

- Backend/acesso: `functions/domain.js`, `functions/index.js`, novo `functions/state-scope.js`, comentário explicativo em `firestore.rules`. As permissões do Firestore continuam negadas por padrão; `storage.rules` foi preservado e revalidado.
- Interface/sessão: `src/app/painel.tsx`, `src/services/session.tsx`. Mesmo layout e componentes, acrescentando os controles das funcionalidades solicitadas.
- Testes: `tests/domain.test.cjs`, `tests/emulators.test.cjs`, novo `tests/demo.test.cjs`.
- Preparação/verificação: `Preparar-Demonstracao.ps1`, `scripts/demo-fixture.cjs`, `scripts/prepare-demo.cjs`, `scripts/Verificar.ps1`, `package.json`.
- Documentação: este relatório, cópia histórica da auditoria, `README.md`, `docs/DEMONSTRACAO.md`, `docs/VALIDACAO.md` e três capturas do ensaio: `chat-sem-agendamento.png`, `chat-agendado.png`, `notificacoes-internas.png`.

Os commits originais **da53886, dd102f0 e 0124992** permanecem ancestrais da branch. As seis correções/preparações têm commits locais separados, listados acima; documentação/resultado final é um checkpoint adicional. Nenhum push, deploy, rebase ou alteração da branch main foi realizado. Ferramentas, logs, dados exportados e build continuam ignorados pelo Git.
