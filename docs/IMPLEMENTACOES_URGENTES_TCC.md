# Implementações urgentes para 30/10/2026

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
