# Feature Specification: Banco de controle e um armazenamento por campanha

**Feature Branch**: `093-controle-alembic-sqlite`

**Created**: 2026-09-19

**Status**: Implemented

**Input**: User description: "Banco de controle e um SQLite por campanha. Introduzir data/control.db (tabela Campanha) e data/campanhas/<uuid>/{campanha.db, uploads/}. Gestor de conexões com cache de engines. get_session passa a resolver o banco da campanha pelo slug, sem alterar o código de consulta existente (singletons como GrupoPosicao id=1 continuam válidos). Adotar Alembic com render_as_batch para SQLite, tanto para o controle quanto para os bancos de campanha, migrando cada banco de campanha ao abrir. Manter _migrate_sqlite só como ponte para bancos legados e carimbar a revisão base. Campanha tem slug único e imutável (regex + nomes reservados), sistema imutável, modulos_ativos, visibilidade (listada|so_link), mapa_arquivo, cota_bytes e bytes_usados. CLI para o super-admin: criar e listar campanhas. Fora de escopo: rotas por slug, contas, uploads controlados. Depende de: 092. Critérios-chave: dois bancos de campanha nunca se misturam (teste); um banco legado abre, migra e é carimbado sem perda de dados."

**Depends on**: [092-fundacao-testes](../092-fundacao-testes/spec.md); Campaign Codex RFC ([docs/v2/rfc-campaign-codex.md](../../docs/v2/rfc-campaign-codex.md) §2–§3, §9 fase 093); constituição v1.0.0 (I, II, III, IV, VI)

## Constitution

- Isolamento (I): **não** há rotas HTTP `/c/{slug}` nesta fase (094). A matriz HTTP A/B fica para 094. Isolamento MUST ser demonstrado no resolvedor: abrir a campanha A nunca lê ou escreve o conteúdo da campanha B. Sem `campanha_id` nas tabelas de conteúdo.
- Testes primeiro (II): migrações versionadas e a ponte de legado MUST ter testes a falhar **antes** da implementação correspondente (além do teste de isolamento A/B).
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD nem `git pull` em `/opt/codex-*`.
- Simplicidade (IV): armazenamento continua um ficheiro de conteúdo por campanha + um registo de controle. Alembic é a dependência nova justificada (princípio VI / RFC). Sem contas, sem cota enforced nos uploads.
- i18n (V): sem copy de interface nova. Erros de CLI/API MUST usar códigos mapeáveis, não frases num único idioma.
- Migrações (VI): schema de controle e de campanha MUST evoluir por revisões versionadas, em modo batch no SQLite. A migração ad hoc actual (`_migrate_sqlite`) MUST ficar só como ponte para ficheiros legados, seguida de carimbo da revisão.

## Clarifications

### Session 2026-09-19

- Q: Qual campanha o HTTP serve até existirem rotas por slug (094)? → A: Slug via ambiente; ausente/inválido → recusa, sem fallback
- Q: Como um ficheiro legado entra no sítio da campanha nesta fase? → A: Criar vazio pela CLI + copiar o legado para o sítio (sem CLI extra; cópia de produção fica 099)
- Q: Como se marca uma campanha inactiva nesta fase? → A: Campo `activa` existe (omissão verdadeira); CLI não desactiva; testes marcam inactivo no registo

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Super-admin cria uma campanha isolada (Priority: P1)

O super-admin, na linha de comando, cria uma campanha com nome público, identificador de URL (slug), sistema de jogo e visibilidade. O sistema reserva um sítio próprio para o conteúdo e a mídia dessa mesa (identificado por um id opaco, não pelo slug) e regista a campanha no livro de controle. O conteúdo da mesa (locais, personagens, posição do grupo, …) vive só nesse sítio.

**Why this priority**: Sem um sítio por campanha e um registo, 094–099 não têm onde isolar dados.

**Independent Test**: Criar uma campanha pela CLI; o registo lista o slug; existe pasta de conteúdo + mídia só dessa campanha; o schema de conteúdo está na revisão corrente.

**Acceptance Scenarios**:

1. **Given** um slug válido e livre, um nome e um sistema conhecido, **When** o super-admin cria a campanha, **Then** o registo contém essa linha (slug, sistema, módulos, visibilidade, cota, bytes usados a zero, mapa vazio) e o sítio de conteúdo está vazio mas pronto.
2. **Given** um slug já usado ou um nome reservado (ex.: `api`, `admin`, `login`), **When** se tenta criar, **Then** a operação é recusada e nenhum sítio novo fica pela metade.
3. **Given** uma campanha recém-criada, **When** se grava a posição do grupo (singleton id=1) nesse conteúdo, **Then** o valor persiste só nessa campanha.

---

### User Story 2 - Super-admin lista as campanhas (Priority: P1)

O super-admin corre um comando de listagem e vê as campanhas registadas (pelo menos slug, nome, sistema, visibilidade), sem abrir o conteúdo de cada mesa.

**Why this priority**: Operar N mesas exige inventário no controle, não vasculhar pastas.

**Independent Test**: Criar duas campanhas; a listagem contém as duas e não mistura linhas.

**Acceptance Scenarios**:

1. **Given** zero campanhas, **When** se lista, **Then** a saída é uma lista vazia (sucesso, não erro).
2. **Given** duas campanhas, **When** se lista, **Then** ambas aparecem com slug, nome, sistema e visibilidade.

---

### User Story 3 - Conteúdo de A nunca aparece em B (Priority: P1)

Há duas campanhas. O sistema abre o conteúdo pelo slug. Tudo o que se escreve enquanto se opera A é invisível ao abrir B, e o contrário. Os código de consulta existentes (incluindo o pin de grupo com id=1) continuam válidos **dentro** de cada ficheiro.

**Why this priority**: Critério-chave da fase; falha de isolamento é inaceitável (constituição I).

**Independent Test**: Popular A e B com dados distintos; resolver pelo slug A e afirmar ausência dos ids/nomes de B (teste automatizado obrigatório).

**Acceptance Scenarios**:

1. **Given** campanhas A e B, **When** se cria um local só em A, **Then** a listagem de locais ao abrir B não o contém.
2. **Given** grupo id=1 em A e id=1 em B com coordenadas diferentes, **When** se abre cada slug, **Then** cada um devolve o seu próprio grupo (o singleton por ficheiro continua correcto).
3. **Given** o mesmo processo da aplicação, **When** se abre A, depois B, depois A outra vez, **Then** os dados não se misturam (a reutilização de ligações não cruza campanhas).

---

### User Story 4 - Ficheiro legado abre, actualiza o schema e fica carimbado sem perda (Priority: P1)

O super-admin (ou o teste) **cria** a campanha pela CLI (sítio vazio) e **copia** um ficheiro de conteúdo no formato antigo para o sítio dessa campanha (substitui o ficheiro vazio). Não há comando CLI de «importar legado» nesta fase — a cópia de produção WFRP/WoD fica para 099. Ao **abrir** essa campanha, corre-se só a ponte de compatibilidade antiga, aplica-se o carimbo da revisão aplicável, e **nenhum** registo existente desaparece ou muda de id.

**Why this priority**: Critério-chave; 099 copiará `mapa.db` para este layout. Sem a ponte+carimbo aqui, o corte corrompe mesas.

**Independent Test**: CLI cria campanha; copiar fixture legado para o ficheiro de conteúdo do sítio; abrir; comparar contagens (e ids) de locais/NPCs/vínculos antes e depois — iguais. O ficheiro fica marcado na revisão versionada corrente.

**Acceptance Scenarios**:

1. **Given** campanha criada pela CLI e um conteúdo legado copiado para o seu sítio (N locais, M personagens), **When** a campanha abre, **Then** N e M (e os ids) permanecem iguais.
2. **Given** esse ficheiro já aberto uma vez, **When** abre de novo, **Then** a ponte ad hoc **não** volta a alterar o schema à revelia; o carimbo versionado é a fonte de verdade.
3. **Given** uma campanha **nova** (CLI, sítio vazio, sem cópia), **When** abre, **Then** nasce já na revisão corrente — sem passar pela ponte de legado.

---

### Edge Cases

- Slug com maiúsculas, espaços, `--` consecutivo, ou fora do comprimento permitido: recusa.
- Slug na lista reservada (mínimo RFC: `api`, `admin`, `c`, `login`, `painel`, `static`, `uploads`, `health`, `docs`, `config`, `gm`, `mapa`, `relacoes`, `assets`, `media`, `convite`, `reset`): recusa.
- Tentativa de alterar `slug` ou `sistema` ou `modulos_ativos` depois da criação: recusa (imutáveis).
- Campanha inexistente ou com `activa=false` ao resolver pelo slug: falha clara (código de erro), sem cair no ficheiro de outra mesa. Nesta fase a CLI **não** desactiva; o caminho inactivo cobre-se nos testes ao marcar o registo.
- Disco cheio ou pasta pela metade a meio da criação: nenhum registo órfão no controle sem sítio correspondente (ou o inverso); operação atómica do ponto de vista do operador.
- HTTP da app nesta fase: sem prefixo `/c/{slug}`; o processo escolhe a campanha por **slug no ambiente**. Ausente, desconhecido ou inactivo → recusa (código de erro), **sem** fallback para outra mesa ou para `mapa.db` legado.
- A suíte 092 injecta o slug da **única** campanha de teste; as caracterizações não relaxam.
- Uploads: a pasta existe por campanha; ACL e cota enforced ficam para 096 (`bytes_usados` / `cota_bytes` só são gravados no registo).
- Instâncias `/opt/codex-*` intocadas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir um **registo de controle** separado do conteúdo das mesas, com a entidade Campanha (não contas, não sessões).
- **FR-002**: Cada campanha MUST ter um sítio de conteúdo e uma pasta de mídia identificados por **UUID no caminho**, nunca pelo slug. O slug vive só no registo (e, em 094, na URL).
- **FR-003**: Abrir o conteúdo de uma campanha MUST resolver o ficheiro pelo **slug** no controle (campanha existente e activa) e entregar aos serviços/routers existentes uma sessão desse ficheiro — **sem** `campanha_id` nas tabelas de conteúdo e **sem** reescrever as consultas (singletons como grupo id=1 continuam por ficheiro). Até 094, o HTTP MUST obter esse slug **só** do ambiente; se o valor faltar, não existir ou a campanha estiver inactiva, MUST recusar o pedido (sem fallback para outra mesa).
- **FR-004**: Ligações a ficheiros de campanha MUST poder ser reutilizadas (cache), e essa reutilização MUST NOT cruzar campanhas (US3 cenário 3).
- **FR-005**: Schema do registo de controle e schema de conteúdo de campanha MUST evoluir por **revisões versionadas**, em modo compatível com as limitações de ALTER do SQLite (batch). Cada ficheiro de campanha MUST ser migrado ao abrir até a revisão corrente.
- **FR-006**: A migração ad hoc actual MUST correr **apenas** como ponte em ficheiros **legados** (detectados ao abrir um sítio cujo conteúdo ainda não está carimbado na revisão); a seguir MUST carimbar a revisão aplicável. Campanhas novas (sítio criado pela CLI, sem cópia) MUST nascer já na head, sem a ponte. MUST NOT existir CLI de importar legado nesta fase: o ensaio de legado é **criar + copiar ficheiro** (teste/fixture); a cópia operacional das instâncias antigas é 099.
- **FR-007**: `slug` MUST ser único, imutável, e corresponder a `^[a-z][a-z0-9-]{1,47}$` sem `--` consecutivo; a lista reservada do RFC §2.3 MUST ser recusada.
- **FR-008**: `sistema` e `modulos_ativos` MUST ser gravados na criação e MUST NOT ser alteráveis depois. Omissão de módulos na criação MUST seguir os defaults já usados por sistema (WFRP: fadiga; WoD: nenhum).
- **FR-009**: `visibilidade` MUST ser `listada` ou `so_link` (omissão: `listada`).
- **FR-010**: Campanha MUST guardar `mapa_arquivo` (vazio até haver mapa versionado), `cota_bytes` (omissão: 10 GB) e `bytes_usados` (omissão: 0). Esta fase MUST NOT aplicar teto de upload.
- **FR-011**: MUST existir CLI de super-admin para **criar** e **listar** campanhas (sem HTTP de gestão nesta fase). MUST NOT acrescentar comando de activar/desactivar nesta fase.
- **FR-012**: MUST existir teste automatizado de que o conteúdo de A é invisível ao abrir B (e o inverso).
- **FR-013**: MUST existir teste automatizado de que um conteúdo legado abre, fica na revisão corrente e conserva contagens e ids.
- **FR-014**: Esta feature MUST NOT introduzir rotas `/c/{slug}` nem `/api/c/{slug}`; MUST NOT criar contas, convites ou sessão de mestre; MUST NOT mudar a ACL de uploads.
- **FR-015**: A suíte da 092 MUST continuar a passar contra **uma** campanha de teste cujo slug o harness injecta no ambiente (layout novo, sem relaxar as caracterizações).

### Out of Scope

- Rotas HTTP por slug (094).
- Contas, convite, cookie de sessão, papéis dono/co-mestre (095). Tabelas de utilizador/membro/convite/sessão **não** entram nesta fase.
- Endpoint de mídia, mapa versionado enforced, aviso/bloqueio de cota (096).
- Exportar/importar zip (097) e corte das instâncias antigas (099).
- UI (home, painel, i18n de ecrãs novos).
- Coluna `campanha_id` nas tabelas de conteúdo.

### Key Entities

- **Registo de controle**: livro da instância (um ficheiro); nesta fase só campanhas.
- **Campanha**: slug (único, imutável), nome, sistema (imutável), módulos (imutáveis após criar), visibilidade (`listada` \| `so_link`), caminho UUID, mapa_arquivo, cota_bytes, bytes_usados, `activa` (omissão verdadeira; CLI cria sempre activa; desactivar fora desta CLI).
- **Sítio de conteúdo**: um ficheiro de dados da mesa + pasta de imagens; schema igual ao actual, **sem** id de campanha nas linhas.
- **Revisão versionada**: marca de schema no controle e em cada conteúdo; campanhas novas na head; legado ponte + carimbo.
- **Campanha de teste**: um sítio descartável usado pela suíte 092+093.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um super-admin cria duas campanhas distintas pela CLI em menos de 2 minutos (cada uma com sítio próprio).
- **SC-002**: 100% dos registos gravados ao operar a campanha A estão ausentes ao operar B (teste automatizado; 0 fugas no sentido inverso).
- **SC-003**: Ao abrir um conteúdo legado de fixture, as contagens e ids de locais, personagens e vínculos (os que o fixture tiver) são iguais antes e depois; o ficheiro fica marcado como schema corrente.
- **SC-004**: 100% das tentativas de criar slug reservado, duplicado ou malformado são recusadas, sem pasta órfã.
- **SC-005**: 0 alterações bem-sucedidas a `slug`, `sistema` ou `modulos_ativos` depois da criação.
- **SC-006**: A suíte de caracterização da 092 termina com 0 falhas após o harness apontar a uma única campanha de teste.

## Assumptions

- Dependência **Alembic** (revisões versionadas, `render_as_batch` no SQLite) é exigida pela constituição VI e pelo RFC; é a única dependência de produto nova desta fase.
- Layout em disco do RFC §2.1: `data/control.db` e `data/campanhas/<uuid>/{campanha.db,uploads/}`.
- Sem rotas por slug, o HTTP e o `get_session` dos routers usam o slug do ambiente (clarificação 2026-09-19). CLI e testes A/B passam o slug explicitamente. 094 substituirá a fonte do slug pela URL, não o resolvedor.
- Lista reservada e regex de slug: RFC §2.3. Cota omissão 10 GB: RFC §3 / brief.
- `activa`: campanhas criadas pela CLI nascem activas; resolver um slug inactivo ou inexistente falha sem fallback para outra mesa. Sem CLI de desactivar em 093 — só testes (e fases posteriores) marcam `activa=false`.
- Ponte `_migrate_sqlite` + carimbo é o ensaio do passo 3–4 de 099; a **cópia** WFRP/WoD de produção continua 099. Em 093 o teste faz a mesma sequência localmente (criar sítio + copiar fixture).
- A pasta `uploads/` do sítio nasce vazia na criação; copiar imagens de legado não é obrigatório nesta fase (só o ficheiro de conteúdo para US4).
- Contas (Usuario, Membro, Convite, Sessao) ficam para 095 mesmo que o RFC as desenhe no mesmo ficheiro de controle.
- CLI é invocável no repositório (`uv run` no backend), só para o operador da instância; não é ecrã na app.
- 092 permanece a rede de segurança; 093 acrescenta testes de isolamento e de legado, sem apagar caracterizações.

## Notes

- Documentar os dois comandos CLI no `backend/README.md`.
- Sem bump de versão de produto só por infraestrutura interna, salvo o plano da fase o exigir.
- Matriz HTTP `/api/c/{slug-a}` vs B é **094**, não esta spec.
