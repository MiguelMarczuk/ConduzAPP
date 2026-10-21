# ConduzAPP — recuperação do TCC

Aplicativo Expo/React Native com três perfis, Firebase local e pagamentos simulados.

## Executar neste notebook

Na pasta do projeto, execute no PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\Iniciar-ConduzAPP.ps1
```

Aplicativo: http://localhost:8081. Painel Firebase local: http://127.0.0.1:4000.

As ferramentas portáteis ficam em `.tools`, sem alterar instalações do Windows. Em uma cópia nova, prepare primeiro:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Preparar-Ambiente.ps1
```

## Contas fictícias

| Perfil | E-mail | Senha de demonstração |
|---|---|---|
| Aluno | aluno@conduzapp.test | DemoTCC2026! |
| Instrutor | instrutor@conduzapp.test | DemoTCC2026! |
| Administração | admin@conduzapp.test | DemoTCC2026! |

O primeiro início prepara a base se ela não existir. Reinícios preservam a base existente. As credenciais acima pertencem exclusivamente aos emuladores.

Para ensaiar e apresentar com datas novas, depois de iniciar os emuladores execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\Preparar-Demonstracao.ps1
```

Cada execução cria um cenário isolado, com agenda configurada e aula histórica paga ainda não concluída/avaliada. Não sobrescreve a base anterior. **Saia e entre novamente** nas três contas após preparar. Repita no dia 30/10, sem mudar o relógio do computador. Veja a sequência de conclusão histórica, chat e reserva no roteiro.

## Verificar

Com os emuladores ativos:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Verificar.ps1
```

Os testes de integração usam contas temporárias e um documento isolado por execução; não substituem a base usada pelo aplicativo. A verificação atual inclui **52 testes unitários, 23 integrações/autorização, TypeScript e build web**. Resultado das implementações urgentes e limites do ensaio: [relatório](docs/IMPLEMENTACOES_URGENTES_TCC.md).

Com Node 22 e npm no PATH também é possível executar `npm test`, `npm run typecheck`, `npm run test:emulators` e `npm run build:web`.

## Arquitetura de recuperação

- `src/app/painel.tsx`: fluxos de aluno, instrutor e administração.
- `src/components`: componentes reutilizados de formulários, cartões e avaliações.
- `src/services/session.tsx`: sessão e chamadas autenticadas.
- `src/services/firebase.ts`: conexões exclusivas aos emuladores.
- `functions/domain.js`: regras puras de negócio testadas.
- `functions/index.js`: endpoint autenticado, transação Firestore e autorização.
- `functions/state-scope.js`: cenários de teste/ensaio selecionados por claim do Admin SDK local.
- `firestore.rules`: impede leitura e escrita direta pelo cliente.
- `storage.rules`: fotos de perfil por ambiente, documentos de identidade privados e evidências de contestação com acesso autorizado.

O backend usa um documento agregado privado e transações para serializar as mutações desta demonstração pequena. Há limites de quantidade/tamanho. Esta estrutura prioriza recuperação e verificabilidade local; exige migração para coleções particionadas antes de escalar para produção. Os campos de acesso às fotos são espelhados pelo servidor. Não há migração de dados reais ou leitura do Firebase antigo.

Preço em centavos, comissão arredondada no backend, horário de Brasília (UTC−03), novas aulas de 60 minutos. Reservas antigas mantêm valor e duração. Remarcação não altera a reserva até aceite e revalida conflitos.

## Restrições

Nenhum deploy, push, transferência financeira, cobrança real ou integração automática com Detran. Credenciamento manual com validade e suspensão. Aprovação administrativa depende de custom claim provisionada apenas pelo seed local. Functions recusam execução fora dos emuladores. Recuperação exclusiva na branch `recuperacao-tcc`.

Chat antes da reserva, tags calculadas no backend e notificações internas usam o serviço agregado existente. Mensagens têm chave de reenvio para evitar duplicação. Atualizações entre participantes seguem o polling de 10 segundos, com botão Atualizar.

A identidade azul e branca aprovada foi preservada com componentes existentes, inclusive nas funcionalidades urgentes. Validação nativa em aparelhos Android/iOS continua prevista para etapa separada.

Veja [roteiro da apresentação](docs/DEMONSTRACAO.md) e [registro da recuperação](RECUPERACAO.md).

Resultado das correções e pendências: [auditoria atualizada](docs/AUDITORIA_FINAL_TCC.md).
