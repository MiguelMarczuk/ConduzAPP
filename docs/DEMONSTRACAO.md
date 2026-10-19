# Roteiro da apresentação — 30/10/2026

1. Execute Iniciar-ConduzAPP.ps1 e aguarde os emuladores. Abra o app.
2. Entre com instrutor@conduzapp.test / DemoTCC2026!.
3. Na aba Início, configure dois períodos de um dia futuro, por exemplo 08–12 e 14–18. Salve. Opcional: bloqueie uma data.
4. Vá a Perfil e saia. Entre com aluno@conduzapp.test.
5. Busque Marcos Oliveira, abra o perfil, favorite e escolha horário futuro nos próximos sete dias. Solicite a aula.
6. Entre como instrutor, abra Agendamentos → Gerenciar aula → Aceitar solicitação.
7. Entre como aluno → Agendamentos → Gerenciar aula → Confirmar pagamento SIMULADO.
8. Confira status confirmado. Abra o perfil do instrutor e observe que o horário reservado não está disponível. Mensagens podem ser trocadas entre os participantes.
9. Para mostrar conclusão sem esperar uma hora, use a aula histórica fictícia já marcada na base. Seu término ocorreu antes do início da demonstração. Como instrutor, conclua essa aula; como aluno, confirme e avalie; como instrutor, avalie o aluno.
10. Mostre remarcação em outra aula futura: proposta de um participante, aceite da outra parte, preço e duração mantidos.
11. Mostre cancelamento e estorno simulado. Regra do aluno: acima de duas horas, integral; até duas horas antes do início, 50%; no-show, zero. Instrutor, integral.
12. No histórico recente pago, abra contestação durante a janela permitida, descreva o problema e anexe foto fictícia. Não utilize documentos reais.
13. Entre como admin@conduzapp.test → Ocorrências. Leia o relato/anexos, registre parecer e valor de estorno simulado. Em Agendamentos, registre o estorno simulado.
14. Para credenciamento: cadastre outro instrutor fictício, envie autorização/validade pelo Perfil e aprove ou rejeite com parecer administrativo. Instrutores pendentes, suspensos ou vencidos não recebem novas reservas.

## Explicações para a banca

- O ConduzAPP não verifica automaticamente o Detran. Aprovação é manual.
- Tudo ocorre em Firebase Emulators com dados fictícios.
- Pagamentos, estornos e elegibilidade para repasse são simulações; não há transferência de dinheiro.
- Aula só conclui após seu término e pagamento. A aula histórica é uma preparação explícita de demonstração, sem botão para forçar conclusão de aula futura.
- Disputas podem ser abertas durante a aula e até 24h após seu término. Bloqueiam elegibilidade até análise.
- Falta do aluno exige tolerância de 20min; três faltas administrativas do instrutor geram suspensão por sete dias. Cinco cancelamentos de instrutor geram alerta. As estrelas nunca são alteradas como punição.
- Após o prazo de contestação e sem disputa, a elegibilidade pode ser verificada mesmo sem confirmação do aluno; isso não transfere dinheiro.

## Antes de sair

O script de emuladores exporta os dados quando encerrado normalmente. Para salvar manualmente com o ambiente ativo, execute `firebase emulators:export .emulator-data --project demo-conduzapp --force` com o Node/npm portátil no PATH. Esse comando grava apenas o snapshot local de demonstração.
