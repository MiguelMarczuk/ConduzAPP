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
