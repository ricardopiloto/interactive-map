# Research: Mapa (reconstrução) — 115

## 1. Escala estável dos pinos (KeepScale)

**Decision**: Reutilizar o mecanismo actual: `TransformWrapper` + CSS `--map-zoom` e `scale(calc(1 / var(--map-zoom, 1)))` nos pinos/marcadores. Não introduzir KeepScale de outra lib nem recalcular layout de zoom.

**Rationale**: Spec FR-007; já corrigido em UX-4 / CampaignMap.

**Alternatives considered**:
- `react-zoom-pan-pinch` pin wrappers com counter-scale JS — redundante.
- Redesenhar pinos sem counter-scale — regressão visual no zoom.

## 2. Contentor do painel

**Decision**: Novo `MapSidePanel` espelhando o protótipo: desktop `position:absolute; top/left/bottom:12px; width:~372px; border-radius:lg; shadow`; móvel folha inferior `data-expanded` + grabber. `MapPage` deixa de montar layout de coluna + `SideMenu`.

**Rationale**: FR-001/003; SideMenu.css é flush 340px — incompatível com a planta.

**Alternatives considered**:
- Só CSS no SideMenu (margem + radius) — ainda acoplado a tabs GM densas e overlay móvel full-screen.
- Manter SideMenu + esconder PinModal — falha o fluxo «mesmo cartão».

## 3. PinModal → detalhe no painel

**Decision**: Estado `selected: { kind: 'local'|'npc', id } | null` em `MapPage`. Clique no pino ou na lista define selecção e mostra detalhe dentro do painel; «Voltar» limpa. Remover montagem de `PinModal` no MapPage. Conteúdo de detalhe reutiliza MarkdownSafe / ImageSlot / links a NPCs como o PinModal, sem posicionamento absolute junto ao pino.

**Rationale**: FR-002; protótipo MapPage.

**Alternatives considered**:
- PinModal “dentro” do painel — API de placement inútil.
- Só lista sem detalhe no painel — falha SC-001.

## 4. Filtros Tudo / Locais / Personagens

**Decision**: Filtro client-side sobre `locais` + NPCs/personagens já carregados (`useCampaignData` / lista pública). Chips i18n. Em Modo edição, dados admin (hidden) já vêm se `asGm`; fora de edição, API já filtra.

**Rationale**: FR-004/009; sem endpoint novo.

**Alternatives considered**:
- Manter tabs SideMenu locais|npcs|arcos|rota|grupo — diverge do protótipo e da spec.

## 5. Ferramentas GM que viviam no SideMenu

**Decision**:
- **Local CRUD**: FAB + + `LocalFormDialog` / ConfirmDialog a partir do detalhe (como hoje via SideMenu callbacks).
- **NPC create/edit**: a partir do detalhe de personagem ou atalho compacto em Modo edição (Drawer já usado); não restaurar lista admin full-width.
- **Arcos / grupo / replace map**: controlos compactos no canto do mapa ou menu «⋯» de Modo edição no painel — mínimo para não perder capacidade; sem coluna flush.
- **RouteDigitizer**: fora de redesenho; botão/entrada «Rede de rotas» só em Modo edição que abre o `RouteDigitizerView` existente (full-screen overlay como hoje).

**Rationale**: Edge case da spec; YAGNI no digitalizador.

**Alternatives considered**:
- Adiar toda gestão GM para Relacoes/Painel — cortaria mesa no mapa.
- Manter SideMenu só para GM — duas UIs, falha captura «sem coluna flush».

## 6. Controlos de zoom

**Decision**: Manter `MapControls` dentro do `CampaignMap` (useControls); restilizar `.campaign-map__controls` / botões para stack translúcida + `border-radius: var(--radius-full)` / círculo, alinhado ao protótipo `map-canvas__controls`. Posição inferior direita; em móvel, offset acima da folha inferior / bottom nav (114).

**Rationale**: FR-006; só casca.

**Alternatives considered**: Extrair controlos para MapPage — mais churn sem ganho.

## 7. FAB +

**Decision**: Botão flutuante canto inferior **esquerdo** (oposto aos zooms), só se `useEditMode().enabled`; activa `placementMode: 'add-pin'` já suportado pelo CampaignMap.

**Rationale**: FR-008; protótipo `map-page__fab`.

## 8. Validação

**Decision**: Quickstart com capturas desktop claro/escuro + móvel vs. protótipo; checklist fluxo lista→detalhe→voltar; zoom scale smoke; FAB só em edição.

**Rationale**: Constituição II UI polish.
