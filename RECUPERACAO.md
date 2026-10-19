# Recuperação ConduzAPP

Branch exclusiva: recuperacao-tcc. Apresentação: 30/10/2026.

## Auditoria inicial
Base clonada de Samuellima1704/ConduzAPP, main. Pasta inicialmente vazia. Telas e componentes React Native/Expo aproveitáveis; sem Functions, regras, emuladores ou testes. README era template Expo.

Problemas: Firebase apontava para projeto real; reservas e avaliações escritas pelo cliente; horários padrão sem disponibilidade; duração nova de 50 minutos; ausência de credenciamento, preço contratado, comissão e concorrência; avaliação antes da conclusão; menus sem implementação; instrutor sem quatro abas.

## Restrições
Sem deploy/push, dados reais, cobranças ou transferências. Credenciamento manual, sem consulta ao Detran. Preservar duração e valor de reservas antigas. Desenvolvimento exclusivo no projeto demo-conduzapp com emuladores.

## Etapas
1. Ambiente isolado.
2. Backend transacional, autorização e regras.
3. Fluxos dos três perfis e demonstração.
4. Testes, build e verificação visual.

Este registro não representa conclusão antecipada.

## Checkpoint de implementação

Fluxos reconstruídos via endpoint autenticado: cadastro/login, credenciamento com validade, disponibilidade semanal e bloqueios, busca/favoritos, reservas, aceite, pagamento simulado, cancelamento, proposta/aceite de remarcação, conclusão, avaliações bilaterais, mensagens, suporte/disputas e estornos administrativos simulados. Fotos de disputa usam Storage privado. Rotas anteriores encaminham ao painel recuperado; versões originais permanecem no histórico Git.

19 testes de domínio executados e aprovados. TypeScript sem erros após corrigir declarações CSS ausentes da base. Emuladores e build web em validação; não declarados aprovados neste checkpoint.

Limitações de arquitetura: estado agregado privado em Firestore para esta demonstração pequena, limites explícitos de volume/tamanho, fuso de Brasília fixado em UTC−03, sem migração de dados reais. Todo cancelamento feito pelo instrutor antes do início conta para o alerta de cinco cancelamentos. Suspensão administrativa padrão: sete dias, com análise.

## Validação final

Executado scripts/Verificar.ps1 com saída 0: 19 testes de domínio, TypeScript sem erros, 7 testes integrados aprovados e build web com 23 rotas. Conferidos no navegador os três perfis, fluxo solicitação/aceite/pagamento simulado, bloqueio do horário ocupado, conclusão histórica, avaliações bilaterais, favoritos, chat e suporte administrativo. Corrigido aviso de renderização no chat e revalidada a aba. Detalhes e limites em docs/VALIDACAO.md.

Conexão de backend ao Firestore configurada via REST local com autenticação exclusiva do emulador, após diagnóstico de travamento do gRPC neste Windows. Discovery timeout ajustado para início frio. Node configurado para IPv4, evitando listener exclusivo em ::1. Metro ignora ferramentas portáteis e limita workers a dois.
