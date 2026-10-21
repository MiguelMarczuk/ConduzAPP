# Cancelamentos — regras preservadas no TCC

Revisão da etapa E, branch `recuperacao-tcc`. Valores são registros de simulação; nenhum estorno ou repasse bancário é executado.

## Comportamento efetivo

| Ocorrência | Reembolso registrado | Efeito operacional |
| --- | --- | --- |
| Aluno cancela com mais de 2h | 100% do preço pago | Cancela somente aquela aula; bloqueia elegibilidade. |
| Aluno cancela com exatamente 2h ou menos, antes do início | 50%, arredondado a centavos | Mesmo comportamento; não existe exceção de perda integral faltando 1h. |
| Instrutor cancela antes do início, inclusive em cima da hora | 100% do preço pago | Incrementa seu contador; a partir de 5 cancelamentos, ativa alerta administrativo. Não aplica multa financeira nem diminui estrelas. |
| Reserva ainda sem pagamento | Zero a estornar; `nao_aplicavel` | Cancelamento continua possível antes do início; cancelamento do instrutor também incrementa o contador atual. |
| Falta do aluno registrada pela administração | Zero | Somente após início +20min, com motivo. Não é cancelamento automático. |
| Falta do instrutor confirmada pela administração | Integral | Somente após término, com motivo. A terceira falta ativa suspensão de 7 dias e alerta. Sem mudança artificial das avaliações. |

No instante do início e depois dele, a operação comum `cancel` é recusada. O fluxo passa por ocorrência/contestação e decisão administrativa. Não existe taxa adicional por cancelar faltando uma hora.

## Como o reembolso funciona

`functions/domain.js`, operação `cancel`, calcula o valor a partir de `price`, congelado na reserva, e de `paid`. Para pagamento existente grava `refundStatus: pendente_simulado`; isso representa uma obrigação simulada, não uma transferência. Somente a administração pode executar `refund`, que muda para `concluido_simulado`. A interface chama essa ação de estorno simulado. Sem pagamento não cria crédito fictício.

O cancelamento zera elegibilidade e remove proposta de remarcação. Preço e comissão contratados não são recalculados. Abrir disputa após falta continua possível até término +24h e não modifica automaticamente pagamento/reembolso existente; a decisão administrativa é explícita.

## Como o instrutor é afetado

Cancelamentos incrementam `cancellations`, independentemente da antecedência e de já existir pagamento. O quinto ativa `adminAlert`; cancelar, por si só, não aplica suspensão automática nem cobrança. Três faltas confirmadas pela administração usam outro contador (`absences`) e suspendem por 7 dias. Avaliações de participantes continuam separadas dessas ocorrências.

O contador de cancelamentos atual é acumulado e não possui janela temporal/redefinição nem critério adicional de “relevância”. Isso é uma limitação já registrada na auditoria anterior e foi preservado, sem inventar um novo limite.

## Duas aulas relacionadas

Cada aula conserva horário, preço, comissão e ciclo de vida próprios. Cancelar uma não cancela a outra; o percentual depende do início daquela aula. Não há desconto, multa de pacote ou redistribuição do valor. O pagamento simulado conjunto considera apenas itens aceitos e ainda não pagos.

## Decisões que continuam pendentes

1. Resolver o conflito entre perder 100% faltando uma hora e a regra aprovada de reembolso de 50% antes do início. Nenhuma alteração aplicada.
2. Definir se existirá penalidade financeira do instrutor, origem dos recursos, cobrança, contestação e processamento. Nenhuma multa/débito implementado.
3. Definir cancelamento “relevante”, janela de recorrência e eventual reabilitação do contador. O alerta atual permanece com cinco cancelamentos acumulados.
4. Definir eventual política comercial de pacote, descontos e cancelamento parcial. A implementação atual são duas aulas independentes relacionadas.
5. Definir tratamento administrativo para início expirado/bloqueado, liberação após evidências e relação com os 20min de tolerância. Até lá, o início expirado não gera falta/cancelamento/estorno automático e não permite elegibilidade indevida.

## Evidência executada

Os testes unitários de domínio verificam a fronteira exata de 2h, recusa no início, reembolso integral do instrutor, quinto cancelamento, tolerância de 20min, terceira falta e preservação das notas. `tests/features.test.cjs` cobre cancelamento individual nas duas aulas e expiração do início sem alteração financeira. As integrações cobrem o pagamento conjunto e contestação posterior à falta com valores preservados. Integram a execução final de **52 unitários e 23 integrações**, descrita em [IMPLEMENTACOES_URGENTES_TCC.md](IMPLEMENTACOES_URGENTES_TCC.md).
