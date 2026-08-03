# UI Contract: Sidebar hover + search fit

Escopo: cartões Locais (jogador) e campo de busca do `SideMenu`.

## Must

| Situação | Comportamento |
|----------|----------------|
| Hover em cartão de local (modo jogador, aba Locais) | Fundo sutil no item; pin highlight existente permanece |
| Mouse sai do cartão | Fundo sutil some |
| Campo `.side-menu__search` visível | Largura contida no menu; sem overflow horizontal causado pelo input |
| Digitar na busca | Filtro de locais/NPCs continua igual |
| Hover sozinho | Não abre detalhe/modal |

## Must not

- Exigir o mesmo hover em NPC, arco ou painel admin GM nesta feature
- Remover ou quebrar o destaque do pin no hover (005)
- Alterar API/dados
- “Corrigir” a busca só com `overflow: hidden` no menu sem conter o input

## Acceptance check

1. Desktop jogador, Locais: hover no cartão → tint de fundo; pin destaca.
2. Mover entre cartões → só o atual com tint.
3. Busca alinhada às margens do menu; sem extravasar.
4. Filtrar por texto ainda funciona; clique ainda abre detalhe.
