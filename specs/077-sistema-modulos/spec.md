# Feature Specification: Sistema & Módulos de Mecânica

**Feature Branch**: `077-sistema-modulos`

**Release**: Codex **v2.0.0** (Frente A)

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Motor agnóstico de sistema — permitir que cada instância/deploy do Codex use regras opcionais (ex. fadiga WFRP) sem impor mecânicas a sistemas que não as têm.

**Depends on**: Codex v1 em produção (mapa, rotas, relações)

**Source**: [docs/v2/rfc-motor-agnostico-sistema.md](../../docs/v2/rfc-motor-agnostico-sistema.md), [product-brief](../../docs/v2/product-brief-codex-multissistema.md)

## Clarifications

### Session 2026-08-13

- Q: Quando `MODULOS_ATIVOS` está vazio ou ausente, como determinar módulos activos? → A: Defaults por `SISTEMA` (ex.: `wfrp4e`→fadiga; `wod`→nenhum); `MODULOS_ATIVOS` explícito no `.env` sobrescreve os defaults.
- Q: Comportamento ao receber chaves de mecânica inactivas na API (edge case)? → A: Ignorar silenciosamente — grava campos universais do personagem; chaves de mecânica inactivas não persistem; na leitura omitir chaves inactivas. UI normal não expõe esses campos.
- Q: O que define "campanha sem mapa" para landing em Relações? → A: Backend expõe `has_map_image: true/false` no config da instância (ficheiro de mapa existe no servidor).
- Q: Endpoint de config da instância requer autenticação? → A: Público — leitura read-only sem auth; expõe apenas metadados de instância (`sistema`, `modulos_ativos`, `has_map_image`).
- Q: Módulo activo no `.env` sem widget implementado — o que mostrar? → A: Aviso discreto só ao mestre (Modo GM): módulo listado mas indisponível; jogadores não veem nada.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instância configurada para um sistema (Priority: P1)

O sysadmin define, por deploy, qual **sistema** a instância representa (ex. WFRP, WoD) e quais **módulos de mecânica** estão activos (ex. fadiga). A aplicação expõe essa configuração de forma consistente para mestre e jogadores — sem opção de trocar sistema em runtime numa mesma instância.

**Why this priority**: Desbloqueia outros mestres e sistemas sem herdar regras WFRP.

**Independent Test**: Deploy WoD com `SISTEMA=wod` e `MODULOS_ATIVOS` vazio → nenhum campo de fadiga; deploy WFRP com `SISTEMA=wfrp4e` e `MODULOS_ATIVOS` omitido → fadiga activa por default; override explícito `MODULOS_ATIVOS=` desactiva todos os módulos mesmo em `wfrp4e`.

**Acceptance Scenarios**:

1. **Given** instância WoD sem módulos activos, **When** mestre abre ficha de personagem, **Then** não vê controlos de fadiga nem outra mecânica desactivada.
2. **Given** instância WFRP com módulo fadiga activo, **When** mestre edita personagem, **Then** vê e grava fadiga normalmente.
3. **Given** jogador (sem Modo GM), **When** consulta ficha, **Then** vê apenas mecânicas activas na instância.

---

### User Story 2 - Mecânicas extensíveis por personagem (Priority: P1)

Valores de mecânica específica (ex. nível de fadiga) ficam associados ao **personagem** como extensões opcionais — os campos universais (nome, estado, vínculos, etc.) permanecem iguais em qualquer sistema.

**Why this priority**: Evita migrations repetidas quando surgir sanidade, pontos de destino, etc.

**Independent Test**: Personagem WFRP com fadiga=2 persiste e relê após restart; personagem em instância sem fadiga não tem chave fadiga exposta.

**Acceptance Scenarios**:

1. **Given** módulo fadiga activo, **When** mestre define fadiga e grava, **Then** valor persiste e reaparece ao reabrir.
2. **Given** módulo fadiga inactivo, **When** payload inclui chave `fadiga` (edge case fora da UI), **Then** gravação do personagem prossegue e a chave inactiva é descartada sem erro.
3. **Given** personagem existente migrado de v1, **When** abre ficha na instância WFRP, **Then** fadiga anterior continua legível.

---

### User Story 3 - Tela inicial sem mapa (Priority: P2)

Quando a instância reporta **`has_map_image: false`** (sem ficheiro de mapa no servidor), a aba inicial ao abrir o Codex é **Relações**, não Mapa. Mapa continua acessível na navegação.

**Why this priority**: Campanhas sem mapa (ou mapa ainda não carregado) não devem abrir num ecrã vazio.

**Independent Test**: Instância com `has_map_image: false` no config → landing em `/relacoes`; com `has_map_image: true` → landing em mapa como hoje.

**Acceptance Scenarios**:

1. **Given** config com `has_map_image: false`, **When** utilizador abre a raiz do app, **Then** vê Rede de Relações como ecrã inicial.
2. **Given** config com `has_map_image: true`, **When** abre a raiz, **Then** comportamento actual (Mapa primeiro) mantém-se.
3. **Given** qualquer caso, **When** clica "Mapa" ou "Relações", **Then** navegação entre abas funciona igual.

---

### Edge Cases

- Módulo activo no `.env` mas widget ainda não implementado: **omitir para jogadores**; em **Modo GM**, mostrar aviso discreto de que o módulo está activo mas indisponível (sem UI quebrada).
- Migração WFRP: dois passos (copiar dados → validar → remover coluna antiga); produção não migrada num único deploy cego.
- Rotas em mph e rede de relações permanecem **universais** — nunca condicionados a `SISTEMA`.
- Conteúdo do mestre (notas, nomes) nunca traduzido nem alterado por config de sistema.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada instância MUST ter configuração fixa de **sistema** e **módulos activos** (por deploy, não por utilizador). Se `MODULOS_ATIVOS` estiver ausente ou vazio, MUST aplicar defaults por `SISTEMA` (ex.: `wfrp4e`→`["fadiga"]`, `wod`→`[]`); valor explícito em `MODULOS_ATIVOS` MUST sobrescrever os defaults.
- **FR-002**: Mapa, locais, NPCs/PJs, arcos, rotas (mph), rede de relações MUST permanecer **universais** — sem campos condicionais por sistema; dados universais do personagem MUST gravar-se igualmente independentemente dos módulos activos.
- **FR-003**: Mecânicas opcionais (ex. fadiga) MUST armazenar-se em extensões por personagem, não em colunas fixas por módulo.
- **FR-004**: UI de personagem MUST renderizar controlos **só** para módulos activos **com widget implementado**; módulos activos sem widget MUST omitir-se para jogadores e MUST mostrar aviso discreto ao mestre em Modo GM.
- **FR-005**: API MUST expor configuração da instância (`sistema`, `modulos_ativos`, `has_map_image`) via endpoint **público read-only** (sem autenticação), para o cliente decidir o que mostrar e qual ecrã inicial usar.
- **FR-006**: API MUST filtrar extensões de mecânica contra módulos activos: na **escrita**, chaves inactivas MUST ser descartadas silenciosamente (campos universais gravam normalmente); na **leitura**, chaves inactivas MUST ser omitidas da resposta.
- **FR-007**: Migração da campanha WFRP v1 MUST preservar valores de fadiga existentes antes de remover armazenamento legado.
- **FR-008**: Com `has_map_image: false`, ecrã inicial MUST ser Relações; com `has_map_image: true`, ecrã inicial MUST ser Mapa.

### Key Entities

- **Configuração de instância**: sistema (identificador), lista de módulos activos (defaults por sistema, override via `.env`), `has_map_image` (ficheiro de mapa presente no servidor).
- **Personagem**: campos universais (invariantes entre sistemas) + extensões de mecânica opcionais (mapa chave→valor, só módulos activos persistem/exibem).
- **Módulo de mecânica**: unidade plugável (fadiga é o primeiro; futuros entram sem mudar modelo universal).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um mestre non-WFRP configura instância sem fadiga e usa mapa + relações em sessão sem ver controlos WFRP.
- **SC-002**: **100%** dos personagens WFRP migrados mantêm fadiga legível após upgrade v2.
- **SC-003**: Adicionar um módulo futuro (ex. sanidade) não exige alterar entidades universais (locais, vínculos, rotas).
- **SC-004**: Instância com `has_map_image: false` abre em Relações em **≤2 segundos** percepção de utilizador (sem ecrã vazio de mapa).

## Assumptions

- Uma instância = um sistema fixo (multi-deploy, não multi-tenant na app).
- Fadiga é o único módulo implementado no lançamento v2; extensibilidade do modelo basta para futuros.
- Sysadmin (Ricardo) configura `.env`; mestres não alteram módulos.
- Defaults por sistema documentados no plan (ex.: `wfrp4e` inclui fadiga; sistemas sem mecânicas conhecidas começam com lista vazia).
- Revisão formal de specs 066–076 (rotas/relações) confirma agnosticismo — já assumido OK no brief.
