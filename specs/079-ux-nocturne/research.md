# Research: UX Nocturne & Débitos

**Feature**: `079-ux-nocturne`  
**Date**: 2026-08-13

## 1. Layout da digitalização (coluna lateral)

**Decision**: Reorganizar `RouteDigitizerView` de grid `rows: … auto` (listas em baixo) para **flex/grid com coluna fixa 236px** à esquerda + palco do mapa à direita. Coluna inclui: campo de busca, secções colapsáveis "Waypoints" / "Arestas" (default **expandidas**), listas filtradas.

**Rationale**: FR-001–003; RFC §1.3; espelha `RelacoesSideColumn` (236px) e `SideMenu` (busca no topo).

**Alternatives considered**: Reutilizar `RelacoesSideColumn` directamente — rejeitado (conteúdo diferente: chips vs listas de nós). Extrair `SearchSideColumn` genérico — adiado (YAGNI até 3.ª tela pedir).

## 2. Busca na digitalização

**Decision**: Reutilizar `labelMatchesQuery` (`frontend/src/utils/textMatch.ts`). Waypoints: filtrar por `nome` (fallback `#id`). Arestas: filtrar por `segmentIdentity` (labels dos dois nós + tipo).

**Rationale**: FR-002; mesma UX de Mapa/Relações; filtro client-side instantâneo.

**Alternatives considered**: Busca só waypoints — rejeitado (spec exige simultânea).

## 3. Selecção lista → centrar no mapa

**Decision**:

- **Waypoint**: chamar `setTransform` do `TransformWrapper` (ref via `useControls` ou callback) para centrar `(x, y)` normalizado; aplicar classe `is-focused` no pin; scroll da lista para o item.
- **Aresta**: centrar ponto médio entre nós A/B (ou primeiro ponto intermédio); highlight polyline + row na lista (reutilizar `hoveredSegmentId`).

**Rationale**: FR-003; confirmação visual além da busca (RFC §1.3).

**Alternatives considered**: Só scroll na lista — rejeitado (não cumpre centrar no mapa).

## 4. Bottom sheet mobile (digitalização)

**Decision**: Em `max-width: 800px`, coluna torna-se **bottom sheet retrátil** com toggle flutuante (FAB ou botão na barra). CSS/modelo copiado de `RelacoesDetailPanel` mobile (`position: fixed; bottom: 0; max-height: 70dvh; border-radius` superior). Estado `listSheetOpen` default **false** — mapa ocupa palco quando fechada.

**Rationale**: Clarifications Q2/Q4/Q5; FR-004; Rede **não** muda layout mobile (FR-004a).

**Alternatives considered**: Painel fixo 38vh — rejeitado na clarify. Drawer lateral — rejeitado.

## 5. Pinch-zoom na Rede (`GraphStage`)

**Decision**: Implementar pinch via **Pointer Events nativos** num hook `usePinchZoom` que expõe `onPinch(deltaScale)` integrado ao estado `scale` existente. Roda mantém `handleWheel` com factor 0.9/1.1. Ignorar pointer extra quando `pointers.size > 2`. Não iniciar pan/node-drag enquanto pinch activo.

**Rationale**: FR-005; RFC §2.3; `GraphStage` já tem transform custom (não usa `react-zoom-pan-pinch`); unificar num único `setScale`.

**Alternatives considered**: `@use-gesture/react` — rejeitado nesta frente (nova dependência; hook nativo ~80 LOC e reutilizável para Mapa se necessário). Migrar GraphStage para `react-zoom-pan-pinch` — rejeitado (refactor grande, risco em layout de nós).

## 6. Verificação pinch no Mapa principal

**Decision**: Testar `CampaignMap` em dispositivo touch no quickstart. `react-zoom-pan-pinch` v4 suporta pinch por default — se falhar, activar/configurar `pinch` options ou aplicar `usePinchZoom` no wrapper. Corrigir na mesma PR se gap confirmado (FR-005a).

**Rationale**: Clarification Q1; causa raiz provável diferente (lib vs custom wheel-only).

## 7. Diretriz Nocturne — elevação

**Decision**:

- Adicionar tokens CSS: `--elevation-column: var(--shadow-md)`, `--elevation-panel: var(--shadow-lg)`, `--elevation-modal: var(--shadow-lg)` (ou sombras dedicadas sem hairline grosso).
- Colunas (`SideMenu`, `RelacoesSideColumn`, coluna digitalização): **remover** `border-right` como separador principal; usar `box-shadow` lateral + fundo `var(--color-surface)`.
- Painel detalhe / modais: sombra mais forte que coluna; backdrop `.dialog-backdrop` escurecido (~`rgba(0,0,0,0.55)`).
- Accent blurple: auditar — só `.btn-primary`, `.btn-ghost`, chips activos, nós seleccionados; remover de elementos estáticos se existirem.

**Rationale**: FR-006–008; RFC Parte 2; tokens `--shadow-*` já existem mas incluem hairline 1px — ajustar para sombra ambiente dominante.

**Alternatives considered**: Mudar coluna Relações para flutuante — rejeitado (spec mantém fixa). Tema claro — fora de escopo.

## 8. Diálogos GM — agrupamento

**Decision**: Introduzir `.dialog__group` em `nocturne.css` (fieldset visual sem `<fieldset>`): título pequeno + grid/flex para campos relacionados. Aplicar em:

| Diálogo | Agrupamentos |
|---------|----------------|
| `PersonagemFormDialog` | identidade / módulos / notas |
| `VinculoFormDialog` | personagens A+B / tipo+qualificador+direção / nota |
| `LocalFormDialog` | nome+arco / coordenadas / imagem |
| `NpcFormDialog` | nome+retrato / facção+status |
| `ArcoFormDialog` | título+ordem / resumo |
| Digitalização inline forms | manter na barra/tools; modais futuros herdam tokens |

**Rationale**: FR-007a; RFC §5.5. `AdminGateDialog` fora — não é formulário GM de conteúdo.

## 9. Versioning

**Decision**: Bump **0.14.0** na implementação da frente C.

**Rationale**: Sequência 077→0.12, 078→0.13; shippable increment; 2.0.0 quando 077–080 fecharem.
