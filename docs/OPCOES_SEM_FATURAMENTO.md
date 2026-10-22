# Demonstração sem ativar faturamento

Decisão do responsável em 21/10/2026: evitar faturamento. **Não ativar Blaze, não cadastrar cartão e não contratar serviços pagos.** A autorização anterior para publicar o app continua restrita a um caminho compatível com essa decisão.

## Situação confirmada

- Login Google do Firebase CLI concluído.
- Projeto existente: `conduzapp-d9beb` / ConduzAPP.
- Firestore e Authentication já existem. Coleções antigas: `agendamentos`, `alunos`, `instrutores`.
- Faturamento desativado. Functions e Firebase Storage não estão habilitados.
- Regras e configurações atuais foram copiadas para backup local em `.tools/cloud-demo/`, ignorado pelo Git.
- Nenhum dado, regra, conta, bucket ou site do projeto antigo foi alterado por esta inspeção.
- A preparação Firebase/Blaze do commit `853d0b9` foi validada localmente, mas não foi publicada e não atende à preferência atual de ausência de faturamento.
- A regra antiga de `agendamentos` permite leitura e escrita para qualquer usuário autenticado. Essa política não deve proteger o fluxo reconstruído. Antes de publicar uma nova interface, preservar o conteúdo antigo e definir um cenário/projeto gratuito isolado ou uma revisão específica de permissões; não abrir acesso às novas estruturas para contornar a falta de backend.

## Alternativas apresentadas

| Caminho | Resultado | Dependências e limites |
| --- | --- | --- |
| Link online gratuito | Dispositivos com internet usam a mesma base e arquivos persistentes | Firebase Spark para contas/banco, backend Node em Render Free e fotos/documentos em bucket privado Supabase Free. Exige contas gratuitas adicionais, adaptação e teste das conexões, credenciais exclusivamente no servidor e validação real dos limites/ausência de plano pago. Regras de negócio existentes devem ser reutilizadas. |
| Mesma rede Wi-Fi | Dispositivos do grupo acessam o notebook que serve a demonstração | Notebook precisa estar ligado e todos na mesma rede. Preparar cenário fictício separado, persistência local e acesso de rede controlado; não expor os emuladores atuais com fotos/documentos pessoais à internet ou a uma rede pública. Não é um link online independente do notebook. |

A escolha continua pendente. Não criar contas, transferir arquivos para outros provedores ou adaptar a arquitetura antes de resolver essa preferência.

## Restrições da alternativa online gratuita

- O plano Free do Render pode suspender o backend após 15 minutos sem tráfego e demorar cerca de um minuto para reiniciar. Isso precisa ser ensaiado antes da banca. Não há promessa de disponibilidade contínua.
- O disco local de um serviço Render Free é efêmero: não guardar fotos ou banco nele. As fotos precisam de armazenamento persistente externo.
- Render permite instâncias gratuitas sem pagamento. Sem método de pagamento, exceder limites pode suspender o serviço. Não adicionar cartão nem mudar para plano pago.
- Supabase Free oferece 1 GB de armazenamento e pode pausar projetos após uma semana de inatividade. Preparar acesso antes da apresentação e acompanhar as quotas.
- Buckets devem ser privados. Não publicar chaves de serviço nem tornar documentos/evidências públicos para facilitar a demonstração.
- Não transferir automaticamente dados pessoais do projeto antigo ou dos emuladores. A apresentação deve usar dados fictícios e arquivos de teste previamente revisados.
- Validar upload, recarga, novo login e visualização por outro dispositivo no serviço real antes de declarar a solução concluída.

Fontes oficiais consultadas em 21/10/2026: [Render Free](https://render.com/docs/free), [primeiro deploy sem pagamento](https://render.com/docs/your-first-deploy), [Supabase Free](https://supabase.com/pricing), [Firebase Spark e Blaze](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).
