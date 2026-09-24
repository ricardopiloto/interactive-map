# Contract: Script de contraste

**Feature**: `100-fundacoes-sistema-visual`

## Comando

`npm run test:contrast` → avalia pares nos temas `dark` e `light`.

## Pares mínimos (RFC)

| Par | Critério |
|-----|----------|
| Texto primário / secundário / terciário sobre card (e fundo onde RFC mede) | AA (4.5:1 texto normal; terciário ≥12px) |
| Acento sobre card/fundo | ≥ AA ou 3:1 conforme papel |
| Texto on-accent sobre acento fill | AA |
| Borda de campo sobre card | ≥ 3:1 |
| Acento hover claro / elevado claro | MUST ser medidos; falhar → ajustar token |

## Resultado

Exit 0 só se todos os pares passam. Valores de token = fonte de verdade (ler do CSS ou tabela espelhada no script — plano: tabela espelhada + comentário «manter sync com tokens.css»).
