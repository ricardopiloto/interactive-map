# Contract: Layout do retrato no painel de detalhe (Relações)

**Surface**: UI — `.relacoes-page__detail-portrait` em `PersonagemDetailBody` (`/c/:slug/relacoes`).

## Quando há `retrato_url`

O slot MUST:

1. Ocupar a **largura disponível** do painel (`width` / `max-width: 100%`).
2. Preservar proporção da imagem (`height: auto`, `object-fit: contain` — sem stretch).
3. Respeitar **altura máxima 140px** (container e `img`), para não empurrar o resto do painel sem necessidade.
4. **Não** mostrar moldura dashed de placeholder nas laterais (border de empty-state ausente ou invisível com imagem carregada).
5. Usar `padding: 0` no slot (não herdar o padding do `.image-slot` base que cria “caixa vazia”).

## Quando não há `retrato_url`

Nenhum `ImageSlot` de retrato é montado (contrato actual — sem empty-state no detalhe).

## Fora de escopo

- Upload / edição de retrato neste painel
- Alterar `max-height` dos forms NPC/Local (`50vh`)
- Tokens do grafo / avatares da lista
