# Research: 018-modal-viewport-fit

## 1. Onde aplicar o padrão de layout

**Decision**: Estender `.dialog` em `nocturne.css` com `max-height: min(90dvh, …)`, `display: flex; flex-direction: column; min-height: 0`, e introduzir `.dialog__body` (ou reutilizar `.dialog-body` como região `flex: 1; overflow: auto; min-height: 0`). Manter `.dialog-actions` com `flex-shrink: 0` no rodapé. Ajustar markup dos forms para envolver campos no body rolável. Alinhar `PinModal` ao mesmo contrato (hoje `overflow: auto` no `.pin-modal` inteiro faz o Fechar rolar junto).

**Rationale**: Um único estilo base cobre Local/NPC/Arco/Gate (US3) e evita duplicar CSS; pin precisa de mudança explícita para cumprir rodapé fixo.

**Alternatives considered**:
- Só CSS em `LocalFormDialog` — rejeitado (US3 / regressões).
- Portal + JS medindo altura — overkill; CSS `dvh` + flex basta.
- Scroll aninhado nos chips — rejeitado (clarificação).

## 2. Altura máxima

**Decision**: `max-height: min(90dvh, 100% - padding do backdrop)` efetivo via `max-height: 90dvh` no `.dialog` dentro de backdrop com `padding: var(--space-4)`. Fallback `90vh` se necessário (browsers antigos). Não forçar `height: 90dvh` (respeita FR-007 em conteúdo curto).

**Rationale**: SC-001 usa janela ≤700px; 90dvh deixa margem; `min()` evita painel maior que a área útil.

**Alternatives considered**:
- `max-height: 720px` fixo (já no pin) — insuficiente sozinho em mobile landscape / janelas baixas.
- `80dvh` — mais margem, mas menos área útil; 90dvh alinhado ao pin atual.

## 3. Markup do formulário de local

**Decision**: Em `LocalFormDialog`, estrutura:

```text
.dialog
  .dialog-title (shrink 0)
  .dialog__body (flex 1, overflow auto)  ← imagem, fields, chips
  .dialog-actions (shrink 0)
```

Mesmo padrão em Npc/Arco se ainda tiverem fields + actions irmãos diretos do título.

**Rationale**: Sem wrapper, `overflow` no `.dialog` inteiro reintroduz o bug do Fechar/Salvar sumindo no scroll.

**Alternatives considered**: `position: sticky` só em `.dialog-actions` com overflow no dialog — funciona em muitos browsers, mas sticky dentro de overflow do mesmo ancestor é frágil; flex + body scroll é mais previsível.

## 4. Pin modal (beside + centered)

**Decision**: Remover `overflow: auto` do container `.pin-modal`; aplicar max-height + flex; scroll só em região de conteúdo (imagem + markdown + chips); `.dialog-actions` fixo no rodapé. Em `--beside`, manter `position: fixed` e `max-height` baseado em viewport (ex. `min(90dvh, calc(100vh - top - pad))` se necessário; MVP: `max-height: 90dvh` + clamp de `top` já existente).

**Rationale**: Spec exige Fechar sempre visível; layout atual viola isso.

**Alternatives considered**: Deixar pin com scroll total — rejeitado (clarificação A).

## 5. Conteúdo curto

**Decision**: Não setar `height` fixa; só `max-height`. Dialog encolhe ao conteúdo; actions ficam logo abaixo do body.

**Rationale**: FR-007 / SC-004.
