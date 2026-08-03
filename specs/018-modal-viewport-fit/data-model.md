# Data Model: 018-modal-viewport-fit

Sem entidades de domínio novas. Invariantes de **layout de sessão** (UI):

## Layout: Dialog shell

| Região | Persistido? | Comportamento |
|--------|-------------|----------------|
| Título | não | Altura intrínseca; não rola |
| Corpo (`dialog__body`) | não | Cresce até o espaço restante; `overflow: auto` se exceder |
| Ações (`dialog-actions`) | não | Sempre visível; altura intrínseca; fora do scroll do corpo |

## Constraints

| Regra | Valor / nota |
|-------|----------------|
| Altura do shell | ≤ ~90% da viewport (`90dvh`), com padding do backdrop |
| Altura mínima forçada | Não (conteúdo curto = painel compacto) |
| Scroll aninhado em chips | Proibido nesta feature |
| Dados de Local/NPC/Saídas | Inalterados (017+) |

## State

Nenhum estado React novo obrigatório; layout é CSS + estrutura DOM. Pin modal continua com estado de placement (beside/centered) da 013.
