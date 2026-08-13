# UI Contract: Paleta de tipos de vínculo

**Feature**: `085-vinculo-color-rethink`  
**Scope**: FR-001–FR-005, US1, US2, SC-001, SC-002  
**Supersedes (cores)**: [081 `ui-vinculo-catalog.md`](../../081-novos-tipos-vinculo/contracts/ui-vinculo-catalog.md) — só as linhas `vinculo_sangue` e `inimizade`. Ordem, `dashed`, i18n e consumidores **não** mudam.

## Fonte única

`frontend/src/components/relacoes/vinculoStyles.ts`:

```ts
export const VINCULO_STYLES: Record<VinculoTipo, { color: string; dashed: boolean }>
```

Consumidores (não reordenar, não hardcode hex):

- `RelacoesSideColumn` — chips de filtro + legenda
- `GraphStage` — `stroke` da linha e gradiente duas vias
- `RelacoesDetailPanel` — bolinha e texto de tipo
- `vinculoDirection.ts` — `colorA` / `colorB` do gradiente

## Estilos (8)

| ID | `color` | `dashed` |
|----|---------|----------|
| `aliado` | `var(--color-accent)` | `false` |
| `vinculo_sangue` | `#9e2436` | `false` |
| `amizade` | `#79c48f` | `false` |
| `inimizade` | `#d12d9a` | `false` |
| `adversario` | `#c86b3c` | `false` |
| `romance` | `#e08fc0` | `false` |
| `familia` | `#d9a35b` | `false` |
| `conhecido` | `#9397ab` | `true` |

Chip e legenda: `background` / swatch = `VINCULO_STYLES[tipo].color`.  
Grafo recíproco: `stroke = style.color`.  
Grafo duas vias: `url(#vinculo-grad-${id})` com stops `tipo_ab` e `tipo_ba`.

## Proibições

- Hex de tipo noutros ficheiros TS/CSS.
- Alterar `VINCULO_TIPOS` (ordem canónica).
- Alterar `dashed` (só `conhecido` é `true`).
- Alterar labels i18n (`vinculoTipo.*`).
