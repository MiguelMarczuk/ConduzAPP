# Correção do fluxo de foto — 21/10/2026

## Complemento — clique direto e rótulo de perfil

Após novo relato, confirmou-se que **Alterar foto apenas trocava a seção local**, sem abrir o seletor. Para uma conta pendente, a seção já estava visível e o clique parecia não fazer nada. Agora o botão chama diretamente a mesma seleção de imagem usada por **Escolher foto de perfil** (novo rótulo solicitado). O estado da seleção/prévia foi elevado ao perfil e compartilhado com o painel; não existe um segundo serviço de upload nem abertura por efeito atrasado.

Também foi identificada uma causa de interface desatualizada: `scripts/ambiente.ps1` define `CI=1`, herdado por `scripts/run-web.ps1`. O Metro instalado informa, em `instantiateMetro.js`, que CI desativa a observação de arquivos/reloads. A página continuou apresentando o código antigo mesmo após recarga. `run-web.ps1` agora limpa CI somente para o servidor de desenvolvimento; testes/build mantêm seu ambiente anterior. Foi reiniciado somente o Expo, preservando Firebase e dados, e o rótulo novo foi conferido na página atual.

**Prova nova no navegador:** contas fictícias em um cenário `test-*` separado, sem trocar fotos/documentos das contas em uso. No aluno aprovado de teste (painel inicialmente fechado) e no instrutor pendente (painel já visível), um clique em **Alterar foto** disparou o evento real de seletor. **Escolher foto de perfil** também disparou o seletor em ambos. O JPEG fotográfico foi recebido, prévia apareceu e **Salvar foto de perfil** concluiu, mostrando a imagem no Avatar. A sessão administrativa que estava aberta foi restaurada após o ensaio.

**Verificação nova executada:** 52 unitários, 24 integrações/autorização, TypeScript e build web com 23 rotas, todos aprovados. Log `.tools/photo-button-verificar.log`. A abertura do seletor é validação manual pelo navegador e não está sendo contada como teste unitário/integrado. Capturas em [visual/botoes-foto/](visual/botoes-foto/). Arquivos deste complemento: `src/app/painel.tsx`, `src/components/identity-panel.tsx`, `scripts/run-web.ps1`, este relatório e capturas. Backend, autenticação e regras Firebase inalterados; sem push/deploy.

As seções abaixo registram a investigação anterior, preservadas com seus rótulos e resultados históricos.

Branch `recuperacao-tcc`, sobre o checkpoint `2263cd2`. Escopo: foto de perfil e diagnóstico local, sem push/deploy ou mudança de regras de negócio/Firebase.

## Causa reproduzida

1. **Somente o Expo estava ativo**, em 8081. Não havia serviços nas portas 9099 (Auth), 5001 (Functions), 8080 (Firestore) e 9199 (Storage). A página antiga permanecia aberta com dados em memória, mas mostrava “Não foi possível conectar aos emuladores”. O upload depende desses serviços; abrir a página ou executar apenas o Expo não inicia o Firebase.
2. **Editar perfil não oferecia a foto.** O lápis e o item Editar perfil abriam somente nome/região/dados profissionais. O envio estava escondido no item separado “Foto e verificação de identidade”. Esse caminho de acesso não foi bem validado na entrega anterior.
3. **Falhas pouco visíveis:** leitura de imagem descartava erros silenciosamente e o upload usava o retry longo padrão do SDK, sem progresso. Uma indisponibilidade podia parecer um botão sem funcionamento.

Após restaurar os emuladores, o JPEG real já passou pelo seletor e backend anterior com aluno pendente. Portanto, nesta reprodução não houve evidência de bloqueio por identidade, UID, MIME ou regras do Storage. As regras não foram afrouxadas para obter o resultado.

## Correção aplicada

- Botão **Alterar foto** no perfil de aluno/instrutor; **Editar perfil** também oferece o mesmo componente de foto, sem criar um segundo serviço de upload.
- Seletor web acionado diretamente pelo gesto, sem solicitar permissão nativa desnecessária. Android/iOS continuam usando a solicitação da galeria.
- Na web, envio do `File` original entregue pelo Expo ImagePicker. `blob:` continua servindo apenas para prévia e não é persistido.
- Nome, MIME e tamanho visíveis na prévia. Upload com progresso, cancelamento após 30s sem conclusão e erro orientando a iniciar os emuladores. Falha de autorização/autenticação tem mensagem própria.
- Sucesso somente depois do upload e da chamada `setPhoto` concluída pelo backend. Se o perfil não for salvo, a prévia permanece e a tela informa a falha; não apresenta sucesso fictício.
- Falha de leitura/renderização agora permite tentar carregar novamente, em vez de desaparecer silenciosamente. Logs indicam seleção, transferência, persistência ou falha, sem foto/base64, token ou documento pessoal.
- Regras Storage/Firestore, backend de identidade e configuração Firebase **inalterados**. Mantidos proprietário, ambiente, imutabilidade, limite menor que 5MiB e JPEG/PNG/WebP, além da decodificação do servidor.

## Prova executada no aplicativo aberto

Fotografia JPEG real de girassol, 2.803.917 bytes, 2434×1697 pixels, sem pessoas. Fonte e licença ao final. Não foi usado o avatar ilustrativo da demonstração.

| Verificação | Aluno (`demo-aluno`) | Instrutor (`demo-instrutor`) |
| --- | --- | --- |
| Conta sem identidade aprovada | Envio pendente | Envio pendente |
| Acesso e seletor | Alterar foto → Selecionar foto da galeria | Editar perfil → Selecionar foto da galeria |
| ImagePicker recebe arquivo e mostra prévia | `girassol-real.jpg`, image/jpeg, 2,67MiB | Mesmo JPEG e metadados |
| Salvar e exibir no Avatar | Confirmado no navegador | Confirmado no navegador |
| Atualização completa da página | Foto visível após recarga | Foto visível após recarga |
| Sair e entrar novamente | Foto visível | Foto visível |
| Referência Firestore | `private/state`, `users.demo-aluno.photoPath` | `private/state`, `users.demo-instrutor.photoPath` |
| Objeto Storage | Caminho próprio `profilePhotos/state/demo-aluno/...` | Caminho próprio `profilePhotos/state/demo-instrutor/...` |
| Conteúdo baixado do Storage | JPEG, 2.803.917 bytes, hash igual ao original | JPEG, 2.803.917 bytes, hash igual ao original |

SHA-256 original e dos dois objetos: `c6f91a01bd0688c83088def88e48d94da65731e351370e22ea359f687f13cbf1`. O caminho do aluno permaneceu igual nas conferências após salvar, recarregar e autenticar novamente. A conferência final dos dois perfis está em [backend-verificado.json](visual/correcao-fotos/backend-verificado.json), com somente dados fictícios e metadados, sem tokens.

O Firestore armazena somente o caminho do objeto. O componente baixa os bytes com autenticação e gera uma representação em memória para renderizar; isso não grava Base64 no banco nem transforma a prévia temporária em foto persistente.

O carregamento inicial após recarga exibiu “Conectando…” enquanto a sessão era recuperada. A resposta do backend e o Avatar foram conferidos depois de terminar o carregamento. Não há pendência de validação manual do fluxo web dos dois perfis. Android/iOS não foram testados nesta tarefa.

## Testes realmente executados

- **52/52 unitários**, sem somar resultados históricos.
- **24/24 integrações/autorização**, nos emuladores. Nova regressão: aluno e instrutor com identidade `nao_enviada` e sem foto fazem upload JPEG, salvam referência, baixam os bytes e autenticam novamente recuperando o mesmo caminho. Terceiro não publica o arquivo no próprio perfil.
- **TypeScript aprovado**, sem erros.
- **Build web aprovado**, 23 rotas.
- Ensaio manual acima pelo seletor de arquivos e interface real, com oito capturas. Isso é separado das integrações e dos testes unitários.

Executado `scripts/Verificar.ps1`; log local ignorado `.tools/photo-verificar.log`. O limite de timeout de 30s é proteção de falha; não foi demonstrado desligando novamente o serviço durante um envio. As recusas de autorização foram executadas nos testes de integração.

## Iniciar e repetir corretamente

Na pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\Iniciar-ConduzAPP.ps1
```

**Aguarde “All emulators ready”** e o endereço do aplicativo. O comando inicia os serviços ausentes e preserva a base existente. Não basta `npm run web`, que inicia somente a interface. Portas necessárias: Auth 9099, Functions 5001, Firestore 8080 e Storage 9199; UI dos emuladores em http://127.0.0.1:4000 e app em http://localhost:8081.

1. Entre como aluno ou instrutor fictício.
2. Abra Perfil → Alterar foto (ou Editar perfil) → Selecionar foto da galeria.
3. Escolha JPEG/PNG/WebP menor que 5MiB, confira prévia e toque Salvar foto de perfil.
4. Aguarde “Foto atualizada e salva” e confira o Avatar.
5. Recarregue a página; depois saia e entre novamente. A imagem deve continuar.

Não execute Preparar-Demonstracao para corrigir um upload: esse comando seleciona outro cenário, com seus próprios perfis/fotos. Usá-lo muda o conjunto exibido e não prova persistência no cenário anterior.

Para diagnóstico, abra o console do navegador e filtre **`[ConduzAPP imagem]`**. Ele informa MIME/tamanho/dimensões, conclusão da transferência e persistência, ou código da falha. Logs normais do inicializador: `.tools/emulators.out.log`, `.tools/emulators.err.log`, `.tools/web.out.log` e `.tools/web.err.log`. Nesta investigação os emuladores foram retomados com logs em `.tools/photo-emulators.out.log` e `.tools/photo-emulators.err.log`. Não compartilhe dumps de autenticação, tokens ou documentos reais.

Emuladores precisam permanecer ativos durante o uso. Fechar/reiniciar o computador exige iniciar novamente. O script importa `.emulator-data` e exporta ao encerrar normalmente; encerramento abrupto pode perder mudanças que ainda estavam somente na memória dos emuladores. Faça exportação local antes de encerrar um ensaio que queira manter, conforme o [roteiro](DEMONSTRACAO.md).

Ao finalizar esta correção, foi exportado com sucesso um snapshot em `.emulator-data`, já com as duas fotos. O snapshot anterior foi copiado para uma pasta única em `.tools/backups/` antes da exportação. Ambos permanecem locais e ignorados pelo Git; nenhum dado foi apagado. O comando normal `Iniciar-ConduzAPP.ps1` também foi executado e confirmou “Base local existente preservada”. Não foi necessário mudar a configuração dos endereços/portas ou reiniciar o computador.

## Arquivos alterados

- `src/app/painel.tsx`: acessos visíveis para a foto.
- `src/components/identity-panel.tsx`: seletor, File original, progresso, timeout e tratamento de erro.
- `src/components/stored-image.tsx`: diagnóstico e nova tentativa de leitura.
- `tests/emulators.test.cjs`: regressão JPEG para contas pendentes e nova autenticação.
- Este relatório, adendos da documentação e `docs/visual/correcao-fotos/`: evidências.

## Fonte e licença da fotografia

[Sunflower from Silesia2.jpg](https://commons.wikimedia.org/wiki/File:Sunflower_from_Silesia2.jpg), fotografia de **Pudelek**, edição indicada por **Yzmo**, sob [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Arquivo de teste baixado sem edição; os recortes visuais do Avatar e a fotografia nas capturas conservam essa licença. Não representa uma pessoa cadastrada nem aprovação biométrica.

Referências técnicas consultadas junto ao código instalado: [Expo ImagePicker](https://docs.expo.dev/versions/v56.0.0/sdk/imagepicker/) e [upload do Firebase Storage](https://firebase.google.com/docs/storage/web/upload-files).
