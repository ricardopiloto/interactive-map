# UI Parity Contract: 003-align-prototype-ui

Fonte: `prototype/Mapa da Campanha.dc.html` + `prototype/nocturne.css`.

## Tokens e componentes DS

A app MUST expor (ou equivalente visual) tokens `--color-bg`, `--color-surface`, `--color-text`, `--color-accent*`, `--space-*`, `--radius-*`, `--shadow-*` e classes/padrões:

| Padrão | Uso |
|--------|-----|
| `.btn` / primary / secondary / ghost | Ações |
| `.card` / `.card-meta` | Listas |
| `.seg` | Abas Locais/NPCs/História/(Grupo) |
| `.tag` / `.tag-accent` | Status, badge Modo GM, banners |
| `.dialog` + `.dialog-backdrop` | Pin modal, gate, forms GM |
| `.input` | Campos de form e busca |

Tema âmbar/marrom atual MUST ser removido da UI principal.

## Shell

| Elemento | Comportamento |
|----------|----------------|
| Sidebar + mapa (desktop) | Como protótipo |
| Mobile bottom bar + overlay + `‹ Mapa` | Como protótipo |
| Canto GM | “Acesso restrito (GM)” → gate; autenticado “Modo GM · Sair” |
| Badge | `tag-accent` “Modo GM” quando autenticado |
| Gate | Título “Acesso do Mestre”; senha; Cancelar/Entrar; **sem** dica de senha |

## Mapa

| Elemento | Comportamento |
|----------|----------------|
| Zoom | Controles +/−/1:1; pan/gesto |
| Legenda | Local (pin) vs Grupo |
| Pin | Forma gota; click → PinModal |
| Grupo | `bandeira` ou `brasao` conforme `GET /api/grupo.formato` |
| Slot mapa | Editável **somente** Modo GM; jogador só visualiza |
| Banners | Posicionar local / reposicionar grupo |

## PinModal

Backdrop; imagem (slot read-only); título; `data_sessao`; descrição; chip arco; chips NPCs; Fechar. Backdrop ou Fechar fecha. Chips mudam aba e fecham modal.

## Slots de mídia

Placeholder + drag/choose quando editáveis (GM). Visual alinhado aos `image-slot` do protótipo (círculo NPC lista; rounded modal/form).

## Fora de paridade obrigatória

- Runtime Open Design / `image-slot.js` do protótipo
- Texto “(demonstração: gm123)”
- Dados de exemplo hardcoded do HTML
