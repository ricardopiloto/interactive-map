# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

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
