# Research: Exibição da imagem do personagem no painel de detalhe (Relações)

Sem `[NEEDS CLARIFICATION]` — causa raiz e direcção confirmadas em [BKLG-026](../../docs/backlog/backlog.md#bklg-026-bugdesign--exibição-da-imagem-do-personagem-no-painel-de-detalhe-relações-desproporcional) e na [spec.md](./spec.md).

## Decisão 1 — Replicar a receita CSS dos forms, com `max-height: 140px`

**Decisão**: Aplicar a `.relacoes-page__detail-portrait.image-slot` (e `img`) o mesmo padrão de `.npc-form__portrait.image-slot` / `.local-form__image.image-slot`: `width/max-width: 100%`, `height: auto`, `padding: 0`, `object-fit: contain`, `display: block` na img — substituindo o teto `50vh` por **140px** (valor já usado no painel).

**Rationale**: É exactamente a assunção da spec e a ideia do backlog; evita inventar layout novo e já resolve o caso comum (retrato vertical “espremido” com dashed nas laterais).

**Alternatives considered**:
- `object-fit: cover` + caixa fixa — corta a imagem (viola FR-002 / aceitação 2).
- Só `width: 100%` na img sem `padding: 0` no slot — o padding do `.image-slot` base continua a mostrar fundo/borda como “buraco”.

## Decisão 2 — Hospedar as regras em `ImageSlot.css`; limpar `RelacoesPage.css`

**Decisão**: Adicionar o bloco junto às regras de form em `ImageSlot.css`. Em `RelacoesPage.css`, remover a regra incompleta `.relacoes-page__detail-portrait { max-height: 140px }` (ou deixá-la vazia de propósito — preferir remoção).

**Rationale**: Os outros “chrome” de `ImageSlot` com conteúdo já vivem em `ImageSlot.css`; uma única receita evita drift entre página e componente.

**Alternatives considered**: Expandir só `RelacoesPage.css` — funciona, mas separa o padrão do sítio onde o form já o documenta.

## Decisão 3 — Com retrato carregado, não parecer placeholder

**Decisão**: No bloco do detalhe, além da receita form, usar `border: none` (e fundo neutro/`transparent` se necessário) — o slot só monta quando há `retrato_url`, por isso não precisa do dashed de empty-state.

**Rationale**: FR-001 / SC-001 pedem ausência de moldura de placeholder; mesmo com letterboxing residual após clamp de altura (imagens muito altas), o dashed não deve sugerir “falha de carga”. Forms mantêm border porque também têm estado `--empty`; o detalhe não.

**Alternatives considered**: Deixar dashed como nos forms — pode falhar SC-001 em retratos que batem no `max-height` e ficam com largura &lt; 100%.

## Decisão 4 — Sem mudança de JSX / upload

**Decisão**: Manter `{personagem.retrato_url ? <ImageSlot … /> : null}`, `fit="contain"`, `shape="rounded"`. Sem novos props em `ImageSlot`.

**Rationale**: Comportamento “sem retrato → nada” já correcto (aceitação 3); o bug é 100% de layout CSS.
