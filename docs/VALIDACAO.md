# Validação da recuperação — 19/10/2026

Ambiente: Windows, Node.js 22.23.3 portátil, Java 21 e Firebase Emulators. Branch recuperacao-tcc. Nenhum push ou deploy.

## Executado com sucesso

- `scripts/Verificar.ps1`: código de saída 0.
- 19 testes de domínio aprovados.
- TypeScript (`tsc --noEmit`): sem erros.
- 7 testes integrados nos emuladores aprovados, incluindo concorrência real de duas reservas, autenticação, proteção administrativa, privacidade de reservas/mensagens e permissões de escrita/leitura/listagem das fotos.
- Build web (`expo export --platform web`): concluído, 23 rotas exportadas em dist.
- Script Iniciar-ConduzAPP.ps1 executado: preservou a base fictícia e iniciou o servidor web.

As recusas PERMISSION_DENIED visíveis nos testes de regras são resultados esperados de `assertFails`, não testes reprovados.

## Conferência pelo navegador

Login de aluno, instrutor e administrador; disponibilidade semanal com dois períodos no mesmo dia; solicitação; aceite; pagamento simulado; desaparecimento do horário ocupado; conclusão de aula histórica; confirmação da realização; avaliação bilateral; favoritos; envio de mensagem; abertura de suporte e resolução administrativa.

Um aviso de texto fora de componente Text foi identificado no chat e corrigido. A aba foi reaberta sem esse erro. As evidências de permissão das fotos foram verificadas pelos testes integrados; o upload pelo seletor nativo de imagens não foi conferido manualmente.

## Estado de demonstração

Três contas fictícias documentadas no README, instrutor aprovado, disponibilidade de terça-feira em dois períodos, uma aula futura confirmada, uma aula histórica concluída e avaliada por ambas as partes, uma mensagem e um atendimento de suporte resolvido. Datas da base correspondem à preparação de 19/10/2026; novos testes da apresentação podem configurar outros dias e reservar novos horários.

## Limitações restantes

- Android/iOS físicos e builds nativos não foram testados; validação de execução feita na web.
- Protótipos originais ainda não recebidos. Layout reconstruído com identidade azul/branca e componentes aproveitados.
- Backend agregado e com limites explícitos para demonstração local. Para produção, será necessária arquitetura particionada e nova avaliação de segurança/operação.
- Sem acesso ou migração do banco real, sem recuperação dos arquivos ainda inacessíveis do computador anterior.
- Pagamentos, estornos e elegibilidade são somente simulações. Nenhuma transferência financeira é realizada. Sem integração automática com Detran.

O código original da branch main permanece no histórico Git. Os commits de recuperação são locais.

## Validação das correções prioritárias — 19/10/2026

Resultados novos, sem somar aprovações históricas:

- 28 testes unitários de domínio + 3 da preparação de demonstração: **31/31 aprovados**.
- Integração com Auth, callable Functions, transações e regras Firestore/Storage: **15/15 aprovados**.
- Regressões de privacidade de avaliações, contestação após ambas as faltas, valores financeiros preservados ao abrir disputa, bloqueio de elegibilidade com controle positivo, chat anterior à reserva, duplicação concorrente, ACL de participantes, tags por estado, notificações por destinatário e isolamento de cenário.
- TypeScript: **sem erros, saída 0**.
- Build web: **aprovado, saída 0, 23 rotas**.
- `scripts/Verificar.ps1` passou com 30 unitários/14 integrações. Depois, duas regressões adicionais passaram nas execuções finais: 31 unitários/15 integrações. Nenhum código de aplicação mudou depois do build/TypeScript.
- Logs locais ignorados pelo Git: `.tools/validacao-final.log` e `.tools/integracao-final.log`.

A suíte integrada agora usa claim `test-<UUID>` e documento próprio. Não substitui/restaura a base da demonstração. O hook final confere que `private/state` permanece idêntico e remove os registros temporários conhecidos. Recusas PERMISSION_DENIED nos `assertFails` são esperadas.

Ensaio manual novo no navegador: login dos três perfis; agenda preparada; conclusão normal da histórica; avaliações bilaterais; mensagem antes da reserva futura; SEM AGENDAMENTO → AGENDADO ainda sem pagamento; solicitação, aceite e pagamento simulado; ausência do horário ocupado; notificação de conclusão/aceite/confirmação, marcação de leitura e painel administrativo com pendência/suporte fictícios. As validações negativas de autorização e o fluxo pós-falta foram executados nos testes de backend, não simulados como testes visuais.

Evidências: [chat sem agendamento](chat-sem-agendamento.png), [chat agendado](chat-agendado.png), [notificações](notificacoes-internas.png).

`Preparar-Demonstracao.ps1` foi executado para criar um cenário próprio de ensaio e pode ser repetido perto da banca. O cenário anterior fica preservado. Saia e entre de novo após executar; não altere o relógio. O histórico pago é criado recente, sem avaliações, para permitir conclusão normal.

As seções anteriores deste arquivo descrevem a recuperação original; suas quantidades e estado da base são históricos.

## Implementações urgentes — nova validação

- **52/52 unitários**: domínio, cenários e helpers, incluindo fotos/identidade, mensagens, filtros/busca/CEP, duas aulas e início.
- **23/23 integrações/autorização**: emuladores reais, Storage, callable, transações/concorrência e regras de acesso.
- **TypeScript e build web aprovados**, 23 rotas. Verificador padrão inclui a nova suíte de funcionalidades.
- Ensaio manual web: galeria/prévia/upload, persistência após login, documento privado/decisão administrativa, badge em ambos os perfis, logo por papel, endereço/ViaCEP, duas aulas e pagamento conjunto, código incorreto/correto/expirado, conclusão condicionada ao término e relógio restaurado.
- Capturas e detalhes em [IMPLEMENTACOES_URGENTES_TCC.md](IMPLEMENTACOES_URGENTES_TCC.md). Navegador conferido em 425px e 320px; sem suíte E2E automatizada e sem teste em aparelhos Android/iOS nesta etapa.
- Logs finais em `.tools/urgente-final-*` e `.tools/urgente-verificar-final.log`, ignorados pelo Git. Resultados históricos não foram somados aos atuais.
