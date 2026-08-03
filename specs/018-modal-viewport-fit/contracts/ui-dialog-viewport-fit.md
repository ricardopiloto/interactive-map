# UI Contract: Dialog viewport fit

## Shell (`.dialog` e equivalentes)

| Propriedade | Requisito |
|-------------|-----------|
| Contenção | `max-height` ≈ `90dvh` (não `height` fixa) |
| Direção | Coluna flex; `min-height: 0` onde necessário para scroll filho |
| Título | Fora da região de scroll |
| Corpo | Única região com `overflow: auto` quando o conteúdo excede |
| Ações | Sempre visíveis no rodapé do shell (`flex-shrink: 0`) |

## Conteúdo curto

- Shell encolhe ao conteúdo.
- Sem faixa vazia grande entre corpo e ações.

## Chips / listas

- Saídas, NPCs, etc. rolam **com** o corpo.
- Sem `max-height` + scroll próprio na área de chips (018).

## Aplicação

| Superfície | Obrigatório |
|------------|-------------|
| Formulário de local | Sim (P1) |
| Pin modal (centered e beside) | Sim (P2) |
| Outros `.dialog` GM (NPC, arco, gate) | Sim, via estilo base (P3) |

## Pin beside

- Continua posicionado ao lado do pin quando couber.
- Não pode ultrapassar a altura útil da viewport; Fechar permanece no rodapé visível.

## Fora de escopo

- Wizard multi-step
- Remover campos
- Scroll da página por trás como meio de acessar ações
- Redesign visual completo do Nocturne além do necessário para o shell
