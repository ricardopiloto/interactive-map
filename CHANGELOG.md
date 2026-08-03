# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [0.4.0] — 2026-08-03

Foco no pin a partir do menu/mapa, modal ao lado do pin e refinamentos de hover na sidebar.

### Added

- Clique no local no menu (jogador) anima pan/zoom até o pin correspondente no mapa
- Clique no pin no mapa (jogador) também foca a vista no pin; no Modo GM o clique só seleciona (sem foco automático)
- Modal de leitura do pin abre ao lado do pin na tela (não centrado genérico)
- Hover no cartão da aba Locais com tint sutil; campo de busca com largura ajustada ao layout

### Fixed

- Hover na lista de Locais não re-dispara pan/zoom da vista após um foco anterior (a vista permanece onde o jogador deixou; o destaque local do pin continua)

### Changed

- Destaque de pin no hover do menu permanece só visual (escala/brilho), sem mover a câmera do mapa

## [0.3.1] — 2026-08-03

Ajuste nas legendas

### Changed

- Ajustado o tamanho das legendas para ficar mais em linha com o design da aplicação

## [0.3.0] — 2026-08-03

Descrição do pin com Markdown opcional na leitura.

### Added

- Descrição do local aceita texto livre ou Markdown no mesmo campo (Modo GM); hint “Markdown opcional” no formulário
- Leitura do pin (jogador) renderiza Markdown seguro: ênfase, listas, títulos e links `http`/`https` (nova aba)

### Security

- Renderização sanitizada: sem execução de HTML/script; imagens Markdown não são carregadas; esquemas de link inseguros (ex.: `javascript:`) não são navegáveis

## [0.2.0] — 2026-08-03

Melhorias de interação no mapa e cores de pin por local (Modo GM).

### Added

- Campo `cor_pin` nos locais (hex `#RRGGBB`): seletor livre no formulário GM, swatches sugeridos Visitado (`#e5484d`) / Conhecido (`#c4b5fd`), legenda do mapa com a convenção sugerida
- Migração SQLite automática para `cor_pin` (default lilás em locais existentes)
- Em Modo GM, clique na área vazia do mapa deseleciona o pin destacado (sem cancelar formulários de edição abertos)
- Controles de zoom/pan mantidos visíveis no layout fullscreen (slot flex do mapa)
- Botão explícito **Mapa** para substituir a imagem da campanha (GM), em vez de abrir o seletor de arquivo em qualquer clique

### Fixed

- Clique genérico no mapa em Modo GM não abre mais o diálogo de arquivo (regressão do slot editável cobrindo o stage)
- Controles de zoom deixavam de aparecer / ficavam fora da área útil em layouts altos

### Changed

- Pin de local no mapa usa a cor persistida (`cor_pin`); marcador do grupo permanece independente
- Clique no ícone do grupo não limpa a seleção de pin do local

## [0.1.0] — 2026-08-01

Primeira entrega do Codex da campanha (mapa.1nodado.com.br).

### Added

- Mapa interativo com pins de locais, zoom/pan e posição do grupo (bandeira ou brasão)
- Menu lateral: Locais, História e NPCs; modal de leitura ao clicar no pin
- Modo GM in-page (gate de senha + Basic Auth em `/api/admin/*`): CRUD de locais, NPCs, arcos, upload de mapa/imagens, mover grupo
- Destacar pin no mapa ao passar o mouse sobre o nome na aba Locais (jogador e lista GM)
- UI alinhada ao protótipo Nocturne (`prototype/`)
- Deploy com Docker Compose e Caddy opcional
- Pin do grupo: borda preta mais legível (bandeira via camadas CSS; brasão via `border`) e sombra suave para destaque no mapa
- Legenda do mapa alinhada ao estilo do pin do grupo

### Security

- Escrita admin fail-closed sem `ADMIN_USER` / `ADMIN_PASSWORD`
- Leitura pública; jogadores veem alterações ao recarregar (sem sync ao vivo)
