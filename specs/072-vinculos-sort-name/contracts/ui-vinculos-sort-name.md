# Contract: UI — Vínculos list sort by name

**Feature**: `072-vinculos-sort-name`  
**Surface**: `RelacoesDetailPanel` → section **Vínculos (n)**

| Rule | Behaviour |
|------|-----------|
| Order | Ascending by neighbour **nome** |
| Locale | `pt`, case/accent insensitive (`sensitivity: 'base'`) |
| Missing personagem | After all named rows; label unchanged (“Personagem removido”) |
| Tie | Lower `vinculo.id` first |
| Always on | No user control |
| Unchanged | Row content (tipo, notas, duas vias, GM actions); graph; side column |

## Out of scope

Sort by tipo; descending; graph/node lists; left-column personagem list.
