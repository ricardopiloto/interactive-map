# Research: 010-gm-deselect-pin

## 1. Por que o GM não consegue deselecionar hoje

**Decision**: Tratar como lacuna de interação, não de dados. `MapPage` guarda `selectedLocalId`; pins chamam `onSelectLocal`. Em modo GM, `PinModal` **não** monta (`{!isGm && selectedLocal && (...)}`), então não há “Fechar” / backdrop para zerar a seleção. `CampaignMap.handleStageClick` retorna cedo quando `!placing`, logo clique na área vazia é ignorado.

**Rationale**: Explica o sintoma “fica selecionado e não consigo deselecionar” só no GM.

**Alternatives considered**:
- Bug de CSS de seleção → falso; o estado permanece em React
- Auth / API → irrelevante; seleção não é persistida

## 2. Onde implementar o clique-fora

**Decision**: Estender o handler do **stage** em `CampaignMap`:
1. Se `placing` → comportamento atual (coordenadas → `onMapClickRelative`).
2. Se `!placing` e houver callback de limpar seleção (ex. `onClearSelection` / `onBackgroundClick`) → invocá-lo.
3. Pins já usam `stopPropagation` → clique no pin não limpa.
4. Em `MapPage`, o callback faz `setSelectedLocalId(null)` (e não toca em `localDraft`).

Habilitar o callback preferencialmente só quando `isGm` (FR-009), ou sempre limpar seleção no clique vazio — efeito no jogador é neutro se o modal já controla o ciclo; default do plano: **só passar o callback em modo GM** para respeitar o escopo da spec.

**Rationale**: Reusa a superfície já usada para placement; mínimo de superfície de API; alinha FR-001/006.

**Alternatives considered**:
- Botão “Limpar seleção” → rejeitado pelas assumptions da spec
- Esc / tecla → fora do pedido; YAGNI nesta entrega
- Listener global `document` → risco de conflitar com menu/diálogos (FR-008)

## 3. Prioridade placement vs deseleção

**Decision**: Manter `placing` como ramo exclusivo. Enquanto `placementMode !== 'none'`, **não** chamar clear selection no mesmo clique que posiciona (FR-006). Após o fluxo voltar a `none`, cliques vazios voltam a deselecionar.

**Rationale**: Evita regressão nos fluxos add-pin / reposition / move-group (US2).

**Alternatives considered**: Limpar seleção *e* posicionar no mesmo clique → possível, mas desnecessário; o posicionamento já muda o foco do usuário.

## 4. Pan/zoom vs clique

**Decision**: Usar o evento `click` do stage (não `pointerdown` sozinho). Se pan do `react-zoom-pan-pinch` gerar `click` espúrio após arrasto, aplicar guarda leve (ex. ignorar se o alvo do gesto teve movimento acima de um limiar, ou confiar no comportamento atual da lib se já filtrar). Validar no quickstart (SC-004); só adicionar threshold se o teste falhar.

**Rationale**: FR-007; evitar over-engineering antes de evidência.

**Alternatives considered**: Desabilitar deselect sempre que `scale !== 1` → incorreto; usuário pode querer deselecionar com zoom.

## 5. Grupo, controles e legenda

**Decision**:
- Controles de zoom / “Mapa” e legenda ficam **fora** do stage → não disparam deselect (FR-008).
- Ícone do grupo é filho do stage **sem** `stopPropagation` hoje → um clique nele pode borbulhar e deselecionar. Spec: só área vazia deve deselecionar; grupo não precisa deselecionar. **Adicionar `stopPropagation` (e opcionalmente `pointer-events` sem ação) no marker do grupo** para não limpar seleção.

**Rationale**: Edge case explícito na spec.

**Alternatives considered**: Deixar clique no grupo deselecionar → contradiz o default documentado na spec.

## 6. Ficha vs formulário admin (clarificação A)

**Decision**: Clear = apenas `selectedLocalId = null`. Isso fecha qualquer UI ligada à seleção (hoje: destaque do pin; futuro/jogador: `PinModal`). **Não** chamar `setLocalDraft(null)`.

**Rationale**: FR-004 / FR-005 e clarificação da sessão 2026-08-03.

**Alternatives considered**: Fechar todos os diálogos GM → rejeitado pelo usuário (opção C).

## 7. Backend / persistência

**Decision**: Nenhuma mudança de API, schema ou storage.

**Rationale**: Seleção é estado de sessão (Key Entities da spec).

**Alternatives considered**: Persistir “último pin selecionado” → fora de escopo.
