# Data model: Cabeçalho e navegação (114)

Nenhuma entidade de persistência nova. Modelo conceptual só para UI.

## Campaign chrome (vista)

| Campo / estado | Fonte | Notas |
|----------------|-------|--------|
| `slug` | URL (`useParams`) | Prefixo de todas as abas |
| `campaignName` | Config da instância / prop | Texto do mestre; não traduzir |
| `showMapNav` | Call site (mapa presente ∨ edição) | Omite aba Mapa |
| `canEdit` / `enabled` | `EditModeContext` | Toggle visível só se `canEdit` |
| `theme` | Preferência local existente | `auto` \| `light` \| `dark` |

## Navegação (destinos)

| Aba / acção | Destino | Condicional |
|-------------|---------|-------------|
| Marca | `/` | Sempre |
| Minhas campanhas | `/painel` | Sempre (login no Painel se anónimo) |
| Descobrir outras | `/` | Sempre |
| Mapa | `/c/:slug` | Se `showMapNav` |
| Relações | `/c/:slug/relacoes` | Sempre |
| Rota | `/c/:slug/rota` | Sempre (página mínima nova) |
| Sessões | `/c/:slug/sessoes` | Sempre |

## Transições de UI

- **Seletor**: fechado → aberto (clique) → fechado (escolha / blur / leave).
- **Modo edição**: `enabled` false ↔ true via `toggle`; casca visual muda; efeitos downstream inalterados.
- **Tema**: `auto` ↔ `light` ↔ `dark` via preferência existente; reaplica tema global já usado.

## Validação

- Nome longo: ellipsis + `title`/aria com nome completo.
- Sem `campaignName`: seletor omitido ou desactivado (não inventar mock).
