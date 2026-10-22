# Design

## Context

Ver `proposal.md` — Why. Estado observado no código (não suposição):

- **Modelo narrativo e sem ficha.** `NPC` (`backend/app/models/npc.py`, representa PJ e NPC por `tipo`) guarda `nome`, `papel`, `descricao`, `faccao`, `status` (enum `vivo|morto|desaparecido|desconhecido`), `retrato_url`, `visivel_para_todos`, mais `notas_mecanicas` (texto livre, só mestre) e `extensoes_mecanica` (JSON por módulo, hoje só `fadiga`). `Local` (`models/local.py`) tem `nome`, `descricao`, coordenadas relativas `x`/`y` entre 0 e 1, `imagem_url`, `estado_exploracao` e `visivel_para_todos`. `Sessao` tem `resumo` e `notas_preparo` (só mestre). Há também `Arco`, `Evento`, `Item` e `Vinculo` (relações entre personagens).
- **Já existe uma exportação portátil** (`services/campaign_export.py`, spec 097): zip com `manifest.json` (inclui `sistema`, `package_format`, `schema_version`), `content.json` com **todas** as linhas (`_rows(session, Sessao)` etc.) e uploads (mapa, retratos, capas). É um backup para o dono; não filtra por visibilidade.
- **Autenticação é por cookie de sessão.** Escritas passam por `middleware/csrf.py` (erro `CSRF_ORIGIN_INVALIDA` quando a origem não é aceita) e CORS usa uma allowlist (`settings.cors_origins`). Não existe esquema de token de API (nenhum `Authorization: Bearer`); o único `api_key` do código é o de saída para o provedor de IA.
- **Duas campanhas em produção**: `wfrp` (`sistema=wfrp4e`) e `wod` (`sistema=wod`) — ver `docs/runbook-corte-campaign-codex.md`.
- **Decisões do mestre (2026-10-20):** versão alvo **FoundryVTT v14**; o sistema do WoD no Foundry é **`wod20`** (id exato a confirmar); **nenhum `Actor`** nesta fase, tudo exportado como `JournalEntry`; NPCs visíveis por padrão, **PJs desligados por padrão**. O valor de `Campanha.sistema` pode vir com caixa variada (a campanha de desenvolvimento tem `WFRP4e`), e o BKLG-029 propõe aceitar qualquer string.

O que **não** foi verificado e depende da documentação oficial do Foundry na versão alvo está listado em «Verificações pendentes» abaixo; este documento não as afirma como fato.

## Goals / Non-Goals

**Goals:**
- Responder as três perguntas do BKLG-041 com uma recomendação defensável e registrar as alternativas descartadas.
- Fixar a fronteira «casca narrativa sim, ficha nunca» para que BKLG-043, BKLG-046 e futuras features de mecânica não comprometam o schema.
- Deixar explícito o que a exportação ao Foundry NÃO pode vazar (entidades ocultas, campos de mestre).

**Non-Goals:**
- Não implementa endpoint, módulo, exportador, migração nem dependência.
- Não desenha schema de ficha, stat block ou mapeamento de atributos por sistema.
- Não cobre o sentido inverso (Foundry → Codex) nem sincronização bidirecional.
- Não decide o formato binário final do pacote (compendium, JSON de importação, módulo empacotado): isso fica para a change de implementação, depois das verificações pendentes.

## Decisions

### D1. Primeiro artefato: exportação pontual, não módulo ao vivo
**Recomendação:** exportação pontual iniciada pelo mestre, **na forma de um arquivo (JSON + imagens) lido por um módulo mínimo dentro do Foundry**, que cria os documentos no mundo. É o padrão que módulos comunitários já usam na v14: o `FVTT-DD-Import` (Universal Battlemap Importer, MIT, compatibilidade 14–14) lê um arquivo local escolhido num `<input type=file>`, faz `JSON.parse`, envia as imagens com `FilePicker.upload` e cria o documento com `Scene.create`, tudo no cliente e sem servidor. O botão entra no diretório do Foundry por um hook de renderização (`renderSceneDirectory` no caso dele; aqui seria o de diários).
**Por quê (grounded):** um módulo ao vivo precisa que o Foundry (um cliente em outra origem) leia a API do Codex. Hoje isso exigiria três coisas que não existem: um esquema de credencial para clientes não-navegador (a sessão é cookie), uma exceção à política de origem do CSRF/CORS para a origem do Foundry de cada mestre (que é auto-hospedado e arbitrária), e uma superfície pública nova que lê campos de mestre. Cada uma é uma capacidade de segurança própria, maior que a ponte. A exportação pontual não cria nenhuma delas: o módulo só lê um arquivo que o mestre já tem no computador, sem credencial e sem o Foundry acessar o Codex.
**Custo que este ADR assume:** o guia de empacotamento do Foundry não cobre importar um JSON solto sem módulo, então a primeira entrega **inclui manter um módulo mínimo**. Esse módulo acompanha as versões do Foundry (o de referência declara `minimum`, `verified` e `maximum` iguais a 14). É o preço de não usar compêndio, que exigiria gerar bancos LevelDB fora do Foundry.
**Alternativa descartada — módulo ao vivo:** mantém sincronização, mas acopla o Codex ao ciclo de versões do Foundry e abre a superfície de autenticação acima. Reavaliar **depois** da exportação existir e haver demanda real de sincronização.
**Alternativa descartada — compêndio gerado pelo Codex:** os packs são pastas de banco e o caminho documentado para criá-los é o «Module Maker» dentro do Foundry; gerar isso no backend do Codex é um custo sem retorno para uma casca narrativa.
**Alternativa descartada — ambos juntos:** dobra o custo e mistura decisões de segurança com decisões de modelagem.

### D2. A exportação ao Foundry é um artefato novo, não um filtro do pacote 097
O pacote 097 é backup completo e assim permanece (inclui ocultos e campos de mestre). Reutilizá-lo como base da exportação ao Foundry tornaria o vazamento de `visivel_para_todos=false`, `notas_mecanicas` e `notas_preparo` um estado padrão que só um filtro posterior evitaria. **Decisão:** a exportação ao Foundry parte de uma consulta própria que já nasce filtrada (exclui ocultos; campos de mestre só entram como documento de permissão restrita). Pode **reusar** do 097 apenas utilidades neutras (zip seguro, resolução de uploads, `manifest` com `package_format`/`schema_version`).

### D3. Casca narrativa: mapeamento proposto entidade → documento do Foundry
Proposta a confirmar nas verificações pendentes contra a v14; o princípio é que nada de regra é gerado e **nenhum `Actor` é criado**.

| Codex | Foundry (proposto) | Notas |
|---|---|---|
| Personagem `tipo=npc` visível | `JournalEntry` com páginas | nome em `name`; `JournalEntry` **não tem campo `img`**, então o retrato vai como página de imagem (`src`) ou `<img>` no texto; `descricao` em página de texto; papel, facção e status como texto; ligado por padrão |
| Personagem `tipo=pj` | página de `JournalEntry`, **só se o mestre ligar a opção** | desligado por padrão (decisão do mestre) |
| `status` (vivo/morto/…) | texto na página | sem campo de sistema envolvido |
| `notas_mecanicas` | página de `JournalEntry` à parte com `ownership` restrito (nível NONE), **ou** bloco `secret` na página de texto | opt-in (D5); as duas formas existem na documentação, a escolha final depende da validação em mundo (ver tarefa 2.3) |
| Local | `JournalEntry` com páginas | **primeira entrega: só diário.** `Note` numa `Scene` entra numa fase seguinte, depois do teste único da tarefa 2.4 (conversão sugerida pelo módulo de referência: `x_px = x_rel × width + sceneX`, `y_px = y_rel × height + sceneY`; com `padding` 0 o deslocamento some) |
| Sessão | `JournalEntry` com `resumo`; `notas_preparo` em página à parte de permissão restrita | |
| Arco / Evento | `JournalEntry` (páginas) | |
| Item | página de `JournalEntry`, não `Item` | o tipo de `Item` é definido pelo sistema; criar `Item` exigiria escolher tipo e campos de regra |
| Vinculo (relações) | texto com links `@UUID[JournalEntry.<id>]{rótulo}` | links confirmados na documentação do diário; sem análogo nativo para o grafo |

### D4. Sistema de jogo é irrelevante na primeira entrega
Como tudo é exportado como `JournalEntry` e nenhum `Actor` é criado, a exportação **não depende de `Campanha.sistema`**: qualquer valor, inclusive desconhecido, produz a mesma estrutura (ver spec). Isso elimina a necessidade de escolher WFRP4e ou WoD primeiro e é compatível com o BKLG-029. Ficam registrados para uma **fase futura com atores**, caso haja demanda: versão alvo **FoundryVTT v14**, `wfrp4e` para a campanha `wfrp` e **`wod20`** para a campanha `wod` (id exato do sistema a confirmar). Nessa fase seria preciso reabrir a pergunta de mapeamento de tipo de ator por sistema, que este ADR deliberadamente não resolve.

### D5. `notas_mecanicas` e `notas_preparo`: opt-in, só em documento restrito
Por serem só do mestre por construção, entram na exportação apenas se o mestre marcar a opção, e sempre em conteúdo que jogadores não leem. O padrão da exportação é **não incluí-los**. A documentação da v14 oferece dois mecanismos, e nenhum deve ser escolhido sem teste em mundo real:
- **Página separada com `ownership` restrito.** `JournalEntry` e `JournalEntryPage` têm o campo `ownership` (mapa de usuário para nível), e os níveis são `NONE=0`, `LIMITED=1`, `OBSERVER=2`, `OWNER=3`, `INHERIT=-1`. O artigo do diário diz que NONE é o padrão para quem não criou a entrada, mas **não descreve permissão por página** na interface, e a página de `JournalEntry` informa que conteúdo **dentro de compêndio ignora `ownership`** em favor da função do usuário. Com o módulo de D1 isso deixa de ser um problema: os documentos são criados **diretamente no mundo**, e o módulo define o `ownership` na criação (o valor inicial documentado do campo é `{ default: 0 }`, ou seja, NONE). O que ainda precisa de teste é se a restrição por **página** (e não só por entrada) é respeitada na interface (tarefa 2.3).
- **Bloco `secret`** no texto: documentado como visível só para o GM ou para quem é Owner da entrada. Vale para o texto inteiro daquele bloco, mas depende de ninguém ter Owner na entrada.
**Fato confirmado pelo mestre (2026-10-21):** no Foundry, tudo que é criado ou importado (ficha ou diário) nasce visível só para quem criou e para o GM. Como o GM sempre importa, **todo documento chega oculto para jogadores**. Consequências: (1) o padrão seguro vem de graça, e esquecer de definir `ownership` esconde conteúdo em vez de vazá-lo; (2) o que precisa de código é o contrário: NPCs visíveis (e PJs com opt-in) precisam que o módulo **eleve** o `ownership.default` da entrada (p. ex. para OBSERVER) na criação; (3) páginas de `notas_*` devem ficar com `ownership` NONE explícito, porque página com `INHERIT` herdaria a elevação da entrada; (4) entradas com `visivel_para_todos=false` incluídas pelo mestre ficam sem elevação.
**Direção:** preferir a página separada com `ownership` NONE, por ser o limite explícito, e validar em mundo v14 que a importação o preserva. Se não preservar, cair para o bloco `secret`. Se nenhum se sustentar, `notas_*` ficam **fora** da exportação (o padrão de qualquer forma).

### D6. Onde o ADR vive
O texto final desta decisão vai para `docs/adr/0001-ponte-foundryvtt.md` (pasta nova), derivado deste design, para ser lido sem entrar em `openspec/`. O backlog (BKLG-041 e BKLG-043) passa a apontar para ele.

## Verificações contra a documentação da v14
Fonte: documentação oficial `foundryvtt.com/api` (versão 14.368 Stable) e artigos de `foundryvtt.com/article` (diário, compêndios, cenas, guia de empacotamento), lidos em 2026-10-20. A referência da API lista **tipos de campo** mas descreve pouco a semântica; o que ela não diz está marcado como **não coberto** e exige teste num mundo v14, não suposição.

**Confirmado**
- `JournalEntry` tem os campos `name`, `pages`, `ownership`, `folder`, `sort`, `categories` e **não tem `img`**. Páginas são um `EmbeddedCollectionField`.
- `JournalEntryPage` tem `type`, `text`, `title`, `image`, `video`, `src`, `ownership`, `sort`, `system`. Tipos de página no artigo do diário: **texto, imagem, vídeo e PDF**. Imagem referenciada por caminho em `src`.
- Texto: editor ProseMirror por padrão, com opção Markdown e HTML bruto; TinyMCE em descontinuação.
- Links entre documentos: `@UUID[DocumentType.ID]{rótulo}` (recomendado) e `@DocumentType[Nome ou ID]{rótulo}`.
- Níveis de permissão `CONST.DOCUMENT_OWNERSHIP_LEVELS`: `INHERIT -1`, `NONE 0`, `LIMITED 1`, `OBSERVER 2`, `OWNER 3`. No diário, NONE é o padrão para quem não criou a entrada.
- Compêndio: cada pack guarda um único tipo de documento; o menu do pack tem «Import Data» a partir de um JSON local, além de «Import Entry» e «Import All Content»; documentos entram num pack por arrastar ou «Export to Compendium».
- Módulos distribuem packs pela lista `packs` do manifesto (`name`, `label`, `path`, `type`); desde a V11 cada pack é uma pasta de banco, e o «Module Maker» embutido cria packs sem código.
- `Scene` na v14 tem **`levels`**, e o fundo fica em `levels[].background.src` (não em `background.src`), o que explica por que a página `BaseScene` não listava `background`. Confirmado pelo uso no módulo de referência.
- `Note` é documento embutido em `Scene` (coleção `notes`) com `x`, `y`, `entryId`, `pageId`, `text`, `texture`, `iconSize`, `global`. Criar uma nota é adicionar à coleção da cena.
- `Scene`: o fundo define as dimensões; padding é uma porcentagem das dimensões totais; tamanho de grade padrão 100 px, mínimo 50; o artigo avisa que mudar grade ou padding pode deslocar notas.

**Não coberto pela documentação (precisa de teste em mundo v14)**
- **Formato exato do JSON de «Import Data»** de um compêndio. **Deixa de ser necessário:** o desenho de D1 usa um JSON nosso lido pelo módulo mínimo, não o formato de compêndio.
- **Importação standalone sem módulo:** o guia de empacotamento não a cobre. **Resolvido por desenho** (D1): a primeira entrega inclui um módulo mínimo.
- **Estrutura do `ownership`** (chave `default` e níveis por usuário): a doc diz só «mapeamento de IDs de usuário para níveis»; a chave `default` não está documentada nas páginas lidas.
- **Se o `ownership` definido na criação de uma `JournalEntry`/página é respeitado**, em especial por página (tarefa 2.3). A parte de «compêndio ignora `ownership`» não se aplica, porque criamos no mundo.
- **Unidade e origem de `Note.x/y`.** A documentação não diz. O módulo de referência posiciona walls e lights em pixels do canvas somando `scene.getDimensions().sceneX/sceneY` (o deslocamento do padding), o que sugere o mesmo espaço para notas, mas **é inferência**: fica para o teste da tarefa 2.4.
- **Permissão por página** na interface (o artigo só descreve permissão por entrada).

**Consequência para o desenho:** a primeira entrega fica em **diários apenas** (sem `Scene`/`Note`) até o teste da tarefa 2.4. O pacote é um **JSON próprio (no estilo do pacote 097, com `manifest.json`, `content.json` e imagens) lido por um módulo mínimo**, então o formato do JSON de compêndio não importa. O módulo de referência (`FVTT-DD-Import`) é a base de estudo: ApplicationV2 com formulário, leitura do arquivo no cliente, `FilePicker.upload` para imagens e criação de documentos por `create`. Li o código, mas **não o executei**.

## Risks / Trade-offs

- **[Risco] Vazar conteúdo de mestre num documento de Foundry legível por jogadores** → Mitigação: D2 e D5 (consulta já filtrada, opt-in, permissão restrita) e teste de contrato na change de implementação; é o principal risco da ponte.
- **[Risco] Comportamento de `JournalEntry` na v14 diferente do esperado** → Mitigação: verificações pendentes contra a documentação da v14 antes de codar; sem `Actor`, o risco de mapeamento por sistema não existe nesta fase.
- **[Trade-off] Exportação pontual não sincroniza depois do import** → Aceito: é a troca que torna a primeira entrega viável sem nova capacidade de autenticação. Reavaliar o módulo ao vivo com demanda real.
- **[Trade-off] Item como página de diário em vez de `Item`** → Aceito: evita escolher tipo e campos de regra por sistema; o mestre converte dentro do Foundry se quiser.
- **[Risco] Este ADR envelhece** → Mitigação: ele é a direção e as invariantes; os detalhes de formato ficam para a change de implementação.
