# Research: Relações e Rota (reconstrução) — 116

## 1. Painel partilhado (dependência 115)

**Decision**: Reutilizar o mesmo `MapSidePanel` (shell desktop card + folha móvel `data-expanded`) entregue pela spec 115. Relações e Rota passam `head` + `children` (slots), sem fork de CSS estrutural. Se 115 ainda não estiver merged no branch de implementação, **bloquear** até o shell existir (ou cherry-pick só o shell) — não criar `RelacoesSidePanel` / `RotaSidePanel` paralelos.

**Rationale**: FR-003 / SC-001–002; critério-chave «mesmo componente».

**Alternatives considered**:
- Duplicar CSS do protótipo por página — diverge em semanas.
- Adaptar só `RelacoesDetailPanel` com margem — ainda é segundo contentor + coluna.

## 2. Relações: coluna + detalhe → um painel

**Decision**: Remover montagem de `RelacoesSideColumn` e `RelacoesDetailPanel`. Estado em `RelacoesPage`: `query`, filtros de família/tipo (já existentes), `selectedId`, `expanded`. Lista no body; detalhe reutiliza o conteúdo actual do detail panel (markdown, vínculos, status, acções de edição) **dentro** do `MapSidePanel`. «Voltar» limpa `selectedId`. Clique no nó do `GraphStage` e na lista sincronizam a mesma selecção.

**Rationale**: FR-001/004; protótipo RelacoesPage + MapSidePanel.

**Alternatives considered**:
- Manter DetailPanel floating separado — falha «nenhum painel antigo».
- Só esconder a coluna com CSS — detalhe continua solto.

## 3. GraphStage / layout radial

**Decision**: **Manter** `GraphStage` + `graphLayout.ts` (anéis focus/overview, opacidade dim/focus, quatro famílias). Confirmar na implementação que o comportamento radial (foco centro, directos internos, resto esmaecido) cobre FR-005; ajustes **só** de casca da página/legenda se a captura o exigir. MUST NOT portar `RelationGraph.tsx` do protótipo como substituição do motor.

**Rationale**: Spec 105 já entregou o motor; FR-005 / YAGNI.

**Alternatives considered**:
- Substituir por SVG do protótipo — perda de a11y/Tab/Enter e spacing compact/sparse já calibrados.
- Reescrever layout «mais igual ao next» — fora de escopo.

## 4. Filtros e legenda

**Decision**: Chips de família/tipo no `head` do painel (como protótipo) e/ou legenda sobre o grafo (já parcial no produto). Estado `activeTipos` / families continua a filtrar arestas no GraphStage. Busca filtra a lista client-side; visibilidade GM vs jogador continua via APIs já usadas.

**Rationale**: US3; sem endpoint novo.

**Alternatives considered**: Mover todos os filtros só para a legenda do grafo — piora mobile.

## 5. GM: personagem / vínculo

**Decision**: FAB ou menu «+» (protótipo: add personagem / add vínculo) só em Modo edição; abre `PersonagemFormDialog` / `VinculoFormDialog` existentes. Editar/excluir a partir do detalhe no painel + ConfirmDialog. Sem restaurar coluna admin.

**Rationale**: FR-009; paridade com FAB do Mapa (115).

## 6. Rota: rehost do planejador

**Decision**: `RotaPage` passa a layout full-bleed: `CampaignMap` (ou equivalente read-only para seleção de pinos de rota se já suportado) + `MapSidePanel`. Conteúdo do `RoutePlannerPanel` (origem/destino, opções modo/ritmo/ordenação/preferência, calcular, lista de resultados com tempo/distância/pernoites) renderiza-se nos slots do painel — preferir **refatorar** `RoutePlannerPanel` para aceitar `variant="panel"` / render props, em vez de copiar a lógica. Cartões clicáveis definem `selectedIndex`; `travelPlan` alimenta `RouteOverlay` no mapa.

**Rationale**: FR-002/006/008; spec 106 preservada.

**Alternatives considered**:
- iframe mental: manter `RoutePlannerPanel` ao lado do mapa com CSS novo — ainda casca própria.
- Reimplementar `computeRoutes` do protótipo — proibido (FR-008).

## 7. Destaque da rota com acento da campanha

**Decision**: Classe da rota seleccionada (hoje ligada a tokens de fadiga / visited) MUST usar o **acento da campanha** (`--color-accent` / token de género já activo pós-111) para o stroke principal da selecção na página Rota. Alternativas não seleccionadas permanecem secundárias (tracejado/dim). Timeline de fadiga por dia, se existir, MUST NOT ser apagada — pode coexistir (ex.: segmentos residuais) desde que a selecção activa leia-se como acento.

**Rationale**: FR-007; SC-004.

**Alternatives considered**: Manter `--route-fatigue-1` como cor da selecção — falha o critério visual do prompt.

## 8. Superfície canónica vs. aba Rota no Mapa

**Decision**: Após 115, o SideMenu (e a aba `rota` embutida) deixa de ser o padrão. Qualquer `RoutePlannerPanel` residual em `MapPage` MUST ser removido ou reduzido a deep-link para `/c/:slug/rota` nesta feature se ainda existir — a UX canónica é `RotaPage` com mapa + painel.

**Rationale**: Edge case da spec; evita duas cascas.

**Alternatives considered**: Manter planejador no mapa e na Rota — duplicação e captura inconsistente.

## 9. Deep-link personagem

**Decision**: Query `?personagem=` (já tratada em RelacoesPage) continua a seleccionar id e abrir **detalhe no MapSidePanel** (expanded), nunca RelacoesDetailPanel.

**Rationale**: Edge case da spec.

## 10. Validação

**Decision**: Quickstart com capturas desktop claro/escuro + móvel de Relações e Rota vs. protótipo e vs. painel do Mapa; fluxo lista→detalhe→voltar; calcular rota→cartões→destaque; i18n.

**Rationale**: Constituição II UI polish.
