# Research: 017-location-connections

## 1. Persistência das conexões dirigidas

**Decision**: Tabela de vínculo `local_conexao` com PK composta `(origem_id, destino_id)` (FKs → `local.id`), espelhada na API como `saida_ids: number[]` em Local (create/update/read), no mesmo espírito de `npc_ids` + `LocalNPCLink`.

**Rationale**: A relação é dirigida e auto-referencial; M2M simétrico de NPC não serve. Lista de IDs no schema mantém o contrato familiar do Codex e o sync no admin router (`_sync_saidas`).

**Alternatives considered**:
- Campo JSON `saida_ids` na coluna do local — rejeitado (integridade referencial fraca; exclusão de destino deixa IDs órfãos).
- Endpoint CRUD separado `/api/admin/conexoes` — rejeitado (clarificação: cadastro no formulário do local; evita superfície extra).
- Inferir rotas por `data_sessao`/arco — fora de escopo (spec).

## 2. Desenho das linhas no mapa

**Decision**: Overlay SVG (ou equivalente) **dentro** de `.campaign-map__stage`, com linhas em coordenadas percentuais (`x*100%`, `y*100%`) iguais aos pins; `pointer-events: none`; `z-index` abaixo dos pins; renderizar **somente** se `selectedLocalId` estiver definido, usando `saida_ids` desse local e as coordenadas dos destinos em `locais`.

**Rationale**: Pins já usam % relativos ao stage; o TransformWrapper escala o stage inteiro, então as linhas acompanham zoom/pan sem math extra. `pointer-events: none` preserva clique em pin/placement (US3).

**Alternatives considered**:
- Canvas absoluto em viewport screen space — rejeitado (recalcular em todo pan/zoom).
- Linhas sempre visíveis com opacidade baixa — rejeitado (clarificação: só no foco).
- Setas SVG / markers — rejeitado (clarificação: linha simples).

## 3. Momento de exibir / ocultar

**Decision**: Fonte de verdade de foco = `selectedLocalId` em `MapPage` (abrir pin ou selecionar no menu). Linhas somem quando `selectedLocalId` vira `null` (fechar modal / deselecionar GM). Hover (`hoveredLocalId`) **não** mostra linhas.

**Rationale**: Spec amarra linhas a “selecionar ou abrir detalhe”; hover já é só destaque de pin (005/016). Evita flicker ao percorrer a lista.

**Alternatives considered**:
- Mostrar também no hover — rejeitado (conflito com “só no foco” e ruído).
- Toggle global “mostrar rotas” — fora de escopo.

## 4. UX do formulário GM

**Decision**: No `LocalFormDialog`, seção “Saídas” com checkboxes (ou multi-select) dos **outros** locais (`id !== draft.id`); draft carrega/salva `saida_ids`; ao criar local novo, lista vazia até existir `id` (destinos ainda selecionáveis entre locais já existentes).

**Rationale**: Clarificação A; espelha o padrão de `npc_ids` no mesmo dialog.

**Alternatives considered**:
- Modo clicar pins no mapa — fora de escopo.
- Select único (um destino) — rejeitado (spec: zero..N saídas).

## 5. Cascata na exclusão

**Decision**: Ao deletar um local, remover todas as linhas de `local_conexao` onde ele é origem **ou** destino (SQLAlchemy/SQLite CASCADE na FK ou delete explícito no router admin antes/depois do delete do local).

**Rationale**: FR-010; evita linhas fantasma apontando para IDs inexistentes.

**Alternatives considered**: Deixar órfãos e filtrar no read — rejeitado (lixo no banco).

## 6. Migração / bootstrap

**Decision**: Declarar `LocalConexaoLink` no metadata SQLModel; `SQLModel.metadata.create_all` no startup já cria a tabela em DBs existentes (mesmo padrão de tabelas novas). Sem coluna nova em `local`.

**Rationale**: `database.py` já chama `create_all` + migrações ad-hoc só para colunas; link table nova não precisa de ALTER.

**Alternatives considered**: Script Alembic — overkill para o projeto atual.
