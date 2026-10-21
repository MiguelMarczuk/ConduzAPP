# Implementações urgentes para 30/10/2026

**Adendo de 21/10 — fotos:** após relato de falha, foram reproduzidos Firebase desligado e ausência de acesso à foto em Editar perfil. O fluxo foi corrigido e comprovado com JPEG fotográfico real nos dois perfis pendentes, incluindo recarga, logout/login e conferência de bytes/referência. Resultado novo: **52 unitários, 24 integrações, TypeScript e build aprovados**. Evidências e causa detalhada em [CORRECAO_FOTOS_PERFIL.md](CORRECAO_FOTOS_PERFIL.md). As etapas A–E abaixo permanecem como registro anterior, com seus próprios resultados.

Branch `recuperacao-tcc`. Execução em etapas, somente emuladores, sem push/deploy.

## Etapa A — Fotos, identidade e autenticação

- Imagens JPEG/PNG/WebP até 5 MiB (limite estrito menor que 5 MiB), seleção da galeria, prévia, envio e mensagens de falha; dados persistidos no Storage existente.
- Fotos em caminhos por ambiente e proprietário. Publicação da referência somente após validação de caminho, tamanho, MIME e assinatura binária no servidor. Substituição cria um arquivo novo e troca a referência; arquivos publicados são imutáveis pelo cliente.
- Foto obrigatória dos dois participantes na confirmação pelo pagamento simulado. Remover a referência é proibido com aulas solicitadas, aceitas ou confirmadas ainda ativas. Aulas antigas não são apagadas/canceladas; contas antigas sem identidade aprovada entram na regularização, com suporte e operações de cancelamento/contestação preservadas no backend.
- Documento fictício privado: somente proprietário e admin com claim autorizada no mesmo ambiente. A referência do documento não entra nas projeções de outros usuários. Sem URLs públicas permanentes, reconhecimento facial ou serviços oficiais.
- Decisão manual com parecer, responsável, horário, histórico e notificação ao destinatário. Aprovação de identidade não aprova credenciamento profissional. Trocar foto com documento já enviado solicita nova comparação manual, preservando a imagem anterior até o upload terminar. Admin não pode decidir sobre uma versão diferente da que abriu.
- Contas pendentes acessam regularização, perfil, credenciamento e suporte; operações restritas são recusadas no backend. A interface também restringe a navegação.
- Erros de autenticação em português; credencial incorreta, usuário inexistente e conta desativada compartilham a mesma mensagem no login. Cadastro mantém erro específico de e-mail já utilizado.
- Ilustrações próprias em `assets/demo/`, sem pessoas ou documentos reais. Preparação de demonstração cria novo cenário e carrega as fotos fictícias nos emuladores, preservando os anteriores.

Validação da etapa: **37 unitários, 17 integrações/autorização e TypeScript aprovados**. Integração inclui upload real no Storage Emulator, persistência via callable, recusa de overwrite/delete, documento privado contra terceiros/anônimos/outro ambiente, análise e notificação. As primeiras tentativas detectaram diferença de bucket e condição de sobrescrita no emulador; foram corrigidas e a suíte completa passou. Logs `.tools/urgente-a-*` são locais e ignorados.

Conferência manual parcial: login vazio, foto após novo login, abertura da galeria e prévia de documento fictício. Fluxo administrativo e capturas finais serão registrados na etapa E.

## Decisões financeiras preservadas

Não aplicar perda de 100% faltando uma hora, multas ou transferências. Permanecem os percentuais existentes. Para duas aulas relacionadas, cada aula continuará sendo uma contratação de 60 minutos com preço individual e política existente; não será criada política de pacote, desconto ou penalidade nova.

## Etapa B — Comunicação, navegação, busca, filtros e CEP

- Contador de recebidas não lidas calculado no backend. Leitura por IDs da conversa aberta, somente pelo destinatário, com horário persistente e idempotência. Conversa ocupa sua própria área e volta à lista; o app solicita leitura somente em primeiro plano. Reenvio continua com o identificador idempotente existente.
- Marca acessível retorna ao início apropriado ao perfil e limpa seleções locais sem alterar autenticação. Conta pendente retorna à regularização.
- Lista completa separada da busca de aulas avulsas. Apenas perfis com `eligible` calculado pelo servidor aparecem como aptos; inclui identidade, foto, credenciamento, validade e suspensão. Destaques dependem de flag real; se não houver destaque, o título é “Instrutores disponíveis”, sem dados inventados.
- Filtros usam status reais; disputa é a flag `disputeOpen`, não um novo status. Contagens derivadas somente das reservas autorizadas recebidas pelo usuário.
- Endereço estruturado validado no backend: rua, número (incluindo s/n), bairro, cidade e UF. CEP opcional. Local de reservas antigas continua legível. Novas solicitações exigem os campos estruturados.
- ViaCEP usa oito dígitos e JSON, conforme [documentação oficial](https://viacep.com.br/). Timeout, CEP ausente e erro de rede preservam preenchimento manual; resposta antiga não sobrescreve edições feitas durante a consulta.

Validação: **42 unitários, 18 integrações/autorização e TypeScript aprovados**. Inclui contagem/leitura persistente, terceiro recusado, idempotência, busca elegível, filtros, endereço, CEP válido/inexistente/offline com respostas controladas. Teste de `homeTab` é unitário; navegação real será conferida no navegador, não confundida com teste de interface.

## Etapa C — Solicitação de duas aulas

Duas reservas relacionadas (`groupId`), cada uma de 60 minutos e com início próprio, criadas na mesma transação agregada. Uma falha no segundo horário descarta a operação inteira. Backend valida contiguidade, mesma data, disponibilidade, autorização e conflitos dos dois participantes. Preço por aula congelado, soma de dois preços individuais; comissão continua arredondada a centavos por aula conforme a regra existente.

Aceites individuais; pagamento simulado conjunto dos itens aceitos e ainda não pagos. O backend recusa pagamento do par enquanto houver item aguardando aceite. UI informa duração total, total contratado e valor realmente pendente. Cancelamento, remarcação, conclusão, contestação e avaliação continuam por aula; cancelar uma não cancela automaticamente a outra. Sem desconto ou política financeira de pacote. Qualquer pacote comercial com cancelamento parcial, multa ou regras diferentes continua pendente de decisão explícita.

Validação: **45 unitários, 20 integrações e TypeScript aprovados**. Inclui concorrência real no segundo horário, atomicidade, soma de preço/comissão, pagamento conjunto e cancelamento individual preservando a outra aula. O ensaio integrado usa 09h do dia seguinte para não depender de a hora real do teste atravessar a meia-noite; o backend recusa essa travessia no par.

## Etapa D — Confirmação de início

Código aleatório de oito dígitos gerado com `crypto.randomInt`, hash com salt, vínculo por aula, prazo inclusivo do início até +10 minutos, cinco tentativas e confirmação idempotente. Falhas contam na mesma transação e retornam mensagem sem perder a gravação do contador. Instrutor/admin recebem apenas situação e horários; somente o aluno participante recebe o código durante a janela. Segredo/hash/salt não entram nas outras projeções, notificações ou auditoria. Após confirmar, o segredo deixa de ser armazenado. Firestore continua recusando leitura direta.

Notificações e expiração são materializadas no próximo acesso ao servidor; o aplicativo aberto consulta o estado a cada dez segundos. Não há scheduler ou push. Ausência de código não gera falta, multa, cancelamento, reembolso ou transferência. Conclusão continua exigindo término e pagamento. Para novas aulas com confirmação obrigatória, início pendente/expirado bloqueia elegibilidade para repasse; decisão sobre liberação após análise e penalidades continua pendente, sem automatismo. Aulas legadas não recebem retroativamente essa obrigação.

Tolerância de 20 minutos para falta do aluno preservada como decisão administrativa separada. O código de início não substitui conclusão, confirmação facultativa do aluno ou análise de disputa.

Relógio de ensaio: somente admin com claim `demo-*`, cenário correspondente e `FUNCTIONS_EMULATOR=true`. Avança para início, após dez minutos ou término de uma aula do próprio cenário, limitado a sete dias, com botão de restauração e aviso visível. Payload de tempo comum é ignorado e ambientes `test-*`/produção não recebem o deslocamento. Não altera o relógio do computador.

Validação: **51 unitários, 22 integrações/autorização e TypeScript aprovados**. Código exclusivo do aluno, terceiros recusados, tentativas persistentes, limite, expiração sem mudanças financeiras, idempotência, fronteira exata de dez minutos, reutilização entre aulas recusada, controle positivo de elegibilidade após início confirmado e recusa de relógio em cenário comum. Fixtures dos testes financeiros antigos identificam explicitamente aulas legadas; a nova regra tem testes positivos e negativos próprios.

## Etapa E — Revisão final e resultado

As doze prioridades foram implementadas para a demonstração web local. Os limites abaixo são explícitos: validação em Android/iOS fica para a etapa separada solicitada; não foram criadas multas, pacote comercial, biometria, push ou processamento bancário.

Revisão final acrescentou decodificação efetiva das imagens no servidor, além de assinatura/MIME/tamanho. Um cabeçalho PNG isolado ou imagem incompleta é recusado. Limite de 25 megapixels no decoder; biblioteca `sharp` no backend e lockfile atualizados, conforme [API oficial](https://sharp.pixelplumbing.com/api-constructor/). A imagem só passa a ser referência pública do perfil após essa validação; os documentos continuam privados. Falha preserva a referência anterior.

Também foram ajustados textos de identidade e início, destino “Ver perfil” da notificação de identidade, estado vazio dos filtros e ausência de aviso de “Alteração salva” na leitura automática de mensagens. O rótulo inferior foi ajustado para caber inteiro em 320px. Os arquivos novos foram formatados sem mudar as regras já aprovadas. O verificador padrão agora inclui `tests/features.test.cjs`.

### Validação final executada

| Verificação | Resultado | Natureza/limite |
| --- | --- | --- |
| `npm test` | **52/52 aprovados** | Domínio puro, preparação e helpers de apresentação/CEP. Helpers TypeScript são carregados por transpilação; isso não é teste de renderização. |
| `npm run test:emulators` | **23/23 aprovados** | Auth, callable Functions, transações Firestore e regras Firestore/Storage reais nos emuladores. Inclui autorização negativa, fotos de ambos os perfis, documentos privados, concorrência, duas aulas e código. |
| `npm run typecheck` | **Aprovado, sem erros** | Verificação estática; não substitui ensaio de tela. |
| `npm run build:web` | **Aprovado, 23 rotas** | Exportação Expo web local, sem deploy. |
| Navegador | **Ensaio manual aprovado nos fluxos descritos abaixo** | Larguras 425px e 320px; não é suíte E2E automatizada nem prova de Android/iOS físico. |

Resultados são desta tarefa; não foram somados aos 31 unitários/15 integrações históricos. Logs locais ignorados: `.tools/urgente-final-unit.log`, `.tools/urgente-final-types.log`, `.tools/urgente-final-integracao.log`, `.tools/urgente-final-build.log` e `.tools/urgente-verificar-final.log`.

### Cobertura das prioridades

| Prioridade | Evidência automatizada | Conferência manual / situação |
| --- | --- | --- |
| Fotos | Unitários de recibo/decodificação, substituição, bloqueio de remoção e pagamento sem fotos; integrações de upload e persistência para aluno e instrutor, ACL e imutabilidade. | Galeria, prévia, upload do aluno, logout/login e remoção recusada com aula ativa. Upload do instrutor validado pela integração, não por um segundo ensaio visual. |
| Identidade | Envio, aprovação/rejeição, auditoria, notificação, conta pendente, separação do credenciamento; Storage nega terceiros/anônimos/outro ambiente. | Documento fictício enviado, navegação restrita, admin compara imagens e aprova com parecer/horário; aluno recebe decisão. Rejeição validada no backend, não clicada no ensaio visual. |
| Não lidas | Recebidas somente, leitura pelo destinatário, persistência, idempotência e terceiro recusado. | Badge 1 → 0 ao abrir a conversa em ambos os perfis; abrir apenas a lista não marca leitura. |
| Logo | Helper de destino por papel/pendência. | Retorno à Home de aluno, instrutor e admin, sem logout. |
| Autenticação | Mensagens por código/validação; login não diferencia usuário inexistente, senha errada e desativado. | Formulário vazio mostra mensagem em português. Demais erros exercitados como helpers, sem alegar testes visuais de cada falha de rede. Recuperação preservada. |
| Uma/duas aulas | Duração, contiguidade, mesma data, disponibilidade, atomicidade, concorrência real no segundo horário, preço/comissão e pagamento conjunto. | 09h–11h, 120min, R$170; dois aceites individuais, pagamento simulado único e duas confirmações. |
| Instrutores | Elegibilidade de identidade/foto/credencial/validade/suspensão e lista completa/destaques. | Lista completa distinta; sem profissionais artificiais para preencher lista. |
| Cancelamentos | Fronteiras financeiras, alerta, faltas e cancelamento individual do grupo. | Auditoria em [AUDITORIA_CANCELAMENTOS_TCC.md](AUDITORIA_CANCELAMENTOS_TCC.md); nenhuma regra financeira nova. |
| Filtros | Estados e disputa por flag, contagens. | Pendentes, aguardando pagamento e confirmadas acompanhando alterações; filtro vazio e navegação conferidos em 320px. |
| CEP | Validação no backend, s/n/CEP opcional, respostas controladas de sucesso/erro/offline. | Consulta real ao ViaCEP; depois dados substituídos por endereço fictício sem CEP e reserva realizada. |
| Código de início | RNG, projeções privadas, tentativas persistentes/limite, fronteira de 10min, expiração, idempotência, código de outra aula recusado, ACL e elegibilidade positiva/negativa. | Relógio admin no início; código errado recusado, correto confirmado; conclusão antecipada recusada e posterior ao término aceita. Segunda aula expirada sem falta/cancelamento/alteração financeira; relógio restaurado. |
| Design/Expo | TypeScript e build. | Azul/branco preservados, rolagem e navegação inferior em larguras estreitas. Aparelhos e permissões nativas ainda pendentes. |

O ensaio também conferiu avaliação do aluno pelo instrutor após conclusão e as notificações internas. Nenhum código válido foi incluído nas capturas ou nesta documentação. Os códigos usados no ensaio foram consumidos/expirados; documentos e avatares são ilustrações fictícias próprias.

### Capturas

Em [visual/implementacoes/](visual/implementacoes/), 16 capturas com índice explicativo. Elas documentam diferentes momentos do ensaio; as capturas de etapas A–D podem apresentar textos anteriores aos últimos ajustes da etapa E. Incluem estado pendente/aprovado, comparação administrativa, não lidas, duas aulas, confirmação/expiração, filtros e tela de 320px. Não há código ativo capturado. O ZIP de entrega contém apenas essas imagens e seu índice, sem dados dos emuladores.

### Arquivos criados e alterados desde `70720eb`

- **Novos módulos de backend:** `functions/identity.js`, `functions/media.js`, `functions/address.js`, `functions/start-code.js`.
- **Backend existente e regras:** `functions/domain.js`, `functions/index.js`, `functions/state-scope.js`, `functions/package.json`, `functions/package-lock.json`, `storage.rules`. Firestore continua negando acesso direto; `firestore.rules` não precisou ser alterado.
- **Novos componentes/helpers:** `src/components/identity-panel.tsx`, `stored-image.tsx`, `address-form.tsx`, `start-confirmation.tsx`; `src/lib/presentation.ts`, `src/lib/cep.ts`.
- **Interface/sessão:** `src/app/painel.tsx`, `src/components/auth-screen.tsx`, `src/components/ui/avatar.tsx`, `src/constants/panel-styles.ts`, `src/services/session.tsx`.
- **Preparação/testes:** `scripts/demo-fixture.cjs`, `scripts/prepare-demo.cjs`, `scripts/Verificar.ps1`, `tests/domain.test.cjs`, `tests/demo.test.cjs`, `tests/emulators.test.cjs`, novo `tests/features.test.cjs`, `package.json`.
- **Dados e documentação:** três arquivos em `assets/demo/`; este relatório, `AUDITORIA_CANCELAMENTOS_TCC.md`, adendos de auditoria/validação, roteiro atualizado, README e capturas.

### Checkpoints e pendências reais

| Etapa | Commit local |
| --- | --- |
| A — Identidade e autenticação | `a1a68c7` |
| B — Comunicação, navegação, busca, filtros e CEP | `ac20e2f` |
| C — Duas aulas relacionadas | `2eb130a` |
| D — Código e relógio isolado | `10f9bc4` |
| E — Revisão, decodificação, evidências e documentação | Commit de revisão que contém esta seção; consultar `git log -1`. |

**Concluído para web local:** funcionalidades das prioridades, autorização no backend/regras, cenários fictícios, ensaio manual e verificações listadas. **Parcial por escopo:** validação nativa não realizada; upload/permissões de galeria e renderização precisam ser ensaiados em aparelhos Android/iOS antes da transmissão móvel.

**Decisões comerciais pendentes:** mudança de percentual faltando uma hora; eventual multa do instrutor; definição de cancelamento relevante/janela do contador; política de pacote/desconto; tratamento administrativo da expiração/bloqueio do início e eventual liberação após provas. As regras atuais são demonstráveis sem tomar essas decisões; o sistema não inventa penalidade ou repasse para cobrir a lacuna.

**Cuidados para 30/10:** preparar cenário novo e entrar novamente nas contas; iniciar todos os emuladores; testar a máquina/rede de apresentação; ViaCEP depende de internet, mas preenchimento manual funciona; atualizações remotas usam polling de 10s ou Atualizar; restaurar o relógio do ensaio após mostrá-lo. Conta nova/troca de foto com documento exige aprovação manual antes de voltar a operar. Datas impossíveis como bloqueios de agenda continuam sendo uma pendência antiga fora deste pedido; usar datas válidas no roteiro.

Os commits anteriores permanecem ancestrais. Nenhum push, merge, rebase, deploy, alteração da `main`, cobrança real ou migração destrutiva foi realizado nesta tarefa. Dependências, logs, build e snapshots locais permanecem ignorados.

Conferência final de segurança: varredura de 55 arquivos alterados/novos e 52 blobs dos checkpoints desta tarefa não encontrou padrões de chave privada/token real ou arquivos sensíveis versionáveis. As senhas de demonstração são fictícias, exclusivas dos emuladores. Não é auditoria externa de segurança. `70720eb` continua ancestral e `main` permanece em `23eefb50a516c5cf9c1991503f53c140825dc752`. Após o ensaio, foi preparado um cenário novo sem sobrescrever o anterior e o aluno entrou novamente, ficando na Home com fotos, agenda disponível e relógio normal.
