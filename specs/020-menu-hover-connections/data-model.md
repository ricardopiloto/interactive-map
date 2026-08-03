# Data Model: 020-menu-hover-connections

Sem entidades de domínio novas. `saida_ids` (017) inalterado.

## Session UI state (já existente)

| Estado | Persistido? | Papel nesta feature |
|--------|-------------|---------------------|
| `selectedLocalId` | não | Se não-null, **manda** nas linhas |
| `hoveredLocalId` | não | Se `selectedLocalId` é null, origem das linhas de pré-visualização; sempre destaca pin |

## Derived: connection origin

| `selectedLocalId` | `hoveredLocalId` | Origem das linhas |
|-------------------|------------------|-------------------|
| set | * | selected |
| null | set | hovered |
| null | null | nenhuma |

## Transitions

| Evento | Efeito nas linhas |
|--------|-------------------|
| Hover item (sem seleção) | Mostra saídas do item |
| Mouse leave (sem seleção) | Oculta |
| Selecionar/abrir local | Mostra saídas do selecionado; hover subsequente não troca |
| Deselecionar/fechar | Sem linhas; hover volta a poder pré-visualizar |
| Hover com seleção ativa | Só destaque de pin; linhas inalteradas |

## Constraints

- Destinos órfãos: pular (017)
- Estilo visual: 019
- Sem pan/zoom no hover: 016
