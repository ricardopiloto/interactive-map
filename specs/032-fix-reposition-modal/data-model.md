# Data Model: 032-fix-reposition-modal

Sem entidades de persistência novas. Modelo de **estado de apresentação** no cliente.

## Entities (UI state)

### LocalFormDraft (existente)

Rascunho de edição/criação de local em `MapPage` (`localDraft`).

| Campo relevante | Notas |
|-----------------|--------|
| `x`, `y` | Actualizados só no clique de reposition (ou ao criar via add-pin) |
| restantes | Preservados enquanto `localDraft` não for `null` |

**Regra**: Durante `placement === 'reposition'`, o draft **permanece** não-nulo mesmo com o dialog desmontado.

### Placement (existente)

`Placement = 'none' | 'add-pin' | 'reposition' | 'move-group'`

| Valor | Dialog LocalForm | Banner mapa | Clique mapa |
|-------|------------------|-------------|-------------|
| `none` | Visível se `localDraft` | — | — |
| `reposition` | **Oculto** (não montado) | Aviso + **Cancelar** | Actualiza `x/y`, volta a `none` |
| `add-pin` | — (ainda sem draft) | Aviso (sem Cancelar obrigatório nesta feature) | Cria draft |
| `move-group` | — | Aviso | Actualiza grupo |

## State transitions

```text
[Editando: localDraft set, placement=none, dialog visível]
        │ onStartReposition
        ▼
[Reposicionando: localDraft set, placement=reposition, dialog oculto]
        │
        ├─ clique mapa ──► localDraft.x/y actualizados, placement=none, dialog visível
        │
        └─ Cancelar banner ──► placement=none, localDraft inalterado, dialog visível

[Editando] ── onCancel dialog ──► localDraft=null, placement=none
[Editando] ── onSave ──► persistência existente; limpa draft (fluxo actual)
```

## Validation / invariants

- Nunca `placement === 'reposition'` com `localDraft == null` (iniciar reposition só a partir do dialog de edição).
- Cancelar reposition **não** persiste nem reverte save; só estado UI.
- Cancelar edição (`localDraft = null`) descarta rascunho incluindo coords não salvas (FR-006).
