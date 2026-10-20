# Roteiro da apresentação — 30/10/2026

## Preparar um ensaio novo

Com as ferramentas portáteis já instaladas, execute na pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\Iniciar-ConduzAPP.ps1
powershell -ExecutionPolicy Bypass -File .\Preparar-Demonstracao.ps1
```

Depois **saia e entre novamente** nas três contas. Tokens antigos podem continuar apontando para o cenário anterior. Abra http://localhost:8081.

| Perfil | E-mail | Senha fictícia |
| --- | --- | --- |
| Aluno | aluno@conduzapp.test | DemoTCC2026! |
| Instrutor | instrutor@conduzapp.test | DemoTCC2026! |
| Administração | admin@conduzapp.test | DemoTCC2026! |

Cada preparação cria um cenário próprio, com identificador `demo-<UUID>`, sem sobrescrever `private/state` ou ensaios anteriores. O manifesto fica em `.tools/demo-current.json`. **Execute novamente em 30/10, antes da banca**, para renovar as datas e recuperar uma aula histórica ainda sem conclusão/avaliações. Reiniciar o aplicativo sozinho preserva o cenário já usado.

A agenda vem configurada em dois períodos por dia, 08–12 e 14–18. O instrutor principal tem aprovação fictícia e validade de 90 dias. Também há uma ocorrência de suporte e um segundo perfil fictício pendente para o administrador analisar. Não use documentos, endereços ou fotos reais.

## Sequência para mostrar os fluxos

1. **Instrutor e agenda:** entre como instrutor. Mostre aprovação manual, validade e os dois períodos diários. A agenda pode ser editada pelo formulário normal.
2. **Conclusão sem esperar uma hora:** em Agendamentos, abra a aula com local “Cenário histórico fictício — concluir e avaliar”. Ela foi preparada com pagamento simulado e término há aproximadamente uma ou duas horas. Toque em “Concluir aula após o término”. O servidor usa o relógio normal e aplica as mesmas regras das outras aulas. A confirmação do aluno não é obrigatória.
3. **Aluno autenticado e contato:** entre como aluno, busque Marcos Oliveira e abra o perfil. Toque em “Conversar com o instrutor” e envie uma mensagem fictícia. A conversa exibirá **SEM AGENDAMENTO**, pois a histórica já está concluída e ainda não existe reserva futura.
4. **Disponibilidade e solicitação:** volte ao perfil do instrutor, escolha um horário futuro dos próximos sete dias e informe um ponto fictício de encontro, sem CEP se desejar. Solicite a aula. O horário já fica reservado e a tag muda para **AGENDADO**, mesmo sem pagamento.
5. **Aceite:** entre como instrutor. Veja a notificação de nova solicitação, o histórico da mensagem e a reserva. Aceite a solicitação. Ela fica **Aguardando pagamento**.
6. **Pagamento simulado e confirmação:** entre como aluno. Veja a notificação do aceite, abra a reserva e toque em “Confirmar pagamento SIMULADO”. Confira status confirmado, preço de R$ 85 e comissão de R$ 2,55. Nenhuma cobrança externa ocorre.
7. **Bloqueio do horário:** abra novamente os horários do instrutor. O horário solicitado não aparece. A integração também valida duas reservas simultâneas: somente uma é aceita.
8. **Mensagens e notificações:** mostre que ambos os participantes veem o histórico; um terceiro não recebe essas mensagens. Abra “Notificações”, veja os avisos de aceite/confirmada e marque um como lido. A atualização entre contas usa a consulta existente a cada 10 segundos; “Atualizar” permite conferir imediatamente.
9. **Avaliações:** na aula histórica concluída, aluno e instrutor avaliam uma vez cada. A avaliação do instrutor é pública para os usuários do aplicativo, sem divulgar o vínculo privado para terceiros. A avaliação do aluno só pode ser acessada pelo destinatário, autor e administração.
10. **Administração:** entre como admin. Mostre o perfil “Instrutor Fictício Pendente”, número/validade e parecer de aprovação ou rejeição manual. Em Ocorrências, abra o suporte fictício e registre uma decisão. Esse perfil pendente foi incluído no cenário para a análise; não é uma verificação do Detran nem upload documental.

**Observação sobre a tag inicial:** antes de concluir a histórica, ela está confirmada e portanto também conta como AGENDADO, mesmo com horário passado. A classificação segue os estados aprovados do produto. Por isso a conclusão histórica vem antes da demonstração de SEM AGENDAMENTO.

## Cenários opcionais já existentes

- **Remarcação:** na aula futura confirmada, um participante propõe nova data com pelo menos três horas de antecedência. O outro aceita ou recusa. A original permanece até o aceite; o backend revalida conflitos e preserva preço/duração. O destinatário recebe notificação.
- **Cancelamento:** cancele a reserva futura e confira o aviso ao outro participante. Sem outra reserva solicitada/aceita/confirmada, a conversa volta para SEM AGENDAMENTO. Conclusões e cancelamentos não contam para a tag.
- **Falta seguida de contestação:** depois das avaliações, o admin pode registrar uma ocorrência fictícia de falta na histórica, com motivo explícito de ensaio. O aluno/instrutor ainda pode contestar até 24h após o término. A abertura bloqueia a elegibilidade e não modifica o pagamento/estorno que já estavam registrados. O admin analisa e decide expressamente. Para repetir, prepare outro cenário.
- **Evidências:** as permissões de upload/leitura/listagem foram testadas nos emuladores. O seletor/renderização não foram conferidos manualmente nesta tarefa; ensaie antes se quiser demonstrar anexos.

## Explicações para a banca

- Tudo ocorre em Firebase Emulators, com dados fictícios e em loopback.
- Pagamentos, estornos e elegibilidade são simulações. Elegível não significa dinheiro transferido.
- A conclusão histórica é uma preparação explícita de demonstração. Não existe botão para forçar conclusão de aula futura, parâmetro de relógio enviado pelo cliente ou integração automática com Detran.
- No-show não remove o direito de contestar dentro da janela. A administração analisa a ocorrência.
- Aluno cancela acima de duas horas: integral; até duas horas antes do início: 50%; falta: zero. Instrutor cancela: integral. Estes critérios existentes foram preservados.
- Penalidades não alteram estrelas. O contador de cancelamentos ainda inclui todos os cancelamentos do instrutor; a definição de “relevante” continua pendente na auditoria.
- Credenciamento mostra número/validade/parecer; a conferência documental completa continua fora do app. Endereço é texto livre, sem CEP estruturado.

## Preservação

O início normal preserva a base. A preparação cria outro cenário, sem apagar o anterior. O script de emuladores exporta os dados ao encerrar normalmente. Para salvar manualmente o snapshot local com o ambiente ativo:

```powershell
. .\scripts\ambiente.ps1
node node_modules/firebase-tools/lib/bin/firebase.js emulators:export .emulator-data --project demo-conduzapp --force
```

O comando atualiza apenas a pasta de snapshot local. Não faz deploy nem migração. Não encerre abruptamente os emuladores antes de salvar um ensaio que deseje preservar.
