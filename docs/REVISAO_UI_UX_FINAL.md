# Revisão final de UI/UX — ConduzAPP

Revisão: 19–20/10/2026. Apresentação: 30/10/2026. Branch: `recuperacao-tcc`.

## Escopo e comparação

Foram examinados os nove prints de `docs/visual/` e os cinco protótipos originais (login, home, perfil, agendamento e avaliações). A direção visual aprovada foi preservada: azul e branco, campos arredondados, cards, avatares com iniciais, estrelas azuis e navegação inferior. Não foram adicionados pacotes, métodos de pagamento, fotos fictícias ou outras funcionalidades dos protótipos que não fazem parte do MVP.

| Tela | Resultado da revisão |
| --- | --- |
| Login | Mantida a composição da referência. Campos, recuperação, criação de conta, troca de perfil e rodapé acessíveis por rolagem. |
| Home | Mantidos saudação, busca, atalhos e perfil profissional. Rodapé acessível; navegação permanece fora da área de rolagem. |
| Perfil | Mantidos cabeçalho e menu da referência. Ajuda e saída acessíveis no final da página. |
| Agendamento | Comissão interna removida também do aviso da solicitação. Sete dias acessíveis por rolagem horizontal; resumo, preço final e botão acessíveis por rolagem vertical. |
| Agendamentos | Aluno vê preço e estado do pagamento sem comissão. Status em linha própria evita comprimir nome, data e duração. Instrutor e administração continuam vendo a comissão. |
| Avaliações | Mantidos estrelas, comentários e avaliações recebidas, respeitando os dados autorizados. |
| Mensagens | Tag atual verificada com o mesmo par de participantes. Histórico, campo e botão de envio acessíveis. |
| Instrutor | Saudação compacta, solicitações e acesso às aulas primeiro, disponibilidade recolhível e resumo das próximas aulas confirmadas. Credenciamento compacto, com detalhes recolhíveis; avisos de suspensão e vencimento continuam visíveis. |
| Administração | Preservados fluxos e identidade visual; conferência das ações e registros em diferentes posições de rolagem. |
| Navegação inferior | Tamanho de fonte da aba ativa igual ao das demais; mantém destaque azul e negrito sem encostar os rótulos em telas de 320 px. |

## Investigação da conversa com Marcos

A reserva `fa2e3ebd-7e9c-40a0-9389-108642f7e4c5` e a conversa `93d5e75b45e9da14095f699505cb6294fac68a671e92dcc7d5b48f01e70201a0` pertencem ao mesmo par fictício, no cenário isolado `demo-visual-8e88d297-3de6-4b5f-b5bd-03e1b2ca6143`:

- Aluno: `visual-aluno-582ecd7c-8e63-4514-a1dd-f5718b5baf86`.
- Instrutor: `visual-instrutor-c9a9f80a-ded4-4fbe-979c-41aa5d5bf886`.
- Reserva atual: `aguardando_pagamento`, `paid: false`.
- Tag retornada pelo domínio e exibida no navegador: **AGENDADO**.

O print antigo de mensagens foi capturado antes da solicitação, enquanto o print de agendamentos foi capturado depois. O registro do ensaio mostra abertura da conversa antes de `book` e `accept`. A base original da demonstração usa outros IDs (`demo-aluno` e `demo-instrutor`), embora repita os nomes fictícios; sua aula histórica confirmada também produz AGENDADO.

Não foi encontrado defeito na classificação atual. Nenhuma regra de tags foi alterada: solicitado, aguardando pagamento e confirmado contam; cancelado e concluído não contam. Os testes existentes de domínio e integração exercitam essas transições.

## Preservação das regras

Alterações funcionais limitadas à apresentação em `src/app/painel.tsx` e estilos em `src/constants/panel-styles.ts`. A comissão continua calculada e armazenada pelo backend. Autenticação, comandos de reserva, disponibilidade, pagamento simulado, avaliações, mensagens e permissões não foram alterados. A disponibilidade recolhida permanece montada, preservando edições locais ao abrir/recolher. Nenhum salvamento de disponibilidade foi necessário para a revisão visual.

## Validação desta revisão

- Testes unitários: **31/31 aprovados**.
- Integração com emuladores e namespace isolado: **15/15 aprovados**.
- TypeScript: **aprovado**.
- Build web: **aprovado, 23 rotas exportadas**.
- Inspeção visual manual no navegador em **425 × 669 px**, com verificações adicionais em **360 × 640**, **320 × 640** e **1280 × 720**. Isso não equivale a testes visuais automatizados ou validação em aparelhos físicos.

Logs locais ignorados da rodada final após o ajuste da navegação: `.tools/revisao-final-unitarios.log`, `.tools/revisao-final-integracao.log`, `.tools/revisao-final-typescript.log`, `.tools/revisao-final-build.log`. Os primeiros logs `revisao-*` registram a rodada anterior ao último ajuste visual.

Foram conferidos o topo, trechos intermediários e rodapé das páginas longas; navegação pelas quatro abas; acesso ao sétimo dia da agenda; seleção de horário e resumo; abertura dos detalhes de aula; compositor de mensagens; estrelas e comentário de avaliação; abertura da disponibilidade e dos detalhes do credenciamento; formulários e registro de operações administrativos. Mensagem, avaliação, pagamento, disponibilidade e decisões administrativas não foram enviados nessa conferência manual. A avaliação pendente foi representada por um novo cenário local `demo-visual-*`, criado pela fábrica existente, sem alterar o relógio ou a base original. A conta original do aluno foi restaurada ao final.

O servidor local do Expo precisou ser reiniciado durante a inspeção; os emuladores e dados foram preservados. A revisão continuou em nova aba após a aba anterior permanecer na tela de erro de conexão. Isso não exigiu mudança de código de autenticação ou Firebase.

## Capturas após a revisão

Os prints antigos foram preservados para comparação. Novas capturas JPEG, com dados fictícios, em `docs/visual/revisao-final/`:

- [Login](visual/revisao-final/01-login.jpg) e [rodapé](visual/revisao-final/01-login-rodape.jpg).
- [Home](visual/revisao-final/02-home.jpg).
- [Perfil](visual/revisao-final/03-perfil.jpg) e [rodapé](visual/revisao-final/03-perfil-rodape.jpg).
- [Agendamento](visual/revisao-final/04-agendamento.jpg), [topo](visual/revisao-final/04-agendamento-topo.jpg) e [resumo](visual/revisao-final/04-agendamento-resumo.jpg).
- [Avaliações](visual/revisao-final/05-avaliacoes.jpg), [formulário](visual/revisao-final/05-avaliacoes-formulario.jpg) e [rodapé em 320 px](visual/revisao-final/05-avaliacoes-rodape-320.jpg).
- [Agendamentos](visual/revisao-final/06-agendamentos.jpg) e [navegação corrigida em 320 px](visual/revisao-final/06-navegacao-320.jpg).
- [Mensagens](visual/revisao-final/07-mensagens.jpg) e [compositor](visual/revisao-final/07-mensagens-rodape.jpg).
- [Instrutor](visual/revisao-final/08-instrutor.jpg), [desktop](visual/revisao-final/08-instrutor-desktop.jpg) e [disponibilidade em 360 px](visual/revisao-final/08-disponibilidade-360.jpg).
- [Administração](visual/revisao-final/09-administracao.jpg) e [suporte em 320 px](visual/revisao-final/09-suporte-320.jpg).

Os prints incluem diferentes cenários fictícios (a base original e ensaios isolados). Por isso podem diferir em contadores, notas e estado das aulas. A investigação de AGENDADO acima compara explicitamente os mesmos IDs, sem deduzir vínculo apenas pelo nome exibido.

## Pendências de dispositivos móveis

Validar em Android/iOS reais: teclado virtual e reposicionamento do compositor, áreas seguras/notch, gestos de rolagem, aumento da fonte do sistema, leitor de tela e orientação horizontal. A conferência no navegador estreito não substitui esses ensaios. Não há novo redesign, push ou deploy nesta tarefa.
