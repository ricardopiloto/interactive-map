# Research: 032-fix-reposition-modal

## 1. Causa raiz do bug

**Decision**: Tratar como lacuna de orquestração UI, não de placement no mapa. `onStartReposition` já faz `setPlacement('reposition')` e o `CampaignMap` já mostra o banner e aceita `onMapClickRelative` nesse modo. Porém `MapPage` continua a renderizar `{localDraft && <LocalFormDialog …>}` — o backdrop (`z-index: 95`) cobre o mapa e impede o clique.

**Rationale**: Explica o sintoma exacto reportado (“não esconde o modal”).

**Alternatives considered**:
- Clique no mapa “não está ligado” → falso; handler existe
- Backend / coordenadas inválidas → irrelevante até o clique acontecer

## 2. Como ocultar o formulário

**Decision**: Condicionar a montagem: renderizar `LocalFormDialog` só quando `localDraft != null && placement !== 'reposition'`. Manter `localDraft` no estado React durante o modo (FR-004). Ao `setPlacement('none')` (após clique ou cancel), o dialog volta a montar com o mesmo draft.

**Rationale**: Simples, sem pointer-events frágeis; unmount remove foco/trap do dialog; reaparece automaticamente.

**Alternatives considered**:
- `visibility` / `pointer-events: none` no backdrop → ainda montado; a11y e foco piores
- Extrair draft para store global → overkill
- Fechar draft (`null`) e guardar snapshot noutro estado → mais código, risco de perder campos

## 3. Cancelar no banner (clarificação)

**Decision**: No `CampaignMap`, quando `placementMode === 'reposition'`, o banner inclui um controlo **Cancelar** que chama `onCancelPlacement?.()`. Em `MapPage`, o handler faz apenas `setPlacement('none')` (não altera `localDraft.x/y`). Não obrigatório para `add-pin` / `move-group` nesta feature (escopo FR-005).

**Rationale**: Cumpre clarificação Session 2026-08-03; cancel fica visível onde o aviso já está.

**Alternatives considered**:
- Só Escape → rejeitado na clarificação
- Cancelar no painel Locais → formulário oculto; painel pode não estar no foco
- Cancelar em todos os modos placement → possível follow-up; YAGNI agora

## 4. Após clique no mapa

**Decision**: Manter o ramo existente: `placement === 'reposition' && localDraft` → `setLocalDraft({ ...localDraft, x, y }); setPlacement('none')`. Com a condição de montagem, o dialog reaparece com as novas coords (FR-003).

**Rationale**: Zero mudança no cálculo de coordenadas; só overlay.

**Alternatives considered**: Adiar reabertura do dialog até “Continuar edição” → piora o fluxo; spec pede reaparecer.

## 5. Interacção com outros modos

**Decision**: Um único `placement` em `MapPage` já impede modos concorrentes. Ao iniciar reposition a partir do dialog, não é necessário limpar outros estados além de `setPlacement('reposition')`. Não alterar `onClearSelection` / deselect GM.

**Rationale**: Edge case da spec já coberto pelo enum exclusivo.

## 6. Persistência e vínculo nó↔local

**Decision**: Fora de âmbito. Save continua a enviar `x/y` do draft; regras de `waypoint_id` inalteradas.

**Rationale**: Assumptions da spec.
