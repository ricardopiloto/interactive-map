# UI Contract: Catálogo visual e i18n

**Feature**: `081-novos-tipos-vinculo`  
**Scope**: FR-004, FR-005 (cor), FR-006, FR-008, US2, SC-002, SC-003

## Fonte única

`frontend/src/components/relacoes/vinculoStyles.ts`:

- `VINCULO_TIPOS: VinculoTipo[]` — ordem canónica (8)
- `VINCULO_STYLES: Record<VinculoTipo, { color: string; dashed: boolean }>`

Consumidores (não reordenar):

- `VinculoFormDialog` — `<option>` dos selects
- `RelacoesSideColumn` — chips de filtro + legenda
- `RelacoesPage` — `useState(new Set(VINCULO_TIPOS))`
- `GraphStage` / detalhe — `vinculoStyle(tipo)` (cor da linha e bolinha)

## Ordem canónica

1. Aliado (`aliado`)
2. Vínculo de Sangue (`vinculo_sangue`)
3. Amizade (`amizade`)
4. Inimizade (`inimizade`)
5. Adversário (`adversario`)
6. Romance (`romance`)
7. Família (`familia`)
8. Conhecido (`conhecido`)

## Estilos novos

| ID | `color` | `dashed` |
|----|---------|----------|
| `adversario` | `#c86b3c` | `false` |
| `vinculo_sangue` | `#6a3d8c` | `false` |

Grafo: mesma geometria de seta/etiqueta dos tipos assimétricos existentes quando `direcao` está definida.

## i18n (`relacoes` namespace)

```json
"vinculoTipo": {
  "adversario": "Adversário | Adversary",
  "vinculo_sangue": "Vínculo de Sangue | Blood Bond"
}
```

Labels via `getVinculoTipoLabel(t, tipo)` — nunca hardcoded no JSX.

## Filtros

- 8 chips; cor do chip = `VINCULO_STYLES[tipo].color`
- Filtrar por `adversario` isola só arestas cujo tipo visível é `adversario` (mesma função `edgeMatchesTipos` actual)
- Toggle “último chip desliga → religa todos” continua a usar `VINCULO_TIPOS` (passa a religar 8)
