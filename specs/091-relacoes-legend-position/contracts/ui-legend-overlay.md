# UI Contract: Overlay da chave (Relações)

**Feature**: `091-relacoes-legend-position`  
**Scope**: FR-001–FR-011, US1, SC-001–SC-008

## Superfície

Palco da Rede (`.graph-stage`), canto **inferior esquerdo**, irmão dos controlos de zoom. **Não** na coluna.

```text
.graph-stage
  .graph-stage__world     # pan/zoom — discos e linhas
  .graph-stage__legend    # overlay fixa, pointer-events: none
  .graph-stage__zoom      # inferior direito
```

Coluna: busca, chips, lista, estado, Isolar. **Sem** bloco de legenda.

## Overlay

| Propriedade | Contrato |
|-------------|----------|
| Âncora | `left` + `bottom` do palco (mesmo canto que `.campaign-map__legend`) |
| Layout | coluna; um item por linha |
| Título visível | ausente |
| `aria-label` | `relacoes:column.legend` |
| Fundo / borda | ausentes |
| Opacidade | 0,55 no contentor |
| `pointer-events` | `none` |
| `max-width` | deixa folga para o zoom (`calc(100% - 5.5rem)` ou equivalente) |
| Itens | PJ, NPC, depois os 8 tipos (`VINCULO_TIPOS`), cores/traços iguais aos chips |
| Rótulos | `comum:tipo.*` e `getVinculoTipoLabel` |

## Proibições

- Renderizar a chave dentro de `.graph-stage__world` (andaria com pan/zoom).
- Fundo, placa, título visível «Legenda».
- Tornar a chave clicável ou usá-la para filtrar tipos.
- Alterar `CampaignMap` legend.
- Alterar `graphLayout.ts` / constantes 087–089.
- Esconder a chave quando o palco está vazio (filtro de estado).

## Coluna

Após Isolar: o espaço que era da legenda fica para a lista. `margin-top: auto` da antiga `.relacoes-side__legend` deixa de existir.
