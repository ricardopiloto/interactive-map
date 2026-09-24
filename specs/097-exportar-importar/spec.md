# Feature Specification: Exportar e importar campanha

**Feature Branch**: `097-exportar-importar`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Exportar e importar campanha. Exportação (só dono) gera um zip com manifest.json (versão do schema, sistema, versão do app), dados em JSON e imagens. Importação cria uma campanha nova a partir do zip: valida o manifest e o esquema, importa para um banco novo preservando os IDs, restaura imagens dentro da cota, e mantém o sistema do manifest (imutável). Nunca abrir ou adotar um arquivo .db enviado por usuário. Recusar versão de schema mais nova que a do app; aceitar mais antiga migrando. Expor por API e por CLI. Fora de escopo: botões na interface (spec 098), migração das instâncias legadas (spec 099). Depende de: 096. Critério-chave: exportar e importar uma campanha reproduz contagens de registros e de imagens idênticas; zip malformado ou malicioso é recusado sem efeitos colaterais."

**Depends on**: [096-uploads-cota](../096-uploads-cota/spec.md) (Implemented); [095-contas-sessao-permissoes](../095-contas-sessao-permissoes/spec.md); [093-controle-alembic-sqlite](../093-controle-alembic-sqlite/spec.md); Campaign Codex brief ([docs/v2/product-brief-campaign-codex.md](../../docs/v2/product-brief-campaign-codex.md) fase 097); constituição v1.0.0 (I, II, III, IV, V, VI)

## Constitution

- Isolamento (I): exportar A MUST NOT incluir conteúdo ou imagens de B. Importar MUST criar um sítio **novo** (UUID novo) e MUST NOT escrever no SQLite nem na pasta de uma campanha já existente. Rotas HTTP novas (export sob slug; import fora do slug da origem) MUST entrar na matriz: anónimo, membro de outra campanha e co-mestre (não dono) MUST falhar no export de A.
- Testes primeiro (II): export/import, recusa de zip malformado/malicioso, recusa de `.db` de utilizador, política de versão de schema e o round-trip de contagens MUST ter testes a falhar **antes** da implementação correspondente.
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD nem `git pull` em `/opt/codex-*`. Copiar `mapa.db` das pastas antigas é **099**, não esta fase.
- Simplicidade (IV): pacote = zip + JSON + imagens; SQLite só no sítio criado pela app. MUST NOT adoptar o motor de um `.db` enviado. Preferir a biblioteca zip já disponível no runtime; dependência nova só com justificação no plano.
- i18n (V): erros de API MUST usar códigos mapeáveis. Copy de botões/ecrãs de export/import é **098**. Conteúdo da mesa (nomes, lore) MUST NOT ser traduzido.
- Migrações (VI): campanha importada MUST ficar na revisão de conteúdo **corrente** da app. Schema no manifest mais novo que o da app → recusa. Schema mais antigo → aceitar e **migrar** até à head. MUST NOT abrir o `.db` do utilizador para «deixar o Alembic correr lá dentro».

## Clarifications

### Session 2026-09-20

- Q: Quem pode importar pela API (criar campanha nova) → A: Qualquer mestre autenticado importa pela API e fica dono; CLI continua para o operador
- Q: Slug da campanha nova na importação → A: Usar o slug da origem se estiver livre; se estiver ocupado ou em falta, exigir um slug novo
- Q: JSON com relações internas partidas → A: Recusar o pacote inteiro (sem campanha nova)
- Q: Imagem referida no JSON mas ausente no zip → A: Recusar o pacote inteiro
- Q: Ficheiros a mais no zip → A: Só entradas do contrato (manifesto, JSON, imagens nas categorias); qualquer outra → recusa

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dono exporta a mesa completa (Priority: P1)

O dono da campanha pede uma cópia portátil. Recebe um ficheiro zip com: um manifesto (versão de schema de conteúdo, sistema de jogo, versão da app), os dados da mesa em JSON, e as imagens. Não entram contas, sessões, convites nem o SQLite. Co-mestre, mestre de outra mesa e anónimo não obtêm o pacote. O operador da instância pode fazer o mesmo pela CLI (cópia de salvaguarda, sem ser membro).

**Why this priority**: Sem export não há backup nem movimento de mesa entre instâncias; o critério de round-trip começa aqui.

**Independent Test**: Campanha A com locais, personagens (incl. oculto), vínculos e imagens; B com outros dados. Export autenticado do dono de A → zip só com A. Pedido do co-mestre de A, do dono de B e anónimo → recusa. CLI exporta A para um path.

**Acceptance Scenarios**:

1. **Given** um dono autenticado da campanha A, **When** pede a exportação (API), **Then** recebe um zip com `manifest.json` (schema, sistema, versão da app), JSON de conteúdo e as imagens dessa campanha.
2. **Given** a mesma campanha, **When** um co-mestre (membro que não é dono), um mestre só de B, ou um anónimo pede o export de A, **Then** o pedido é recusado e nenhum pacote é emitido.
3. **Given** conteúdo só em B, **When** se inspecciona o zip de A, **Then** não há registos nem ficheiros de imagem de B.
4. **Given** o operador na CLI, **When** exporta o slug A, **Then** obtém um zip equivalente (mesmo contrato de manifesto + JSON + imagens).

---

### User Story 2 - Importar cria uma mesa nova e reproduz as contagens (Priority: P1)

Alguém com sessão de mestre (API) ou o operador (CLI) envia um zip válido. **Qualquer mestre autenticado** pode importar (não só o operador): o sistema **cria uma campanha nova** (novo UUID). O slug é o da **origem** (manifesto) quando está **livre** nesta instância; se estiver ocupado, em falta ou inválido, a operação MUST indicar um slug novo. Valida o manifesto e o esquema, grava o conteúdo num SQLite **novo** **preservando os IDs**, restaura as imagens **dentro da cota** (096), e fixa o **sistema do manifesto** (imutável, 093). O importador da API torna-se o **dono**. Não há limite nesta fase ao número de campanhas por conta (cada uma com a cota 096). Contagens de registos e de imagens coincidem com a origem. A campanha de origem não é alterada.

**Why this priority**: Critério-chave de fidelidade; é a única forma suportada de «trazer uma mesa» nesta fase.

**Independent Test**: Exportar A → importar noutro contexto com o slug de A livre (sem passar slug) → A′ usa o slug de A. Exportar A → importar na mesma instância (slug ocupado) sem slug novo → recusa; com slug livre → A′. Comparar contagens e IDs; sistema do manifesto; pasta nova; A intacta.

**Acceptance Scenarios**:

1. **Given** um zip válido exportado de A cujo slug de origem está **livre** nesta instância, **When** um mestre autenticado importa pela API **sem** indicar outro slug, **Then** existe uma campanha nova com o slug de A, o importador é dono, o sistema é o do manifesto, e as contagens de registos e de imagens são **idênticas** às de A.
2. **Given** o mesmo zip, **When** se comparam os IDs dos registos (locais, personagens, grupo, …), **Then** coincidem com os da origem (preservados no banco **novo**).
3. **Given** o operador na CLI, slug de origem livre e um dono existente (email), **When** importa o zip sem forçar outro slug, **Then** a campanha nova usa o slug da origem, com esse dono e as mesmas contagens.
4. **Given** o slug da origem já usado nesta instância (ou em falta/inválido no manifesto), **When** se importa **sem** um slug novo válido e livre, **Then** a operação é recusada e **não** fica campanha nem pasta pela metade. **When** se indica um slug novo livre, **Then** a campanha nasce com esse slug (nunca sobrescreve a existente).
5. **Given** imagens no zip cuja soma **excede** a cota da campanha nova (096, omissão 10 GB), **When** se importa, **Then** recusa estruturada; sem campanha nova; sem ficheiros órfãos.

---

### User Story 3 - Zip mau ou malicioso não deixa rasto; um .db de utilizador nunca é o banco (Priority: P1)

Um pacote malformado, com paths perigosos, manifesto em falta, JSON inválido, ou um ficheiro SQLite enviado como se fosse a mesa, é **recusado**. Nenhum registo de controle, pasta UUID ou ficheiro de conteúdo fica criado. A aplicação **nunca** abre nem adopta um `.db` enviado pelo utilizador como banco da campanha (nem «colar e carimbar»).

**Why this priority**: Critério-chave de segurança; um zip ou `.db` malicioso não pode corromper a instância nem furar isolamento.

**Independent Test**: Fixtures de zip sem manifesto, JSON truncado, JSON com vínculo para personagem inexistente, JSON a apontar para imagem em falta no zip, path `../` (zip-slip), zip a apontar fora do destino, ficheiro `.db` cru, zip com entrada extra (`.db`, `.txt`, script, pasta fora das categorias). Em todos: recusa + zero linhas novas em controle + zero pastas UUID novas (ou limpeza completa se a falha for a meio).

**Acceptance Scenarios**:

1. **Given** um zip sem `manifest.json`, com JSON inválido **ou internamente inconsistente** (ex. vínculo para personagem/local inexistente no pacote), com **imagem referenciada no JSON mas ausente no zip**, ou com entradas que saem da pasta de destino (path traversal), **When** se importa, **Then** recusa com código mapeável e o estado da instância é o de antes (sem campanha nova). MUST NOT nascer uma mesa a omissão de linhas partidas nem com URLs de mídia sem ficheiro.
2. **Given** um ficheiro `.db` (SQLite) enviado no lugar do zip, **When** se tenta importar, **Then** recusa; a app MUST NOT abrir esse ficheiro como banco de campanha nem copiá-lo para `campanhas/<uuid>/campanha.db`.
3. **Given** um zip que inclui um `.db`, um `.txt`, um script, ou qualquer entrada **fora** da lista permitida (manifesto, JSON de conteúdo, imagens nas categorias de upload), **When** se importa, **Then** o pacote é recusado; nenhum desses ficheiros é aberto, extraído para o sítio da campanha, nem adoptado como banco.
4. **Given** uma falha a meio (disco, cota, JSON inconsistente depois de já ter criado pasta), **When** a importação aborta, **Then** não permanece registo órfão no controle nem sítio UUID pela metade.

---

### User Story 4 - Schema mais novo recusado; mais antigo aceite e migrado (Priority: P1)

O manifesto declara a versão de schema de conteúdo com que o JSON foi produzido. Se essa versão é **mais nova** do que a que esta app conhece, a importação recusa (a instância não adivinha colunas futuras). Se é **mais antiga** (ainda suportada pela ponte de migração da app), aceita e o conteúdo fica na revisão **corrente**. O sistema de jogo do manifesto não é pedido ao importador nem alterado.

**Why this priority**: Sem isto, um zip de uma app futura corrompe o schema, ou um backup antigo não entra.

**Independent Test**: Manifesto com revisão desconhecida/futura → recusa, sem sítio. Fixture com revisão antiga conhecida → import sucede; banco novo na head; contagens coerentes após migração.

**Acceptance Scenarios**:

1. **Given** um manifesto cuja versão de schema é mais nova (ou desconhecida) que a head da app, **When** se importa, **Then** recusa estruturada; nada é criado.
2. **Given** um manifesto com versão de schema mais antiga mas reconhecida, **When** se importa, **Then** o conteúdo é migrado até à revisão corrente e a campanha abre com as contagens esperadas.
3. **Given** um zip cujo manifesto tem sistema S, **When** o importador tenta (ou a API receberia) outro sistema, **Then** a campanha nasce com S; sistema e módulos do manifesto são os gravados e imutáveis.

---

### Edge Cases

- Anónimo ou sessão inválida: export e import HTTP recusados (sem zip, sem campanha).
- Co-mestre: pode administrar conteúdo (095) mas MUST NOT exportar; só o dono na API.
- CLI de super-admin: MAY exportar/importar sem ser membro (operação de instância), alinhado a `campanha criar`.
- Import HTTP: **qualquer** mestre autenticado (095) pode criar campanha por import; torna-se o único dono da campanha nova. MUST NOT exigir papel de operador nem limitar a «uma mesa por conta» nesta fase. Membros da origem **não** são copiados (contas não viajam no zip).
- CLI import: o operador indica o dono (email de utilizador existente); sem dono válido → recusa, sem campanha.
- Slug da campanha nova: MUST ser o slug de origem do manifesto quando esse valor está **livre** e é válido (093). Se estiver ocupado, em falta ou inválido/reservado, MUST exigir um slug novo na operação. MUST NOT reutilizar automaticamente com sufixo. MUST NOT sobrescrever a campanha que já tem o slug.
- Nome público: omissão = nome do manifesto/origem; deve caber nas regras já usadas ao criar campanha.
- Visibilidade (`listada` / `so_link`) e módulos: copiados do manifesto; módulos imutáveis após criar.
- URLs de mídia no JSON (retrato, local, mapa) apontam ao slug antigo: MUST ser reescritas para o slug **novo** e para o endpoint de mídia (096), preservando categoria e nome de ficheiro.
- `mapa_arquivo` e `bytes_usados`: após restaurar imagens, `mapa_arquivo` reflecte o mapa restaurado (se houver); `bytes_usados` MUST coincidir com a pasta (reconciliação 096).
- Zip só com dados, zero imagens: válido; contagem de imagens = 0.
- JSON de conteúdo com referências internas partidas (vínculo sem extremo, local/arco/personagem apontado mas ausente no pacote, IDs que não fecham): MUST recusar o **pacote inteiro**. MUST NOT importar só as linhas válidas nem gravar FKs partidas.
- Imagem **referenciada** no JSON (retrato, local, mapa / `mapa_arquivo`) mas **ausente** no zip: MUST recusar o pacote inteiro. MUST NOT limpar a referência nem deixar URL partida.
- Imagem no zip **não** referenciada no JSON: conta para a cota e para a contagem de ficheiros restaurados (órfão permitido, como 096).
- Zip-bomb / tamanho descomprimido acima de um tecto seguro (no mínimo a cota de imagens + margem para JSON): recusa sem extrair o resto para o sítio da campanha.
- Entradas de zip com nomes absolutos ou `..`: recusa.
- Entradas de zip fora da lista permitida (`manifest.json`, JSON de conteúdo, imagens nas pastas de categoria mapa/retratos/locais): recusa do pacote inteiro. MUST NOT ignorar extras nem extraí-los. `.db` extra está incluído nesta regra.
- Sistema no manifesto desconhecido desta app: recusa.
- Campanha origem inactiva ou slug desconhecido no export: recusa (404 opaco na API, alinhado a 094).
- Instâncias `/opt/codex-*` e cópia de `mapa.db` legado: 099, não esta fase.
- Botões «Exportar» / «Importar» na UI: 098.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O dono da campanha MUST poder exportar pela **API** um pacote zip da **essa** campanha. Co-mestre, não-membro e anónimo MUST ser recusados. A rota MUST constar da matriz de isolamento (I) e da enumeração de rotas admin (095), com a guarda **dono** (não só `require_membro`).
- **FR-002**: O operador MUST poder exportar e importar pela **CLI** de super-admin (mesmo contrato de pacote que a API).
- **FR-003**: O pacote MUST conter `manifest.json` com pelo menos: versão de schema de conteúdo, sistema de jogo, versão da app, **slug de origem**; MUST conter o conteúdo da mesa em **JSON**; MUST conter as imagens do sítio de uploads dessa campanha. A importação MUST aceitar **só** essas entradas (lista fechada: manifesto, JSON de conteúdo, ficheiros de imagem nas categorias). MUST NOT incluir o ficheiro SQLite, hashes de senha, sessões, convites nem linhas de outras campanhas. Qualquer outra entrada no zip MUST fazer recusar o pacote (sem ignorar extras).
- **FR-004**: Importar MUST **criar uma campanha nova** (sítio UUID novo, `campanha.db` novo na revisão corrente após migração). MUST NOT substituir, anexar ou abrir o banco de uma campanha já existente.
- **FR-005**: Os IDs dos registos de conteúdo MUST ser preservados no banco novo (as relações internas da mesa mantêm-se).
- **FR-006**: Após import bem-sucedido, as **contagens** de cada tipo de registo de conteúdo exportado e o **número de ficheiros de imagem** MUST ser idênticos aos da origem (critério-chave).
- **FR-007**: O **sistema** (e módulos) da campanha nova MUST ser os do manifesto e MUST permanecer imutáveis. MUST NOT ser escolhidos pelo importador para contradizer o manifesto.
- **FR-008**: Imagens MUST ser restauradas na pasta de uploads da campanha nova. Se a soma ultrapassar `cota_bytes` (096), MUST recusar sem campanha persistida. `bytes_usados` MUST ficar reconciliado com o disco. Se o JSON (ou `mapa_arquivo` no manifesto) referir um ficheiro que **não** está no zip, MUST recusar o pacote inteiro (sem campanha nova).
- **FR-009**: Referências de mídia no JSON MUST passar a apontar ao slug novo no endpoint de mídia (096).
- **FR-010**: MUST NOT abrir, copiar para o sítio como `campanha.db`, nem adoptar como engine um ficheiro `.db` / SQLite enviado pelo utilizador (ficheiro cru ou entrada no zip).
- **FR-011**: Versão de schema no manifesto **mais nova** ou desconhecida MUST ser recusada. Versão **mais antiga** reconhecida MUST ser aceite e o conteúdo MUST ficar na revisão corrente (migrar). A migração MUST correr sobre dados importados pela app, não sobre um `.db` de utilizador.
- **FR-012**: Zip malformado, manifesto inválido, JSON inválido, JSON com **referências internas inconsistentes**, imagem referenciada em falta, **entrada fora da lista permitida**, path traversal, tamanho excessivo, sistema desconhecido ou cota excedida MUST produzir **erro estruturado** (código mapeável) e MUST NOT deixar efeitos colaterais (sem linha de Campanha, sem pasta UUID residual). MUST NOT criar campanha incompleta por omissão de linhas partidas ou de ficheiros de mídia.
- **FR-012a**: A consistência exigida é a das relações do conteúdo da mesa (personagens, locais, vínculos, arcos, grupo, e demais entidades exportadas): todo o ID referenciado MUST existir no JSON do pacote. Todo o ficheiro de mídia referenciado MUST existir no zip.
- **FR-013**: Import pela API MUST estar disponível a **qualquer mestre autenticado** (conta activa, sessão 095); esse utilizador MUST ficar dono da campanha nova. MUST NOT restringir a mestres sem campanha nem exigir papel extra de operador. Anónimo MUST ser recusado. Import pela CLI MUST exigir um dono existente (email) indicado pelo operador.
- **FR-014**: O slug da campanha nova MUST resolver-se assim: (1) se a operação indicar um slug, usar esse se for válido e livre; (2) senão, usar o slug de origem do manifesto se for válido e **livre**; (3) se o escolhido estiver ocupado, em falta ou inválido, recusar (código mapeável) sem criar campanha. MUST NOT gerar sufixo automático. MUST NOT criar duas campanhas com o mesmo slug nem alterar a que já existe.
- **FR-015**: MUST existir teste automatizado de round-trip (export → import) com contagens de registos e imagens iguais, e testes de recusa sem rasto para zip mau / `.db` / schema futuro / JSON inconsistente / imagem referenciada em falta / entrada extra fora do contrato.
- **FR-016**: MUST NOT acrescentar botões ou ecrãs de export/import no cliente (098). MUST NOT migrar instâncias legadas nem copiar `/opt/codex-*` (099).
- **FR-017**: Copy de erros desta superfície MUST ser códigos mapeáveis (pt-BR e en quando 098 mostrar UI). Sem traduzir lore.

### Out of Scope

- Botões, diálogos e página de export/import no frontend (098).
- Migração das instâncias WFRP/WoD / corte (099), incluindo adoptar `mapa.db` legado como pacote.
- Sincronização contínua entre instâncias; import «por cima» de uma campanha existente; merge de mesas.
- Export parcial (só um arco, só o mapa).
- Encriptação do zip ou palavra-passe do pacote.
- Alterar cota por campanha; garbage-collection de órfãos (096).
- Copiar membros, convites ou contas no pacote.

### Key Entities

- **Pacote de campanha**: zip portátil; contrato **fechado** = manifesto + JSON de conteúdo + imagens nas categorias; qualquer outra entrada invalida o pacote.
- **Manifesto**: versão de schema de conteúdo, sistema, versão da app, **slug de origem**; MAY incluir nome, módulos, visibilidade, `mapa_arquivo`.
- **Campanha nova**: registo de controle + sítio UUID; sistema/módulos do manifesto; dono = importador (API) ou email da CLI.
- **Conteúdo**: todas as entidades da mesa (locais, personagens, vínculos, arcos, posição de grupo, e demais tabelas de conteúdo já existentes no `campanha.db`); IDs preservados.
- **Imagens**: ficheiros do sítio de uploads da origem, restaurados no sítio novo, sujeitos a cota.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos round-trips de teste (exportar A → importar como A′), as contagens de cada tipo de registo de conteúdo e o número de imagens coincidem entre A e A′.
- **SC-002**: Em 100% dos zips malformados ou maliciosos de fixture (manifesto em falta, JSON inválido, JSON com referências internas partidas, imagem referenciada em falta, entrada extra fora do contrato, path traversal, `.db` cru, schema futuro), a importação é recusada e o número de campanhas e de pastas UUID na instância de teste é o mesmo de antes.
- **SC-003**: 100% dos pedidos de export de A por anónimo, por mestre não-dono de A, ou sob o slug B, falham e não devolvem dados de A.
- **SC-004**: Um dono conclui export API (ou o operador conclui export CLI) de uma mesa de teste com conteúdo e imagens em menos de 2 minutos em ambiente local.
- **SC-005**: Após import de um pacote com schema mais antigo reconhecido, a campanha nova abre na revisão corrente sem perda das contagens do fixture.
- **SC-006**: 100% das tentativas de fazer da campanha o ficheiro `.db` enviado pelo utilizador falham (nenhum engine aponta a esse ficheiro; nenhum `campanha.db` é esse bytes).

## Assumptions

- 095 está disponível: papéis dono vs membro; sessão de mestre na API; CLI de super-admin.
- 096 está disponível: pasta de uploads por UUID, cota, `mapa_arquivo`, reconciliação de `bytes_usados`, URLs de mídia.
- Criar campanha pelo import HTTP é **intencional** nesta fase e está aberto a qualquer mestre autenticado (093 só tinha CLI). Não abre cadastro nem lista na home (098). Sem tecto de «N campanhas por conta» aqui (cota 096 por mesa).
- Membros da origem não viajam: a mesa importada começa com um dono. Co-mestres voltam a ser convidados/atribuídos fora deste pacote.
- Slug da campanha nova: o da origem se estiver livre; senão a operação MUST indicar um slug livre. Sem sufixo automático.
- «Preservar IDs» aplica-se **dentro** do ficheiro novo; não há colisão com outras mesas porque cada uma tem o seu SQLite.
- Versão de schema no manifesto = revisão de conteúdo Alembic (ou identificador equivalente estável documentado no plano). Versão da app é metadado de diagnóstico, não portão (o portão é o schema).
- Migração de JSON antigo = aplicar as transformações equivalentes às revisões em falta até à head, depois inserir no banco novo já na head — **não** executar Alembic sobre um `.db` de terceiros.
- Biblioteca zip da stack padrão, salvo justificação no plano (IV).
- Tecto de descompressão: não exceder cota de imagens + tecto documentado para JSON; valores exactos no plano.
- Sem UI nesta fase; 098 liga botões a estas APIs.
- Produção `/opt/codex-*` intocada; 099 usará este pacote ou um fluxo próprio para o corte, não o contrário.

## Notes

- Documentar o contrato do zip (ficheiros do manifesto e JSON) no README do backend na implementação.
- A enumeração 095 de rotas admin MUST tratar export como «só dono».
- CHANGELOG `[Unreleased]` na implementação; bump SemVer só se o plano o exigir.
- Próximas fases: 098 (botões e painel), 099 (legado / corte).
