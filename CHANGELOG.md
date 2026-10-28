# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.7.0] — 2026-10-29

### Added

- Rede de Relações: controle deslizante «Perto — Longe» para aproximar (até 0,25×) ou afastar (até 2×) os personagens, com o espaçamento atual no centro. O ajuste vale só para a visita; duplo clique restaura. Abaixo do padrão as caixas dos nós podem se sobrepor.
- Página inicial: a hero mostra uma captura real do mapa da aplicação no lugar do desenho decorativo.

### Changed

- README: capturas de ecrã atualizadas para a versão 1.7.0 (nova hero e novas imagens), exibidas em tamanho reduzido.

## [1.6.1] — 2026-10-29

### Added

- Página inicial: quarto card de funcionalidades, «Modo mestre» (edição na mesma tela em que se joga; o que ainda não foi revelado, os jogadores não veem), com o ícone de cadeado no padrão dos demais.
- Página inicial: nova seção «Os dados da mesa são seus», com dois cartões: «Hospede você mesmo» (com o link do repositório no GitHub, em nova aba) e «Ou use a versão hospedada» (com o botão para entrar como mestre, que leva ao login ou ao painel conforme haja sessão). Textos em pt-BR e en.

### Changed

- Página inicial: o bloco de funcionalidades passa de 3 para 4 colunas em telas grandes (2 em telas médias e 1 no celular). As demais seções não mudam.

## [1.6.0] — 2026-10-28

### Added

- **Indexação em buscadores por campanha, escolha do mestre.** Nas configurações de cada campanha no Painel, o interruptor «Permitir indexação em buscadores» começa **desligado** (inclusive nas campanhas existentes). Só tem efeito com a campanha ativa e com visibilidade «listada»; campanhas «só com link» nunca são indexáveis, e a escolha guardada volta a valer se a campanha voltar a ser listada. O aviso do interruptor explica que o conteúdo visível aos jogadores pode aparecer no Google e que desligar não retira de imediato o que já foi indexado. Rota nova: `PATCH /api/campanhas/{slug}/indexacao` (só o dono); `GET /api/c/{slug}/config` passa a devolver `indexavel` (efeito) e `GET /api/campanhas/minhas`, a escolha guardada.
- **Sitemap público** em `GET /sitemap.xml` (na raiz do site): `/`, `/explorar`, `/termos`, `/privacidade`, `/contato` (quando disponível) e, para cada campanha indexável, relações, sessões, linha do tempo, itens e o mapa (quando há imagem de mapa). Não publica `lastmod`, para não expor quando o mestre edita conteúdo privado, e nunca lista `/registo`, páginas privadas, `rota`, `ferramentas` nem `fios`.
- **Metadados por página:** título e descrição próprios em pt-BR e en («Página — Campaign Codex»), endereço canônico absoluto (`/c/{id}/{slug}/…` nas campanhas; `cronologia` aponta para `linha-do-tempo`) e `<html lang>` que acompanha o idioma da interface.
- **`noindex`:** páginas de conta, administração, convite e redefinição de senha, a página de «não encontrado», `rota`, `ferramentas` e `fios`, e todas as campanhas não autorizadas. As páginas de campanha começam **sempre em `noindex`** (também enquanto a configuração carrega ou se falha) e só passam a `index` quando a configuração confirma que a campanha é indexável.
- `robots.txt` com a linha `Sitemap:`; sem `Disallow` novo (o Googlebot precisa buscar a API para renderizar e ver o `noindex`).

### Changed

- A política de privacidade informa que campanhas marcadas como indexáveis podem aparecer em buscadores.
- Snippets do Caddy em `deploy/` (`Caddyfile` e `caddy.site.tpl`): `X-Robots-Tag` `noindex, nofollow` nas páginas privadas e `noindex` em `/api/*` (as imagens de `/api/c/{slug}/media` ficam fora do Google Imagens), `Referrer-Policy: no-referrer` em `/convite/*` e `/reset/*`, `/sitemap.xml` servido pela API, `index.html` sem cache e **404 real** para rotas desconhecidas.

### Database

- Migração do banco de controle `010_indexacao_buscadores`: coluna `indexavel` em `campanha` (`NOT NULL`, padrão falso).

### Operação

- **Os snippets do Caddy não se aplicam sozinhos:** colar o bloco novo no Caddy do host, validar (`caddy validate`) e recarregar. Conferir com `curl -I`: 404 em rota desconhecida, `X-Robots-Tag` no painel e na API, `Content-Type: application/xml` no sitemap. Se `copy_response 404` não se comportar no Caddy 2.9, o runbook traz o plano B (soft 404 apoiado no `noindex` da página).
- Cadastrar o domínio no Google Search Console (registro TXT na Cloudflare), enviar o sitemap e conferir em «Inspecionar URL» que o Googlebot recebe a página (sem desafio de WAF ou Bot Fight Mode da Cloudflare). O canônico pressupõe um único hostname público.
- Como as campanhas começam desligadas e o HTML inicial é uma casca, o ganho imediato é o site institucional e o catálogo.

### Documentation

- Novo `docs/runbook-seo.md` (Caddy, Search Console, conferências e remoção de URLs), seção «SEO e indexação» no README e `docs/api-contracts.md` com as rotas novas.

## [1.5.0] — 2026-10-28

### Added

- Recuperação de senha pela própria pessoa em `/esqueci-senha`, acessível pelo link «Esqueci a senha» no login (página própria e janela): e-mail com link de uso único válido por 1 hora, resposta que não revela contas existentes e envio só para contas ativas (conta pendente, desativada ou inexistente não recebe nada). Um pedido novo invalida os links de reset anteriores. Há limite por IP (5 por hora) e por e-mail (5 por 24 h, com hash do e-mail), campo isca e Turnstile opcional; se o provedor de e-mail falhar, a tentativa não consome o limite. Sem provedor de e-mail, a página orienta a usar o contato.
- Atalho «Pedir novo link» na página de reset quando o link expirou, já foi usado ou é inválido.
- Textos próprios para os erros de link `CONVITE_JA_USADO` («Este link já foi usado.») e `CONVITE_INVALIDO` («Este link é inválido.»), em pt-BR e en; antes caíam numa mensagem genérica.

### Changed

- O aviso de «você já tem conta» enviado no registo oferece também a recuperação de senha. O reset gerado pelo admin continua disponível e válido por 72 horas; um pedido novo de reset invalida links anteriores ainda abertos, inclusive os do admin.
- `validate_public_forms_startup` passa a exigir `TRUSTED_PROXY=true` também quando `EMAIL_API_KEY` está definido e `DEBUG=false`.
- `POST /api/auth/reset/confirmar`, em caso de link expirado, devolve `detalhes.tipo` no erro `CONVITE_EXPIRADO`.

### Fixed

- Redefinir a senha limpa o bloqueio de login do e-mail, permitindo entrar de imediato com a nova senha.

### Security

- `confirm_reset` deixa de reativar contas desativadas: um link emitido antes de o admin desativar a conta já não a reativa.

### Documentation

- README reorganizado: objetivo e escopo, papéis e permissões, aplicação multi-mestre e multi-campanha, arquitetura e funcionamento, configuração e operação, e o link de produção (<https://campaign-codex.1nodado.com.br>).
- Novas páginas de referência: `docs/api-contracts.md` (as 119 rotas, contratos principais, esquemas e códigos de erro) e `docs/flows.md` (15 fluxos de integração em Mermaid). O runbook `docs/runbook-registo-autonomo.md` ganhou a recuperação de senha.
- `.env.example` sem variáveis obsoletas (`ADMIN_USER`, `ADMIN_PASSWORD`, `VITE_MAP_URL` e `CODEX_INSTANCES_ROOT`) e com a ordem das variáveis (`TRUSTED_PROXY=true` antes de `EMAIL_API_KEY`).

### Operação

- Definir `TRUSTED_PROXY=true` **antes** de `EMAIL_API_KEY` em produção e staging. Com `DEBUG=false`, a API não arranca com a chave configurada e proxy não confiável.

## [1.4.0] — 2026-10-28

### Added

- Criação de conta pela própria pessoa (`/registo`): informa só o e-mail, aceita os termos e a política de privacidade e recebe um link de verificação válido por 5 horas, que leva à definição da senha. A resposta é sempre a mesma, quer o e-mail seja novo, pendente, ativo ou de uma conta desativada (não revela contas existentes); uma conta desativada pelo admin nunca é reativada pelo registo. Contas não confirmadas dentro das 5 horas são apagadas automaticamente (a cada 15 minutos) e há o comando `usuario limpar-pendentes`.
- Defesas contra spam e bots no registo: limite por IP (5 por hora), limite por e-mail com hash (3 por 24 h), bloqueio de domínios de e-mail descartável, normalização de aliases (`+etiqueta` e pontos do Gmail), campo isca e Turnstile da Cloudflare opcional. O registo vem **fechado** por padrão (`REGISTO_MODO=fechado`).
- Envio de e-mail pelo Resend (`EMAIL_API_KEY`, `EMAIL_FROM`), em pt-BR e en. O convite do admin continua válido por 72 horas e agora pode também ser enviado por e-mail. Em depuração (`DEBUG=true`) os e-mails vão para um arquivo (`EMAIL_LOG_FILE`) em vez de serem enviados.
- Página de contato (`/contato`), para qualquer pessoa, com ou sem conta: nome, e-mail para resposta, assunto e mensagem, entregues por e-mail ao administrador da instância (`CONTATO_EMAIL`), com resposta direta à pessoa. Nada é guardado na aplicação e nenhuma confirmação é enviada à pessoa. Tem limites por IP, por e-mail e por dia da instância (`CONTATO_LIMITE_DIARIO`, com teto próprio de `CONTATO_LIMITE_PRIVACIDADE` para a categoria de privacidade), campo isca, Turnstile opcional e no máximo 2 ligações por mensagem.
- Páginas de termos de uso (`/termos`) e de política de privacidade (`/privacidade`), em pt-BR e en, descrevendo os dados tratados e os serviços externos (Resend, DeepSeek quando a IA é usada, Turnstile quando ativo).
- Rodapé com a versão da aplicação e links para termos, privacidade e contato, nas páginas fora de uma campanha. Dentro de uma campanha não há rodapé.
- Teste de alinhamento da versão: falha se `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, o README e o CHANGELOG divergirem.

### Changed

- **Cota de armazenamento por campanha: de 10 GiB para 300 MB**, para todas as campanhas (existentes e novas), configurável por `COTA_PADRAO_BYTES`. Uma campanha que já esteja acima do limite continua legível e exportável, mas recusa novos uploads. Importar um pacote cujas imagens somem mais que a cota é recusado.
- Os erros 429 de limite de pedidos passam a seguir o formato da API (`{"detail": {"erro": "LIMITE_PEDIDOS"}}`, ou `LIMITE_REGISTO` no registo) e mostram a mensagem localizada, em vez de uma mensagem genérica.
- `EmailSender.send` devolve o resultado do envio e nunca propaga exceções.
- `scripts/test-fast.sh --frontend` passa a rodar o lint e os testes unitários do `frontend-v2`.

### Removed

- Os pacotes legados `frontend/` e `frontend-next/` foram removidos do repositório (o `frontend-v2` já era o único em produção). O seed dos testes e2e passou para `frontend-v2/e2e/seed_e2e.py`. O histórico continua no git.

### Database

- Migração do banco de controle `009_registo_cota`: define `cota_bytes = 314572800` em todas as campanhas (campanhas acima do novo limite são registadas no log), e adiciona as colunas `email_canonico` (indexada) e `termos_aceitos_em` à tabela `usuario`.

### Operação

- **Antes de definir `CONTATO_EMAIL`** em produção, defina `TRUSTED_PROXY=true`. Com o contato configurado, `DEBUG=false` e `TRUSTED_PROXY=false`, a API não arranca (senão todos os visitantes atrás do túnel dividiriam o limite de 5 pedidos por hora).
- Para abrir o registo (`REGISTO_MODO=aberto`), a API exige `EMAIL_API_KEY`, `PUBLIC_BASE_URL` em HTTPS, a origem de `PUBLIC_BASE_URL` em `CORS_ORIGINS` e `TRUSTED_PROXY=true`.
- O plano gratuito do Resend envia até 100 e-mails por dia, quota que o registo, o convite do admin e o contato dividem. Passo a passo em [`docs/runbook-registo-autonomo.md`](docs/runbook-registo-autonomo.md).
- Recomenda-se não divulgar o registo ao público amplo antes de existirem cotas de IA e um limite de campanhas por conta.

## [1.3.0] — 2026-10-27

### Added

- Índice de busca da campanha para a IA (SQLite FTS5, no banco de cada campanha): o contexto das assistências de escrita passa a ser composto por fios em aberto, sessões e arcos recentes, um catálogo compacto de nomes e os trechos mais relevantes ao pedido, em vez de ler a campanha inteira. O contexto deixa de crescer com o histórico, e o limite de tamanho continua valendo. O índice é mantido automaticamente a cada gravação e criado na primeira chamada de IA de campanhas existentes.
- Painel da campanha: seção «Índice da campanha» (com IA ativa) com o estado, as quantidades, a última atualização e a ação Reindexar, só para o mestre dono.
- Página «Fios» da campanha (`/c/{id}/{slug}/fios`), só para o mestre dono com o Modo GM ligado: a lista de fios narrativos ganha largura total, com cada fio como cartão expansível (título e estado à vista; descrição e ações ao expandir) e um item «Fios» na navegação.

### Changed

- Fios Narrativos: fios aceitos na proposta da IA a partir do editor de uma sessão já salva passam a ter essa sessão como sessão de origem, e aparecem no bloco «Fios Narrativos» dela. Fios já existentes não mudam.
- Resumo da sessão pela IA: o prompt deixa de pedir a seção de fios abertos ao final; o Resumo conta o que aconteceu e o estado do grupo.
- A lista de fios narrativos deixa de aparecer na página de Sessões; o link do bloco «Fios Narrativos» da leitura da sessão leva à página «Fios».
- Bloco «Fios Narrativos» da leitura da sessão: cada fio da sessão ganha as ações «Resolver» e «Reabrir», gravadas na hora e com o bloco reordenado (abertos antes dos resolvidos), sem sair da sessão. Falha ao gravar mostra um aviso e mantém o estado anterior.
- Linha do Tempo, modo «Por arcos»: arcos sem nenhuma sessão datada são posicionados pela sessão datada mais próxima por número, e arcos com a mesma data cujas sessões não se intercalam passam a ser tratados como sequência (sem bifurcação), ligados por traço tracejado, inclusive o arco sem data. Nenhuma data é inventada.
- Barra de navegação superior da campanha: entre 1024 px e cerca de 1280 px (abaixo de `xl`) mostra só os ícones, com o nome acessível em cada item, para não se sobrepor à identidade da campanha e aos controles quando o mestre dono vê os oito itens; os rótulos voltam a partir de `xl`.

### Database

- Migração de campanha `013_indice_ia`: tabela virtual FTS5 `indice_ia` e tabela `indice_ia_estado`. Se o SQLite não tiver FTS5, a migração não falha, o índice fica «indisponível» e a IA usa a leitura completa da campanha (comportamento anterior). Nesse caso um `.dump` de backup do banco pode falhar com a tabela virtual.

## [1.2.0] — 2026-10-27

### Added

- Assistente de IA para o mestre nos campos de texto livre (rascunho de sessão, resumo, descrições de personagem e de local), por campanha, só para o mestre dono e com revisão antes de salvar. Nada é gravado sem aceitação. O botão de IA também aparece ao criar um registro novo.
- Fios Narrativos: lista persistente e editável dos fios em aberto da campanha, só para o mestre dono. Cada fio tem título, descrição, estado (em aberto ou resolvido), origem (manual ou IA), sessão de origem opcional e posição, com criar, editar, reordenar, resolver, reabrir e remover. A IA pode propor fios a partir de todas as sessões, arcos, eventos, personagens e locais, com revisão item a item e gravação atômica dos aceitos. Os fios em aberto alimentam o rascunho de sessão da IA e entram na exportação, na importação e no backup da campanha.
- Leitura de sessão com blocos separados e recolhíveis de Notas de Preparo, Fios Narrativos e Resumo para o mestre em Modo GM, com moldura, cor e selo «Só para o mestre» nos blocos privados. O bloco de Fios mostra os fios criados na sessão e leva à lista completa. Jogadores, visitantes e o Modo GM desligado continuam vendo apenas o Resumo.
- `GET /admin/fios` aceita o filtro opcional `sessao_origem_id`, combinável com `estado`.
- Blocos de combate nas Notas de Preparo: callout `> [!combate] Título` com lista de Inimigos, Ambiente, Tática ou gatilho e Desfecho, exibido com cor própria, ícone e título na leitura da sessão. O rascunho de sessão da IA passa a propor combates nesse formato, sem estatísticas de regra, e o Resumo gerado não copia combates planejados como fatos ocorridos.
- Barra de formatação Markdown nos campos de texto rico (Notas de Preparo e Resumo da sessão; descrições de local, personagem, evento e item; notas mecânicas): negrito, itálico, título, listas, citação e link, com atalhos Ctrl/Cmd+B e Ctrl/Cmd+I, acessível por teclado e disponível em pt-BR e en. Nas Notas de Preparo, um botão insere o modelo do bloco de combate.

### Changed

- A lista «Fios em aberto» da página de Sessões passa a exigir o Modo GM ligado para o mestre dono.
- O contexto enviado à IA omite os blocos de combate das notas de preparo de outras sessões, para que um combate planejado não seja lido como acontecimento.
- **Atenção:** campanhas com o toggle de IA ligado passam a enviar conteúdo oculto (inclusive de entidades não visíveis aos jogadores) ao provedor DeepSeek nas assistências de escrita. A flag `usou_conteudo_oculto` na resposta indica quando isso ocorreu.

### Database

- Uma migração Alembic por campanha, sem alterar dados existentes: `012` cria a tabela `fio_narrativo`. Pacotes de exportação anteriores aos fios continuam sendo importados, com a lista de fios vazia.

## [1.1.0] — 2026-10-20

### Added

- Notas de preparo em Sessões: campo de texto Markdown, sempre privado ao mestre, que vive ao lado do resumo e não é apagado quando o resumo é preenchido. Nunca é servido em contexto de jogador, mesmo com a sessão visível.
- Ação «Preparar próxima sessão» no mestre: sugere o próximo número, abre o formulário com a sessão oculta aos jogadores (`visivel_para_todos=false`) e o foco nas notas de preparo. Não existe estado novo de rascunho: a sessão em preparo é uma sessão oculta.
- Na Linha do Tempo, o mestre vê a indicação de que uma sessão oculta tem notas de preparo registadas.
- Notas mecânicas em Personagens (PJ e NPC): campo Markdown livre, só para o mestre, no formulário de edição e no painel de leitura da Rede de Relações. Nunca aparece nas respostas públicas, independentemente de o personagem ser visível.
- Aba **Ferramentas** (só para o mestre) com quatro geradores de apoio: nome de PNG, rumor ou gancho, clima e ambiente, e item ou recompensa. O conteúdo respeita o `sistema` da campanha (`wfrp4e`, `wod`) e tem conjunto genérico de reserva para qualquer outro valor, sinalizado com o selo «Conteúdo genérico». Disponível em pt-BR e en; o sorteio evita repetir o resultado imediatamente anterior.
- Atalho «Enviar para preparo» em cada resultado dos geradores: o mestre escolhe uma sessão oculta (em preparo) e o resultado é acrescentado ao fim das notas de preparo dela, como item de lista rotulado (`- Rumor: …`). Nunca sobrescreve o texto existente, nunca oferece sessões visíveis e recusa o envio se a sessão for revelada entretanto. Sem sessão em preparo, orienta para «Preparar próxima sessão».

### Changed

- A barra de navegação ganha um item condicional, visível quando a pessoa tem permissão de mestre (`canEdit`), mesmo com o toggle de Modo GM desligado. Confirmado no mobile, com seis abas na barra inferior sem overflow até 320 px em pt-BR e en.
- O `sistema` da campanha passa a ser comparado sem distinguir maiúsculas e espaços nos geradores (`WFRP4e` e `wfrp4e` são o mesmo sistema).

### Database

- Duas migrações Alembic por campanha, sem alterar dados existentes: `010` adiciona `sessao.notas_preparo` e `011` adiciona `npc.notas_mecanicas`, ambas com valor padrão vazio. O caminho de bases legadas (`legacy_migrate`) acrescenta as mesmas colunas.

## [1.0.2] — 2026-10-17

### Added

- No modo Por arcos da Linha do Tempo, cada card de sessão passa a abrir a aba Sessões na sessão correspondente (`/sessoes?s={numero}`).

### Changed

- Em ecrãs estreitos, Sessões deixa de empilhar lista e descrição: sem `?s=` mostra só a lista; com `?s=` mostra só o detalhe, com atalho «Voltar à lista». No desktop, lista e painel continuam lado a lado.
- Lista de Sessões no mobile deixa de ser um carrossel horizontal e passa a lista vertical.

### Fixed

- No modo Por arcos, cards longos no mobile sobrepunham-se por causa do passo fixo de linha demasiado baixo. Cards mais compactos, tipografia e truncamento no mobile, e passo vertical alargado (`ROW_H = 112`).

## [1.0.1] — 2026-10-17

### Fixed

- No modo Por arcos da Linha do Tempo, a ligação tracejada entre arcos sequenciais deixava de aparecer: o gradiente usava `objectBoundingBox` e um traço vertical tem caixa de largura zero. O gradiente passa a `userSpaceOnUse`, com traço mais espesso e cantos arredondados.

### Changed

- O rótulo de tempo decorrido na ligação sequencial entre arcos fica rodado ao longo do traço, alinhado ao meio do intervalo.
- O nome e o brasão da campanha na barra superior passam a ser um atalho para **Explorar**.
- Barras de rolagem mais discretas no documento e nos painéis de Sessões (lista e descrição), no estilo do tema paper-parchment.

### Documentation

- README reescrito para a linha 1.0, com capturas do `frontend-v2` e diagramas dos fluxos de URL canónica, pernoite na rota e itens públicos.

## [1.0.0] — 2026-10-16

### Added

- Aba e tela públicas de Itens: listagem com busca, detalhe com descrição em Markdown e chips de sessões/eventos associados. O mestre vê também os ocultos, com indicação visual, e um atalho leva à Linha do Tempo para criar ou editar. Deep-link `?item=ID`.
- Rede de Relações com zoom e pan reais (roda, arrastar, pinça e "Ajustar à tela" a partir do conteúdo). Sem seleção, PJs ficam num anel interno e NPCs num anel externo; ao selecionar um Personagem, ele vai ao centro, vizinhos diretos no anel interno e os demais no externo, com a viewport centrada nele.
- Retratos de Personagem de volta na Rede de Relações: prévia no editor, imagem no painel de detalhe e retrato circular nos nós do grafo (com fallback para iniciais se a imagem falhar). Sem mudança de backend — o upload já existia.
- Marcadores de pernoite de volta no mapa de Rota: pin de "ao relento", destaque quando a noite é num Local, e coloração do traçado por fadiga do ritmo intenso. Regra nova: pernoite perto de uma cidade (raio em unidades do mapa) deixa de ser classificado como ao relento e passa a recuperar fadiga como noite local.
- Endereço canônico de campanha `/c/{id}/{slug}`. Links antigos `/c/{slug}/...` continuam resolvendo e a navegação corrige para a forma canônica. Colisão de slug na criação passa a devolver 409 de forma confiável, sem janela de corrida que gerava 500.
- No modo Por arcos da Linha do Tempo, ligação tracejada com gradiente e tempo decorrido entre arcos sequenciais, e curva automática quando uma coluna nasce por overlap de datas (sem exigir sessão de transição marcada).
- Na tela de Sessões (desktop), lista e descrição passam a rolar de forma independente: a descrição permanece visível enquanto se navega uma lista longa, e o contrário também.

### Changed

- No modo Por arcos, sessões do mesmo mês desempatam pelo número da sessão (mais recente acima). Sessões sem data deixam de ir para um bloco genérico no fim da lista: ficam no bloco do próprio arco, posicionadas pela data de referência do arco (a mais recente entre as sessões datadas dele), sem inventar data na sessão.

### Fixed

- Ordenação invertida entre sessões do mesmo mês no modo Por arcos, que produzia zig-zag visível em campanhas com vários empates de data.
- Arcos com mistura de sessões datadas e sem data deixavam as sem data misturadas no fim da lista com outros arcos; cada arco volta a aparecer como bloco contínuo.
- Arrastar (pan) a área vazia do grafo de Relações deixava de limpar a seleção; só um clique simples na área vazia desseleciona. Arrastar um nó também preserva a seleção.
- Marcador de pernoite no mapa ficava enorme e elíptico em mapas de alta resolução; passa a ter tamanho fixo em tela, sem distorção de aspecto.

## [0.24.5] — 2026-10-05

### Added

- No formulário de evento da Linha do Tempo, com o módulo de IA da campanha ligado, o mestre pode pedir uma sugestão de locais e personagens a partir da descrição. As opções correspondentes ficam marcadas para revisão e se somam às que já estavam selecionadas; o evento só é gravado ao salvar. Uma descrição em branco não dispara a sugestão. Referências inexistentes ou ocultas são descartadas, e uma falha da IA mantém a seleção que o mestre já tinha feito. A copy está em pt-BR e en.

### Changed

- A proposta de arco por IA passa a ler e resumir apenas sessões que ainda não pertencem a um arco. Sessões já associadas, e os locais e personagens ligados só a elas, deixam de entrar no texto enviado ao provedor. Se restarem menos de duas sessões livres, o motor avisa e não chama a IA. Uma sessão ocupada continua podendo ser indicada só como transição.

## [0.24.4] — 2026-10-05

### Added

- No formulário de sessão, com o módulo de IA da campanha ligado, o mestre pode pedir uma sugestão de locais e personagens a partir do resumo. As opções correspondentes ficam marcadas para revisão; a sessão só é gravada ao salvar. Um resumo em branco não dispara a sugestão. Referências inexistentes ou ocultas são descartadas, e uma falha da IA mantém a seleção que o mestre já tinha feito. A copy está em pt-BR e en.

## [0.24.3] — 2026-10-05

### Changed

- A passagem entre dois arcos vizinhos, quando as datas dos eventos não coincidem, fica tracejada e mostra o tempo entre eles. Dentro do mesmo arco a ligação continua contínua; o tracejado de mais de 12 meses nessa ligação mantém-se.

### Fixed

- No modo Por arcos, a lista começa pelo arco mais recente e, dentro dele, pela aventura de número mais alto. Sessões sem arco ficam no fim. A data do evento deixa de tirar uma aventura do seu arco.

## [0.24.2] — 2026-10-04

### Added

- Ao criar um arco, manualmente ou a partir de uma proposta de IA, a cor abre numa sugestão aleatória de uma paleta fixa, evitando as cores já gravadas na campanha. O mestre pode alterá-la antes de guardar. Editar um arco mantém a cor gravada. Se a paleta estiver esgotada, a criação continua e a sugestão pode repetir uma cor.

### Changed

- Modo Por arcos deixa de reservar uma coluna por arco. A história linear fica numa única coluna vertical, mesmo quando as sessões mudam de arco. Uma coluna nova, com curva contínua no estilo de um grafo de git, só aparece quando a data de uma sessão cai entre a mais antiga e a mais recente de outro arco, ou quando duas sessões de arcos diferentes têm a mesma data. A coluna que continua mantém o traço vertical. Cada ligação mostra o tempo entre as datas dos eventos, em pt-BR e en; um intervalo de mais de 12 meses fica tracejado.
- "Gerenciar arcos" sai do menu de ferramentas do mapa e passa para o cabeçalho da Linha do Tempo, visível com o modo de edição ligado, nos três modos da página. O jogador não vê o controlo.

### Fixed

- Abrir mesa a partir do Painel carrega o mapa dessa campanha na primeira navegação, sem refresh e sem "Falha ao carregar dados", inclusive quando a configuração já está em memória. Trocar de página dentro da campanha e abrir outra campanha a seguir usam o slug da rota atual (BUG-004).

## [0.24.1] — 2026-10-04

### Fixed

- A imagem Docker da API não instalava `httpx` (estava só nas dependências de teste) e o contentor encerrava ao importar o motor de arcos. `httpx` passa a ser dependência de produção.

## [0.24.0] — 2026-10-04

### Added

- Seletor na Linha do Tempo com três modos: cronológica (padrão ao abrir a tela), Por arcos e Por descoberta. A escolha vale só enquanto a pessoa está na tela — não é configuração da campanha e não volta na visita seguinte. Os dois modos novos ficam disponíveis para mestre e jogador, mesmo vazios.
- Modo Por arcos: uma raia vertical por arco, sessões mais recentes acima, tempo decorrido entre sessões da mesma raia e intervalo longo em ligação tracejada. Sessão sem arco continua numa raia neutra "Sem arco". Filtro por arco sem teto de seleção. Campanha sem arcos explica o vazio e oferece a volta à cronologia.
- Arco com cor persistida e vínculo com sessões existentes. Uma sessão pertence a no máximo um arco, exceto a sessão de transição, que encerra um arco e abre o seguinte e aparece nas duas raias sem duplicar o registo.
- Criação de arco manual ou por IA. A manual continua sempre disponível. Sem o módulo ligado, a escolha por IA explica o estado e aponta a configuração ou o formulário manual.
- Módulo "IA para sugerir arcos" no Painel (`ia_arcos`), desligado por padrão. Com ele ligado, o mestre recebe uma ou mais propostas (título, resumo, sessões e locais sugeridos) no mesmo formulário da criação manual. Nada é gravado até confirmar; dá para editar qualquer campo ou descartar. Sessões insuficientes e falha do provedor avisam e oferecem a criação manual.
- Chamadas de IA só para o mestre da campanha, só com dados dessa campanha e nunca com conteúdo oculto. A credencial do provedor fica em `DEEPSEEK_API_KEY` e não entra em resposta, log do cliente nem mensagem de erro. Indisponibilidade, erro ou tempo esgotado devolvem falha explícita sem corromper o que já estava gravado.
- Modo Por descoberta: personagens, locais, facções e itens agrupados pela primeira aparição, com reaparições e o tempo desde a aparição anterior. Filtro por tipo. Para o jogador, sessão ou evento oculto não conta como aparição. Itens são entidade nova, com cadastro pelo mestre.

### Fixed

- No modo Por arcos, o rótulo da primeira sessão (por exemplo "1. Sessão inicial") ficava cortado acima da área da linha do tempo. O texto passa a alinhar com o ponto da sessão, dentro da área visível.

## [0.23.0] — 2026-09-25

### Added

- Tema claro e escuro disponível em todos os gêneros de campanha; o modo Automático acompanha a preferência do dispositivo (spec 150).
- Associação de PJs e NPCs a Locais, com identificação do tipo e respeito às permissões e regras de visibilidade existentes (spec 151).

### In Progress

- Iniciada a spec 152 para otimizar a execução dos testes, com perfil rápido e análise dos gargalos; trabalho ainda não concluído.

## [0.22.2] — 2026-09-24

### Added

- Estado de exploração persistente para locais (`Conhecido`/`Visitado`), com migração dos registros existentes baseada em `data_sessao`.

### Fixed

- Alternância entre Conhecido e Visitado sem alterar a cor do pin ou o rótulo da sessão (BUG-002).
- Rolagem da lista completa de sessões em desktop e mobile (BUG-003).

## [0.22.1] — 2026-09-24

### Fixed

- Seleção de personagem no Mapa e em Relações: o rastreamento de foco passou do cabeçalho para toda a superfície do `MapSidePanel`, evitando que o painel recolhesse antes do clique na lista e impedisse abrir a ficha / selecionar o nó (BUG-001).

## [0.22.0] — 2026-09-24

### Changed

- Dono pode alterar o tema visual (gênero) de uma campanha existente no Painel; `PATCH /api/campanhas/{slug}/genero` grava a escolha e a mesa/cartões passam a refletir o tema salvo (antes imutável após a criação).

### Fixed

- Seleção de personagem no Mapa abre a ficha correspondente; em Relações, escolher pela lista ou pelo nó do grafo mantém o mesmo personagem selecionado e os detalhes no painel (BUG-001).

## [0.21.1] — 2026-09-24

### Changed

- Listas de personagens no Mapa e em Relações passam a mostrar o retrato cadastrado no avatar (fallback para iniciais se não houver imagem ou se o carregamento falhar), no mesmo padrão circular dos tokens do grafo.

## [0.21.0] — 2026-09-24

### Added

- Linha do Tempo da campanha: entidade Evento (ano, mês opcional numeral livre, era, descrição, vínculos a locais/personagens/sessão), menu ao lado de Sessões, consulta ordenada (`ano` → `mês` → sessão → `id`) e CRUD mestre; export ZIP de eventos fora de escopo nesta versão.

### Changed

- Linha do Tempo alinhada ao protótipo: subtítulos por papel, cards colapsáveis (resumo: ano/mês, era, título e sessão; detalhe: descrição e associações) com tokens `surface-2`/`accent`, nota de eventos não revelados para jogador, e mês oculto no formulário sem apagar valores legados.
- Filtros de tipo em Relações: uma seleção partilhada entre SidePanel (lista/detalhe) e Grafo; conjunto vazio = todos os tipos; status restringe personagens e busca destaca sem ocultar nós.
- Filtro de tipos no painel de detalhe de Relações agora usa o mesmo clique com atraso (280 ms) e duplo-clique para isolar/restaurar tipos que o filtro do grafo.
- Hover no token do personagem no grafo de Relações reutiliza o mesmo preview (`hoveredId`) da lista lateral, destacando os vínculos do personagem.
- Passar o mouse sobre a linha de vínculo no grafo de Relações já não mostra rótulo mid-edge; rótulos no foco (seleção/preview) e clique para editar permanecem.
- Retrato no painel de detalhe de Relações preenche a largura do painel com proporção preservada (max-height 140px), sem moldura dashed de placeholder.
- Distância entre tokens no grafo de Relações reduzida ~30% (overview 84, foco 168); factores compact/sparse 086–089 inalterados.
- Controlo de vista no grafo de Relações ajusta escala/pan para caber todos os tokens visíveis (ex-«1:1»; rótulo i18n «Ajustar»/«Fit»).
- Campo `sistema` da campanha aceita qualquer nome (criação e import); defaults de módulos `wfrp4e`/`wod` inalterados.

## [0.20.3] — 2026-09-23

### Fixed

- Adicionei SQLModel.metadata.create_all(conn, checkfirst=True) no início da ponte — cria qualquer tabela que esteja totalmente faltando (com o schema atual completo), sem tocar nas que já existem.
- Adicionei o ALTER TABLE local ADD COLUMN visivel_para_todos que faltava — mesmo padrão que já existia pra npc.
- Por precaução, adicionei o mesmo patch pra arco e sessao (mesma coluna, mesmo padrão) — já que esse exato bug já apareceu uma vez, é barato garantir que não se repete nas outras três tabelas que têm essa coluna.

## [0.20.2] — 2026-09-23

### Fixed

- O Dockerfile só copiava app ./app, mas nunca copiava as pastas alembic_control/ e alembic_campaign/ (onde vivem as migrações reais) — confirmei que _BACKEND_ROOT em backend/app/campaign_db.py#L20 resolve pra /app dentro do container, e o código espera /app/alembic_control existir ali. Provavelmente um esquecimento de quando essas pastas de migração foram adicionadas depois que o Dockerfile já existia.

## [0.20.1] — 2026-09-23

### Fixed

- Código incompleto em GraphStage.tsx, relacionado exatamente ao trabalho da spec 128 (auditoria de paridade de Relações, BKLG-018) — alguém começou a cablear um aria-label acessível pra GM identificar vínculos privados/secretos no grafo, mas a função nunca foi escrita, e sobrou um estado não utilizado.

## [0.20.0] — 2026-09-23

### Added

- Home marketing em `/`, catálogo público em `/explorar`, e `CampaignCard` partilhado no Painel (`/painel`) — mesmos cartões em Landing featured, Explorar e gestão GM; criar/importar preservados via `#criar` (spec 119)

### Changed

- Rede de rotas: entrada GM na página Rota (botão topo); removida do menu de ferramentas do Mapa; casca do digitalizador alinhada aos tokens pós-115 (zoom pílula/círculo, chips de modo, lista/escala) — comportamento de digitalização inalterado (spec 118)

### Removed

- `frontend/src/styles/nocturne.css` — controlos migrados para o kit `components/ui` (Button/Chip/SegmentedControl/Dialog/Field); tipografia/foco/`text-muted` e chrome de formulário absorvidos em `global.css` / `ImageSlot.css` (spec 117)

### Added

- Relações e Rota no painel flutuante partilhado (MapSidePanel 115): lista↔detalhe e planejador com cartões; destaque da rota com acento da campanha; FAB de edição em Relações; `/rota` canónico (spec 116)
- Mapa reconstruído: painel flutuante (busca pílula + chips Tudo/Locais/Personagens + lista ↔ detalhe), sem coluna SideMenu nem PinModal; zoom em botões circulares; FAB + em Modo edição; ferramentas GM (rede de rotas, NPC/arco, mover grupo) em menu compacto (spec 115)
- Cabeçalho da mesa reconstruído (paridade com protótipo): marca + seletor de campanha à esquerda, abas Mapa/Relações/Rota/Sessões centradas, Modo edição em pílula, tema Auto/Claro/Escuro, barra inferior com 4 abas; contentor mínimo `/c/:slug/rota` (spec 114)
- Revelação progressiva de Local e Arco: `visivel_para_todos` (default true); filtros públicos (mapa/lista/saídas/`arco_id`/`local_ids`/chips de sessão/media `locals/`/waypoints); Modo edição com toggle e badge oculto; sem ACL por jogador nem cascade ao ocultar arco (spec 113)
- Crônica de sessões: entidade `Sessao` em `campanha.db` (número único, título, rótulo de data, resumo Markdown, N:N locais/personagens, `visivel_para_todos`); API pública/admin; página `/c/:slug/sessoes` com chips deep-link; nav Sessões no chrome; export/import (spec 112)

### Changed

- Identidade da campanha: **género** (`fantasia|gotico|scifi|urbano`) obrigatório e imutável na criação substitui o acento solto (108); migração com backfill WFRP→fantasia / WoD→gótico; mesa via `data-genre`; Painel com 4 cards + pré-visualização ao vivo; capa via `PATCH …/capa`; export/import preserva `genero` (pacotes antigos com `acento_id` mapeados) (spec 111)
- Paridade visual com protótipo fantasia (`frontend-next`): paleta base claro/escuro, `--radius-full` + pílula em botões/chips/tags/busca, sombras suaves, `--space-7` 48px, Cormorant Garamond local em títulos display; contraste sem regressão vs baseline pré-110; baselines Playwright reaprovadas (spec 110)

### Added

- Qualidade UX-10: teclado mapa/grafo via lista+controlos, Tab-trap no Drawer, aria-live no planejador, alvos ≥44px em móvel, reduced-motion; Playwright + axe (só `critical` falha) + capturas (desktop claro/escuro + mobile claro, pt-BR+en); CI `frontend-quality.yml` (spec 109)
- Identidade UX-9: paleta de 5 acentos AA, capa (`covers`), configuração no painel, token na mesa, cartões na home; export/import (spec 108)
- Formulários UX-8: Drawer (direita / bottom mobile) para local, NPC, arco, personagem e vínculo; validação inline; ConfirmDialog se sujo; Markdown com separadores Escrever/Pré-visualizar (spec 107)
- Planejador UX-7: chips de opções (todos os grupos), tempo dias+h, distância mi/km por campanha, meta Via/Fora da via + bp, timeline de pernoites na rota seleccionada; digitalizador com tokens (spec 106)
- Rede de Relações UX-6: 4 famílias de cor + estilos de linha, chips com amostra na coluna, arestas curvas, rótulos só hover/selecção, nós Tab/Enter, detalhe sem placeholder/«Sem descrição.» (spec 105)
- Listas UX-5: locais por arco (recolhíveis), linhas compactas, NPCs com avatar + status ponto/texto, EmptyState; listas admin Locais/NPCs/Arcos com hover+⋮ e ConfirmDialog (spec 104)
- Mapa UX-4: controlos translúcidos (canto inferior direito), pinos por forma (visitado/conhecido via `data_sessao` + cor do mestre), nomes no limiar/hover, popover sem dimming nem «Sem descrição.», legenda recolhível (spec 103)
- Chrome UX-3: barra de topo partilhada (marca «Campaign Codex» → `/`, tabs Mapa/Relações, nome da campanha, menu com tema Auto/Claro/Escuro em `localStorage`, «Modo edição» único), barra inferior móvel só Mapa/Relações; config pública inclui `slug`/`nome` (spec 102)
- Componentes base UX-2: kit `frontend/src/components/ui` (Button, Dialog, Drawer, ConfirmDialog, Toast imperativo, etc.), `@tabler/icons-react` (~+4 kB gzip no bundle JS vs UX-1), substituição dos 10 `window.confirm`/`alert` (spec 101)
- Fundações do sistema visual (UX-1): tokens RFC com `data-theme` dark/light (sync com `prefers-color-scheme`), Inter local, `/__styleguide` só em dev, gates `npm run lint:tokens` e `npm run test:contrast` (spec 100)
- Import legado de instância (`mapa.db` + `uploads/`): CLI `campanha importar-legado`, relatório de verificação, snippets `scripts/imprimir-snippets-codex.sh`; `nova-campanha.sh` / `migrar-wfrp.sh` aposentados (spec 099)
- Página inicial `/` (catálogo público `listada`) e painel `/painel` (minhas campanhas = dono): criar, visibilidade, cota, export/import UI; APIs `GET /api/campanhas/catalogo|minhas`, `POST /api/campanhas`, `PATCH …/visibilidade`; pós-login → `/painel` (spec 098)
- Exportar/importar campanha: zip (`manifest.json` + `content.json` + imagens), `GET …/admin/export` (só dono), `POST /api/campanhas/import`, CLI `campanha exportar|importar`, `require_dono` (spec 097)
- Mídia com ACL e cota: `GET /api/c/{slug}/media/…`, mapa versionado (`mapa_arquivo`), cota 300 MiB + `COTA_EXCEDIDA` / aviso 90%, CLI `campanha reconciliar-cota` (spec 096)
- Contas de mestre: CLI `usuario criar|reset|desactivar`, `campanha atribuir-dono`, sessão cookie `codex_session`, `/api/auth/*`, lockout 5/15 min, FE `/login` `/convite/:token` `/reset/:token` (spec 095)
- Roteamento por campanha: API `/api/c/{slug}/…`, frontend `/c/:slug` e `/c/:slug/relacoes`, config/cache por slug (spec 094)
- Multi-campanha por ficheiro: `control.db` + `data/campanhas/<uuid>/{campanha.db,uploads/}`, Alembic dual, CLI `campanha criar|listar` (spec 093)
- Suíte pytest do backend: caracterização 092 adaptada ao prefixo; isolamento HTTP A/B (spec 092–094)

### Changed

- Admin API: `require_membro` (cookie + membership) substitui HTTP Basic Auth; Caddy do repo sem `basicauth` GM (spec 095)
- Leitura de imagens: `/uploads/c/…` → **404**; cliente e API usam `/api/c/…/media/…` (spec 096)
- Deploy: uma instância Campaign Codex substitui `nova-campanha.sh` + hub 078 como procedimento corrente (spec 099)

## [0.19.1] — 2026-08-14

### Changed

- Rede de Relações: chave PJ/NPC e tipos de vínculo no canto inferior esquerdo do palco (como no mapa); lista vertical compacta, sem fundo; a coluna já não tem bloco de legenda (spec 091)

## [0.19.0] — 2026-08-14

### Added

- Rede de Relações: filtro de estado (Todos / Vivos / Mortos / Desconhecidos / Desaparecido) na coluna, junto a Isolar; palco e lista recalculam só com quem passa no filtro (spec 090)

## [0.18.3] — 2026-08-14

### Changed

- Rede de Relações: anel interior de foco com 3 ou menos conexões mais aberto (folga 240→312) para melhor leitura (spec 089)

## [0.18.2] — 2026-08-14

### Changed

- Rede de Relações: anel interior de foco com mais de 6 conexões ainda mais compacto (folga 160→112); textos dos vínculos nas linhas continuam legíveis (spec 088)

## [0.18.1] — 2026-08-14

### Changed

- Rede de Relações: vista geral (sem selecção) mais compacta — folga 240→120; discos e nomes não se sobrepõem; layout de foco inalterado (spec 087)

## [0.18.0] — 2026-08-14

### Added

- Rede de Relações: lista de personagens (PJ e NPC) na coluna, abaixo dos tipos de vínculo, com scroll e clique igual ao disco; hover no nome destaca o disco e as conexões directas visíveis; anel interior mais compacto só no foco com mais de 6 conexões (spec 086)

## [0.17.1] — 2026-08-13

### Changed

- Paleta de vínculos: **Vínculo de Sangue** passa a borgonha `#9e2436`; **Inimizade** passa a magenta/fúcsia `#d12d9a`; **Adversário** mantém cobre `#c86b3c` (spec 085)

## [0.17.0] — 2026-08-13

### Added

- Personagens com **Visível para todos** (default ligado): desligado = só o GM vê o personagem e as suas conexões; distintivo no grafo + checkbox no formulário (spec 084)
- Listagens admin de personagens/NPCs/locais para o Modo GM incluir ocultos; APIs públicas filtram personagem, vínculos e `npc_ids` de locais

## [0.16.2] — 2026-08-13

### Fixed

- Sem imagem de mapa: jogadores vão para Relações e o botão «Mapa» fica oculto; o GM (após acesso restrito em Relações) continua a poder abrir o Mapa para enviar a imagem; sair do modo GM no Mapa sem imagem redirecciona para Relações (spec 083)

## [0.16.1] — 2026-08-13

### Changed

- Seletor de idioma: combo-box (sigla + chevron + lista) substitui o par de botões PT/EN na barra superior (spec 082)

## [0.16.0] — 2026-08-13

Rede de Relações: dois tipos de vínculo novos (spec 081).

### Added

- Tipos **Adversário** (`adversario`, cobre `#c86b3c`) e **Vínculo de Sangue** / **Blood Bond** (`vinculo_sangue`, violeta `#6a3d8c`) — formulário GM, grafo, filtros e legenda (8 tipos)
- Qualificador **Lacaio** nas sugestões de Aliado e Vínculo de Sangue; Adversário reutiliza as de Inimizade
- Ao seleccionar Vínculo de Sangue em modo recíproco, direcção pré-preenche A→B (editável)

### Changed

- Ordem canónica: Aliado → Vínculo de Sangue → Amizade → Inimizade → Adversário → Romance → Família → Conhecido

## [0.15.0] — 2026-08-13

Codex **v2.0.0 — Frente D**: internacionalização da interface (spec 080).

### Added

- **i18n**: PT-BR + EN via `react-i18next`; detecção por prefixo (`pt*` / `en*`); seletor PT/EN no `CodexHeader`
- **Locales**: namespaces `comum`, `mapa`, `relacoes`, `admin` (bundled no build)
- **Erros API**: códigos estruturados `{ erro, detalhes }` nos erros surfaced; frontend mapeia para `comum:errors.*`

### Changed

- Mapa, Relações, digitalização de rotas e diálogos GM traduzidos; conteúdo do mestre inalterado
- Hub estático (`hub/`) permanece PT-only (follow-up planeado)

## [0.14.0] — 2026-08-13

Codex **v2.0.0 — Frente C**: UX Nocturne e débitos (spec 079).

### Added

- **Digitalização**: coluna lateral (~236px) com busca, secções Waypoints/Arestas colapsáveis e clique para centrar no mapa; ≤800px vira bottom sheet retrátil
- **Rede**: pinch-zoom nativo (`usePinchZoom`) no palco do grafo, partilhando o mesmo `scale` que a roda
- **Nocturne**: tokens `--elevation-column`, `--elevation-panel`, `--elevation-modal`; agrupamento `.dialog__group` nos diálogos GM (personagem, vínculo, local, NPC, arco)

### Changed

- Colunas e painéis separam por elevação (sombra) em vez de borda pesada; accent blurple reservado a interactivos
- Backdrop de diálogos escurecido (~55% preto); Mapa confirma pinch via `react-zoom-pan-pinch`

## [0.13.0] — 2026-08-13

Codex **v2.0.0 — Frente B**: multi-deploy e hub índice (spec 078).

### Added

- **Scaffold** `scripts/nova-campanha.sh`: pasta `codex-<slug>`, `.env`, override Compose, snippets Caddy/cloudflared/hub (não aplica proxy nem sobe containers)
- **Hub** estático em `hub/` com fetch de `campanhas.json` em runtime
- **Migração WFRP** `scripts/migrar-wfrp.sh` → `codex-wfrp` (copia dados; não edita Caddy nem o JSON do hub)
- **Runbook** `docs/runbook-instancias.md` (`git pull` + rebuild por pasta)

## [0.12.0] — 2026-08-13

Codex **v2.0.0 — Frente A**: motor agnóstico de sistema (spec 077).

### Added

- **Config por deploy**: `SISTEMA` e `MODULOS_ATIVOS` (defaults por sistema; override explícito); `GET /api/config` público com `sistema`, `modulos_ativos`, `has_map_image`
- **Personagem**: `extensoes_mecanica` JSON (primeiro módulo: **fadiga** 0–6 na ficha GM); chaves inactivas ignoradas silenciosamente na API
- **Landing**: instância sem ficheiro de mapa abre em **Relações** (`has_map_image: false`)
- **GM**: aviso discreto quando módulo activo no `.env` ainda não tem widget

### Changed

- Migração deploy-1: coluna `extensoes_mecanica`; copia legado `npc.fadiga` se existir (deploy-2: `MIGRATE_DROP_LEGACY_FADIGA=true` após validação prod)

## [0.11.1] — 2026-08-13

### Changed

- **Relações**: qualificador **por sentido** (`qualificador_ab` / `qualificador_ba`); em duas vias cada extremo mostra `Tipo (Qual)` (ex. `Inimizade (Medo)` / `Romance (Admiração)`); formulário GM com um campo por sentido; seta de direção no meio sem qualificador órfão (spec 076)

## [0.11.0] — 2026-08-12

### Added

- **Relações**: **qualificador** opcional (autocomplete por tipo + Medo em todos) e **direção** opcional (mútuo / A→B / B→A) nos vínculos; etiquetas e ficha mostram `Tipo (Qual)` e seta quando aplicável; em duas vias, tipos nos extremos e qual/seta no meio (spec 075)

## [0.10.1] — 2026-08-12

### Changed

- **Relações**: duplo clique num chip de **Tipos de vínculo** isola só esse tipo; outro duplo clique no mesmo chip restaura todos (spec 074)

## [0.10.0] — 2026-08-12

### Added

- **Relações**: em vínculos **duas vias**, o GM marca cada sentido como **conhecido** pelos jogadores ou só para o mestre; o interruptor **público** do par continua a mandar; jogadores vêem 0/1/2 vias (uma via conhecida aparece como recíproco); a API pública omite tipos secretos (spec 073)

## [0.9.1] — 2026-08-12

### Changed

- **Relações**: lista de vínculos na ficha ordenada A→Z pelo nome do outro personagem (locale `pt`); personagens sem nome resolvido ficam no fim (spec 072)

## [0.9.0] — 2026-08-12

### Added

- **Relações**: vínculos de **duas vias** — cada personagem pode ver o outro com um tipo diferente (ex.: aliado vs romance); linha com fade entre as duas cores e etiquetas nos extremos; ficha mostra “eu vejo” e “vê-te como…”; formulário GM com modo Recíproco / Duas vias (spec 071)

## [0.8.4] — 2026-08-11

### Fixed

- **Relações**: descrição longa já não esmaga o retrato na ficha ao seleccionar um personagem; a folha faz scroll e a imagem mantém-se `contain` até 220px (spec 070)

## [0.8.3] — 2026-08-11

### Changed

- **Relações**: discos com retrato mostram a foto a preencher o círculo (recorte centrado); sem retrato ou imagem a falhar, mantêm-se as iniciais (spec 069)
- **Relações**: com um personagem seleccionado, as linhas que não são do foco descem de ~18% para ~8% de opacidade (as do foco mantêm ~90%)

## [0.8.2] — 2026-08-11

### Changed

- **Relações**: linhas da rede visíveis a ~18% sem selecção; após a animação de foco, arestas do personagem a ~90% e as restantes ténues (spec 068)

## [0.8.1] — 2026-08-11

### Fixed

- **Relações**: linhas de vínculo ancoram no centro do disco (não no bloco nome/papel); etiquetas no médio disco–disco (spec 067)

## [0.8.0] — 2026-08-11

Rede de Relações: segunda aba do Codex com grafo PJ/NPC, vínculos tipados e visibilidade pública controlada pelo GM (spec 066).

### Added

- **Relações** (`/relacoes`): anéis PJ/NPC, selecção com animação, linhas só após foco; filtros, isolar, painel de detalhe
- **Personagem** unificado (evolui NPC): `tipo` pj|npc, `papel`; APIs `/api/personagens` (+ aliases `/api/npcs`)
- **Vínculo**: tipos (aliado, amizade, inimizade, romance, família, conhecido), nota, flag `publico` (default false); jogadores só vêem públicos
- **GM**: + Personagem / + Conexão; editar linha/lista; apagar personagem com cascade de vínculos
- Nav partilhada **Mapa | Relações** (`CodexHeader`); seed Ubersreik (~4 PJs, ~7 NPCs, ~15 vínculos)

### Changed

- Formulário de NPC no mapa inclui **papel**; lista do mapa exclui personagens `tipo=pj`

## [0.7.0] — 2026-08-07

Planeamento de viagem com pernoites, fadiga no mapa e Calcular rota no menu lateral (specs 062–065). As notas intermédias 0.6.11–0.6.14 ficam documentadas nesta release.

### Added

- **Pernoites**: simulação alinhada ao tempo publicado da rota (dias de marcha M a partir de D/R; orçamento diário = milhas ÷ M; no máximo M−1 paragens); Local dentro de ±20% do orçamento diário ou ao relento; chegada não conta como pernoite
- **Fadiga (ritmo intenso)**: +1 por dia de marcha, −1 com noite em Local; saldo/pico na API; no mapa, trechos residuais em vermelho mais escuro conforme o saldo (até o máximo da escala); hover no segmento indica ganho de fadiga
- **API**: `pernoites`, campos de fadiga e `dias_visuais` (geometria por dia, `residual`, `fadiga_apos`) em cada item do plano
- **Mapa**: pin azul pequeno ao relento; badge de pernoite no pin de Local existente (sem segundo pin)
- **UI**: separador **Rota** no menu lateral (paridade com Locais/NPCs/História); mapa-pick De/Para e overlay de viagem só com Rota activo
- `Settings.tolerancia_pernoite_pct` (default 0.20)

### Changed

- **Calcular rota**: painel flutuante removido; lista sem resumos textuais de pernoite/fadiga (só meta de viagem — distância/tempo/custos)
- **Mapa**: rota seleccionada em vermelho base; alternativas tracejadas/mais claras; fadiga escurece o vermelho nos dias residuais

## [0.6.10.1] — 2026-08-06

Correcção do versionamento e do build Docker do mapa → Calcular rota (060/061).

### Fixed

- **Versionamento**: specs 060 e 061 ficam documentadas e publicadas como **0.6.10** (sem release intermédia 0.6.11); manifests alinhados a **0.6.10.1**
- **Build frontend**: erro TypeScript em `RoutePlannerPanel` (comparação `number` vs `''`) que quebrava `npm run build` no Docker

## [0.6.10] — 2026-08-06

Calcular rota: seleccionar origem/destino no mapa (estilo Directions) e calcular automaticamente.

### Added

- **Calcular rota**: com o painel aberto, clicar num pin de Local preenche De (se vazio) ou Para; ao completar ambos, o cálculo corre automaticamente; pin sem nó correspondente no combobox abre o detalhe como antes; sem zonas clicáveis novas; combobox e botão Calcular continuam disponíveis

### Fixed

- **Calcular rota**: o pin resolve o nó também por nome (além de local_id), para cidades que já aparecem no combobox — deixa de abrir só o modal sem preencher De/Para

## [0.6.9.1] — 2026-08-05

Imagens de Locais no pin modal e no formulário GM sem corte fixo (mesma política dos retratos de NPC).

### Fixed

- **Locais (pin modal)**: imagem do local acompanha a proporção (shrink-to-fit), com altura máxima ~50% da viewport; sem imagem não mostra caixa vazia
- **Locais (modo GM)**: caixa da imagem no formulário criar/editar com o mesmo sizing; upload continua editável; placeholder vazio mantém zona de drop utilizável

## [0.6.9] — 2026-08-05

Calcular rota com preferência de via, painel mais limpo e cobertura de tipos puros; retratos de NPC no menu e na edição sem corte fixo.

### Added

- **Calcular rota**: preferência de via Sem preferência (default) / Por rio / Por estrada — enviesamento suave (rotas mistas permitidas); abrir o painel repõe Sem preferência; mudar a preferência recalcula
- **Calcular rota**: bloco Opções de viagem colapsável (recolhido por omissão) com resumo só de não-defaults; ordem De → Para → Calcular → Opções → Resultados

### Changed

- **Calcular rota**: resultados em título + linha de meta; rótulos Pago/Próprio e Normal/Intenso (h/dia como apoio)

### Fixed

- **Calcular rota**: se a rede tem um caminho contínuo só de um tipo (ex. Estrada Altdorf→Ubersreik), essa alternativa pura entra na lista de até 6 mesmo sob Mais rápida; preferência de via não suprime tipos puros opostos
- **NPCs (menu lateral)**: retrato no cartão expandido acompanha a proporção da imagem (shrink-to-fit), com altura máxima ~50% da viewport; miniatura circular inalterada
- **NPCs (modo GM)**: caixa do retrato no formulário criar/editar com o mesmo sizing; upload continua editável; placeholder vazio mantém zona de drop utilizável

## [0.6.8] — 2026-08-05

Rede de rotas com traços mais finos; Calcular rota com transporte pago vs próprio. Tentativas de realinhar pins no móvel (que partiam o desktop) foram revertidas — o mapa da campanha mantém o alinhamento estável anterior.

### Added

- **Calcular rota**: escolha Transporte pago (tabela de velocidades/custos) ou Transporte próprio (velocidade desejada default 4 mi/h, custos Dentro/Fora 0); abrir o painel volta a pago; mudar o modo recalcula; editar só a velocidade não recalcula sozinho

### Changed

- **Rede de rotas**: stroke normal/draft ~1.0 e hover ~2.3 (antes 1.5 / 3.5); hit-area de hover inalterada; mapa da campanha e overlay de rota sem mudança

## [0.6.7] — 2026-08-04

Calcular rota: ordenar por mais rápida ou mais barata (até 6 alternativas).

### Added

- **Calcular rota**: opção Ordenar por Mais rápida / Mais barata (default rápida); até 6 rotas para o critério; mais barata usa custo Dentro; mudar a preferência recalcula automaticamente

## [0.6.6] — 2026-08-04

Rede de rotas: segment-hover só em idle — desligado ao colocar nó ou traçar segmento.

### Changed

- Rede de rotas: em **Novo nó** e **Traçar segmento**, o hover de segmento (tooltip, destaque na lista e hit largo) fica desligado para não interferir com colocação/desenho; em idle o comportamento de 0.6.5 mantém-se

## [0.6.5] — 2026-08-04

Rede de rotas: aura/snap dos nós, traços mais finos, fecho mais apertado e hover com identidade do segmento.

### Added

- Rede de rotas: aura visível em cada nó (zona clicável); origem activa continua distinta
- Rede de rotas: ao passar o rato sobre um segmento gravado, tooltip com extremos/tipo/distância e destaque (com scroll) da linha correspondente em Segmentos; traço enfatizado; hover não apaga

### Changed

- Rede de rotas: snap de origem mantém folga útil; snap de fecho ~metade — com draft aberto a aura encolhe para coincidir com a zona de fecho; sem draft, aura de origem
- Rede de rotas: linhas de segmento (gravadas e rascunho) mais finas (~60% da espessura anterior) para alinhar melhor ao mapa

## [0.6.3] — 2026-08-04

Menu lateral (scroll e busca), marcadores mais compactos com tamanho fixo no zoom, botão para ir ao grupo, e De/Para só com nós nomeados.

### Added

- Menu lateral: filtro de busca em Locais, NPCs e História (jogador e GM; case/accent-insensitive); História casa título do arco ou nome de local ligado; busca oculta na aba Grupo
- Controlo “Ir ao grupo” no cluster de zoom (+/−/1:1): recentra o pin do grupo no viewport; oculto quando não há posição de grupo

### Fixed

- Menu lateral: scroll do corpo das abas (cadeia de altura flex/grid) para listas longas não ficarem cortadas

### Changed

- Mapa e Rede de rotas: pins, grupo e nós mais compactos (~60% da área anterior); tamanho aparente no ecrã fixo face ao zoom; ênfase de selecção/hover mantida a partir do novo tamanho base
- **Calcular rota**: listas De/Para omitem nós sem nome (sem rótulo `Nó {id}`); nós sem nome continuam a servir de passagem no caminho

## [0.6.2] — 2026-08-03

Pesquisa com autocomplete nas listas De/Para do Calcular rota.

### Added

- **Calcular rota**: comboboxes De/Para com filtragem ao digitar (case- e accent-insensitive); reeditar limpa a seleção até nova escolha

## [0.6.1] — 2026-08-03

Correção do desalinhamento dos nós na Rede de rotas.

### Fixed

- Rede de rotas (digitizer): stage guiado pela imagem (sem `aspect-ratio` fixo + `object-fit: cover`), para nós e cliques alinharem ao mapa

## [0.6.0] — 2026-08-03

Rede de vias e cálculo de rotas (De/Para entre nós), refinamentos do digitizer, e vínculo nó↔Local depois da criação.

### Added

- Rede de viagem: waypoints, segmentos (estrada/rio/trilha), escala mi/unidade; vista GM **Rede de rotas** para digitalizar sem pins de lore
- **Calcular rota**: origem/destino entre **qualquer nó** da rede (com ou sem Local); ritmo de viagem; várias rotas por tempo (mais rápida destacada; alternativas tracejadas)
- Título da rota derivado do tipo de via dominante no percurso
- Vincular nó ↔ Local **depois** da criação: select na lista de nós (Rede) e campo “Nó da rede” no formulário de Local; ao vincular, o pin do Local move para as coordenadas do nó; desvincular não reverte a posição
- Zoom máximo maior na digitalização; zona de fecho de segmento mais apertada; botão direito desfaz o último ponto (ou a origem) ao traçar

### Changed

- Zoom com a roda do mouse mais suave no mapa da campanha e na Rede de rotas (step alinhado aos botões +/−)

### Deferred

- Ajuste de tamanho/âncora dos pins no móvel (spec 030) — revertido do produto; ver `specs/030-pin-size-offset` (Deferred / Staged)

## [0.5.0] — 2026-08-03

Conexões entre locais no mapa, estilo das linhas, pré-visualização no hover do menu e modais que cabem na viewport.

### Added

- Saídas dirigidas entre locais (`saida_ids` / `local_conexao`): cadastro no formulário GM; linhas no mapa ligando origem → destinos
- Pré-visualização das linhas ao passar o mouse sobre um local na aba Locais (ou lista GM), **somente** quando nenhum pin está selecionado
- Diálogos (local, NPC, arco, gate, pin) com altura máxima na viewport: corpo rolável e ações fixas no rodapé

### Changed

- Linhas de conexão usam vermelho claro da família “visitado”, opacidade moderada e sombra suave (em vez do accent roxo)
- Com um local selecionado/aberto, hover na lista só destaca o pin — as linhas permanecem as da seleção

## [0.4.0] — 2026-08-03

Foco no pin a partir do menu/mapa, modal ao lado do pin e refinamentos de hover na sidebar.

### Added

- Clique no local no menu (jogador) anima pan/zoom até o pin correspondente no mapa
- Clique no pin no mapa (jogador) também foca a vista no pin; no Modo GM o clique só seleciona (sem foco automático)
- Modal de leitura do pin abre ao lado do pin na tela (não centrado genérico)
- Hover no cartão da aba Locais com tint sutil; campo de busca com largura ajustada ao layout

### Fixed

- Hover na lista de Locais não re-dispara pan/zoom da vista após um foco anterior (a vista permanece onde o jogador deixou; o destaque local do pin continua)

### Changed

- Destaque de pin no hover do menu permanece só visual (escala/brilho), sem mover a câmera do mapa

## [0.3.1] — 2026-08-03

Ajuste nas legendas

### Changed

- Ajustado o tamanho das legendas para ficar mais em linha com o design da aplicação

## [0.3.0] — 2026-08-03

Descrição do pin com Markdown opcional na leitura.

### Added

- Descrição do local aceita texto livre ou Markdown no mesmo campo (Modo GM); hint “Markdown opcional” no formulário
- Leitura do pin (jogador) renderiza Markdown seguro: ênfase, listas, títulos e links `http`/`https` (nova aba)

### Security

- Renderização sanitizada: sem execução de HTML/script; imagens Markdown não são carregadas; esquemas de link inseguros (ex.: `javascript:`) não são navegáveis

## [0.2.0] — 2026-08-03

Melhorias de interação no mapa e cores de pin por local (Modo GM).

### Added

- Campo `cor_pin` nos locais (hex `#RRGGBB`): seletor livre no formulário GM, swatches sugeridos Visitado (`#e5484d`) / Conhecido (`#c4b5fd`), legenda do mapa com a convenção sugerida
- Migração SQLite automática para `cor_pin` (default lilás em locais existentes)
- Em Modo GM, clique na área vazia do mapa deseleciona o pin destacado (sem cancelar formulários de edição abertos)
- Controles de zoom/pan mantidos visíveis no layout fullscreen (slot flex do mapa)
- Botão explícito **Mapa** para substituir a imagem da campanha (GM), em vez de abrir o seletor de arquivo em qualquer clique

### Fixed

- Clique genérico no mapa em Modo GM não abre mais o diálogo de arquivo (regressão do slot editável cobrindo o stage)
- Controles de zoom deixavam de aparecer / ficavam fora da área útil em layouts altos

### Changed

- Pin de local no mapa usa a cor persistida (`cor_pin`); marcador do grupo permanece independente
- Clique no ícone do grupo não limpa a seleção de pin do local

## [0.1.0] — 2026-08-01

Primeira entrega do Codex da campanha (mapa.1nodado.com.br).

### Added

- Mapa interativo com pins de locais, zoom/pan e posição do grupo (bandeira ou brasão)
- Menu lateral: Locais, História e NPCs; modal de leitura ao clicar no pin
- Modo GM in-page (gate de senha + Basic Auth em `/api/admin/*`): CRUD de locais, NPCs, arcos, upload de mapa/imagens, mover grupo
- Destacar pin no mapa ao passar o mouse sobre o nome na aba Locais (jogador e lista GM)
- UI alinhada ao protótipo Nocturne (`prototype/`)
- Deploy com Docker Compose e Caddy opcional
- Pin do grupo: borda preta mais legível (bandeira via camadas CSS; brasão via `border`) e sombra suave para destaque no mapa
- Legenda do mapa alinhada ao estilo do pin do grupo

### Security

- Escrita admin fail-closed sem `ADMIN_USER` / `ADMIN_PASSWORD`
- Leitura pública; jogadores veem alterações ao recarregar (sem sync ao vivo)
