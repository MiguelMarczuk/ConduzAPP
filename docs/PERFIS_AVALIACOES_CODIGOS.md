# Perfis dos participantes, avaliações e filtro de códigos

Implementação e validação local em 21/10/2026, na branch `recuperacao-tcc`.

## Acesso aos perfis e mensagens

- Instrutor: Início → Meus alunos → Ver perfil. São exibidos apenas alunos já vinculados por uma aula ou conversa, conforme a projeção autorizada do backend.
- Aluno: Início → instrutor → Perfil e avaliações do instrutor.
- Ambos: Agendamentos → Ver perfil do participante, ou Mensagens → Ver perfil, tanto na lista quanto dentro da conversa.
- No perfil do participante, Enviar mensagem abre o chat existente. O histórico e a proteção contra reenvio duplicado são reutilizados.
- `openConversation` passou a aceitar o instrutor que já possui vínculo de aula ou conversa com aquele aluno, reproduzindo a autorização já existente em `message`. Não há diretório público de alunos nem acesso a documentos, credenciais ou informações privadas do outro participante.

## Avaliações pelo perfil

O formulário existente foi reutilizado. Cada participante pode avaliar a outra pessoa por uma aula concluída, paga e cujo horário final já passou. Quando há várias aulas elegíveis, é possível selecionar a aula pela data. Após o envio, ela deixa de aparecer como pendente para aquele autor.

O backend continua exigindo participação e impedindo avaliações duplicadas. Avaliações de instrutores mantêm a publicação e anonimização atuais. No perfil de um aluno, o instrutor vê apenas as avaliações que ele próprio escreveu; não tem acesso às avaliações privadas feitas por outros instrutores.

## Códigos disponíveis

Em Agendamentos, o novo filtro mostra somente aulas pagas e confirmadas, que exigem código e cuja confirmação está disponível na janela entre o início e dez minutos depois. Usa o horário enviado pelo servidor, inclusive no ensaio isolado; não depende do relógio do dispositivo.

Os detalhes da aula são abertos automaticamente nesse filtro. A filtragem não exige receber o segredo: o instrutor continua sem acesso ao código do aluno. Aulas futuras, concluídas, canceladas, sem pagamento, com código confirmado, expirado ou bloqueado ficam fora. Após confirmar o início, o item sai do filtro na resposta do servidor. A atualização periódica existente continua ocorrendo a cada dez segundos.

Não houve alteração na geração ou validação do código, pagamentos, reembolsos, disponibilidade, credenciamento, autenticação ou regras Firestore/Storage.

## Validação executada

`scripts/Verificar.ps1`, executado nesta alteração:

| Verificação | Resultado |
| --- | --- |
| Testes unitários | 55 aprovados, 0 falhas |
| Integração nos emuladores Auth, Functions, Firestore e Storage | 25 aprovados, 0 falhas |
| TypeScript `tsc --noEmit` | Aprovado |
| Export web | Aprovado, 23 rotas |

Os novos casos automatizados cobrem limites temporais do filtro, exclusão de estados inadequados, elegibilidade de avaliação nos dois sentidos, acesso do instrutor somente ao aluno vinculado, mensagens pelo vínculo, projeção sem documentos privados, proibição de duplicação de avaliações e proteção contra terceiros. A suíte de integração verifica também que a base principal da demonstração permanece preservada.

Validação pela interface em `http://localhost:8081/painel`, com contas fictícias em um cenário `demo-*` exclusivo:

1. Instrutor abriu o perfil de um aluno vinculado, enviou avaliação de quatro estrelas e iniciou uma mensagem pelo perfil.
2. Aluno abriu o perfil do instrutor a partir da busca, enviou avaliação de cinco estrelas e respondeu na mesma conversa.
3. Acesso ao perfil funcionou pela lista de conversas, pelo cabeçalho do chat e pelo agendamento; voltar do perfil reabriu a conversa correta.
4. A fixture possuía quatro aulas: atual, futura, concluída e cancelada. O filtro mostrou uma única aula e abriu seus detalhes automaticamente, para ambos os participantes.
5. O aluno recebeu o código na tela; o instrutor recebeu somente o campo para digitá-lo. Após o instrutor validar o código fictício pela interface, o contador passou a zero e a aula saiu do filtro.
6. Atualização da página preservou mensagens e avaliação; novo login do instrutor preservou sua avaliação do aluno. Os formulários não reapareceram para a aula já avaliada.

O horário de ensaio existente foi usado somente na fixture isolada. O relógio do computador e os dados da demonstração principal não foram alterados. Nenhum pagamento real foi executado. A validação visual ocorreu no navegador estreito (471 × 668); aparelhos Android/iOS físicos continuam pendentes.

## Arquivos

- `src/app/painel.tsx`: perfis de participantes, atalhos, avaliação e filtro com detalhes abertos.
- `src/lib/presentation.ts`: critérios do filtro e de avaliação pelo perfil.
- `functions/domain.js`: abertura autorizada da conversa pelo instrutor já vinculado.
- `tests/features.test.cjs`, `tests/domain.test.cjs`, `tests/emulators.test.cjs`: cobertura adicional.
- `docs/visual/perfis-codigos/`: dez prints de dados fictícios, sem o código secreto.

Sem push, merge ou deploy. Histórico anterior e branch `main` preservados.
