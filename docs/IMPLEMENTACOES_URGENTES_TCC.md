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
