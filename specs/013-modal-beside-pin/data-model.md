# Data Model: 013-modal-beside-pin

Nenhuma alteração de persistência, schemas ou APIs.

## Estado de UI (sessão / layout)

### Âncora do painel

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `local.id` | `number` | Resolve o nó `#map-pin-{id}` |
| `panelRect` / offsets | derivados | `top`/`left` (ou equivalente) em viewport, recalculados no layout |

Não precisa persistir em React state global se o cálculo for local ao `PinModal`; state interno (`style` / `className` de lado) é suficiente.

### Preferência de lado

| Nome | Valor | Notas |
|------|-------|-------|
| Lado preferido | `end` / direita do pin | Oposto ao menu esquerdo |
| Flip | esquerda do pin | Quando overflow |
| Gap | ~12–16 px | Entre pin e painel |
| Fallback | centrado | Viewport estreita ou pin ausente |

### Entidades existentes (inalteradas)

- **Local**: `id`, posição no mapa — só id usado para âncora DOM
- **PinModal** props atuais — sem campos de domínio novos obrigatórios

## Transições

1. Jogador seleciona local → `PinModal` monta → mede pin → posiciona ao lado (preferência direita) → backdrop dim + mapa bloqueado
2. Foco 012 anima (~400 ms) → `PinModal` recalcula posição
3. Resize / flip necessário → reposiciona ou centraliza (fallback)
4. Fechar → desmonta modal → mapa liberado
5. Troca de local (outro selecionado) → novo mount/update → nova âncora

## Invariantes

- Centro visual do pin fora do retângulo do painel (quando há espaço “ao lado”).
- Backdrop dimido permanece enquanto aberto.
- GM não monta este painel.
