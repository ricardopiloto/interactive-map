# Data Model: 019-connection-line-style

Sem entidades de domínio novas. Dados de conexão (`saida_ids` / 017) **inalterados**.

## Visual: Linha de conexão (sessão UI)

| Atributo | Persistido? | Valor alvo |
|----------|-------------|------------|
| Cor | não | Família vermelho visitado (`#e5484d`), tom mais claro que o pin sólido |
| Opacidade | não | ~55–65% |
| Sombra | não | Drop-shadow suave/discreto, sem glow |
| Visibilidade | não | Só quando o local de origem está selecionado (017) |
| Geometria | não | Segmentos origem→destino já desenhados na 017 |

## Constraints

| Regra | Nota |
|-------|------|
| API / schema Local | Sem mudança |
| Pins / grupo / legenda cores | Sem mudança como objetivo desta feature |
| Setas / rótulos / cor por destino | Fora de escopo |

## State

Nenhum estado React novo; overlay continua derivado de `selectedLocalId` + `saida_ids`.
