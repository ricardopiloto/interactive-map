# Research: 019-connection-line-style

## 1. Cor base (vermelho visitado, mais claro)

**Decision**: Partir do vermelho visitado `#e5484d` (`PIN_COLOR_VISITED` / legenda). Na linha, usar tom **mais claro** via `color-mix` com branco (ou equivalente) e misturar com transparente para a opacidade alvo — ex. stroke em família visitado clareada, não accent `#9184d9`.

**Rationale**: Clarificação Q1; FR-001 / SC-001; alinha à linguagem “visitado” sem copiar o preenchimento sólido do pin.

**Alternatives considered**:
- Accent roxo atual — rejeitado (pedido do usuário / FR-001)
- Vermelho escuro ou `#ff0000` puro — fora da clarificação
- Token Nocturne genérico sem âncora visitado — menos coerência com pins

## 2. Opacidade (~55–65%)

**Decision**: Expressar transparência no próprio `stroke` com `color-mix(... % transparent)` **ou** `stroke-opacity` na faixa **0.55–0.65**, de modo que o mapa sob o traço continue legível. Preferir um único mecanismo (mix **ou** opacity) para não “dupla-diluir”.

**Rationale**: Clarificação Q2; FR-003 / SC-003.

**Alternatives considered**:
- Traço quase opaco (80–90%) — rejeitado
- Muito sutil (35–45%) — rejeitado
- Só reduzir `stroke-width` — não substitui transparência

## 3. Sombra suave em SVG `<line>`

**Decision**: Aplicar `filter: drop-shadow(...)` em `.campaign-map__connection-line` (ou no SVG pai se o filtro por elemento falhar em algum browser). Sombra escura discreta (offset pequeno, blur baixo, alpha baixo) — volume leve, **sem** glow colorido.

**Rationale**: Clarificação Q3; `box-shadow` não segue bem o stroke de SVG; `drop-shadow` acompanha o alpha do traço. FR-002 / SC-002.

**Alternatives considered**:
- Segunda `<line>` offset como “sombra” — mais markup; rejeitado (YAGNI)
- `filter: blur` no stroke — vira glow; rejeitado
- Sem sombra — rejeitado pela spec

## 4. Escopo de arquivos

**Decision**: Preferir apenas `frontend/src/components/map/CampaignMap.css`. Não tocar backend, tipos, seed, nem JSX salvo se for necessário um wrapper de filtro (não esperado).

**Rationale**: Classes e segmentos já existem na 017; só o estilo muda (FR-004–006).

## 5. Espessura

**Decision**: Manter `stroke-width` atual (~2.5) salvo se, após cor+opacidade+sombra, a linha ficar ilegível no zoom médio — aí ajuste fino mínimo no CSS, sem mudar regras de visibilidade.

**Rationale**: Spec não pediu espessura nova; foco em cor/sombra/opacidade.
