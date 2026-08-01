# UI Contract: Hover menu Locais → destaque do pin

## Trigger

| Superfície | Evento | Efeito |
|------------|--------|--------|
| Item de local na aba Locais (jogador) | pointer enter no nome/card | Destaca pin `id` |
| Item de local na aba Locais (GM) | pointer enter no nome/card | Destaca pin `id` |
| Qualquer um dos acima | pointer leave (sem enter em outro local) | Remove destaque de hover |
| Abas História / NPCs | — | Sem requisito nesta feature |

## Must

- Exatamente um pin em destaque de hover (ou nenhum)
- Hover não abre modal
- Hover não altera zoom/pan obrigatoriamente
- Clique no item mantém comportamento atual

## Visual

- Pin com hover: destaque inequívoco (classe dedicada)
- Pin selected (clique) e hovered podem coincidir; selected não é limpo pelo leave do hover
