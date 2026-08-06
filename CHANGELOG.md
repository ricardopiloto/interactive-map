# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [0.6.9] — 2026-08-05

Calcular rota com preferência de via, painel mais limpo e cobertura de tipos puros; retratos de NPC no menu e na edição sem corte fixo.

### Added

- **Calcular rota**: preferência de via Sem preferência (default) / Por rio / Por estrada — enviesamento suave (rotas mistas permitidas); abrir o painel repõe Sem preferência; mudar a preferência recalcula
- **Calcular rota**: bloco Opções de viagem colapsável (recolhido por omissão) com resumo só de não-defaults; ordem De → Para → Calcular → Opções → Resultados

### Changed

- **Calcular rota**: resultados em título + linha de meta; rótulos Pago/Próprio e Normal/Intenso (h/dia como apoio)

### Fixed

- **Calcular rota**: se a rede tem um caminho contínuo só de um tipo (ex. Estrada Altdorf→Ubersreik), essa alternativa pura entra na lista de até 6 mesmo sob Mais rápida; preferência de via não suprime tipos puros opostos
- **NPCs (menu lateral)**: retrato no cartão expandido acompanha a proporção da imagem (shrink-to-fit), com altura máxima ~50% da viewport; miniatura circular inalterada
- **NPCs (modo GM)**: caixa do retrato no formulário criar/editar com o mesmo sizing; upload continua editável; placeholder vazio mantém zona de drop utilizável

## [0.6.8] — 2026-08-05

Rede de rotas com traços mais finos; Calcular rota com transporte pago vs próprio. Tentativas de realinhar pins no móvel (que partiam o desktop) foram revertidas — o mapa da campanha mantém o alinhamento estável anterior.

### Added

- **Calcular rota**: escolha Transporte pago (tabela de velocidades/custos) ou Transporte próprio (velocidade desejada default 4 mi/h, custos Dentro/Fora 0); abrir o painel volta a pago; mudar o modo recalcula; editar só a velocidade não recalcula sozinho

### Changed

- **Rede de rotas**: stroke normal/draft ~1.0 e hover ~2.3 (antes 1.5 / 3.5); hit-area de hover inalterada; mapa da campanha e overlay de rota sem mudança

## [0.6.7] — 2026-08-04

Calcular rota: ordenar por mais rápida ou mais barata (até 6 alternativas).

### Added

- **Calcular rota**: opção Ordenar por Mais rápida / Mais barata (default rápida); até 6 rotas para o critério; mais barata usa custo Dentro; mudar a preferência recalcula automaticamente

## [0.6.6] — 2026-08-04

Rede de rotas: segment-hover só em idle — desligado ao colocar nó ou traçar segmento.

### Changed

- Rede de rotas: em **Novo nó** e **Traçar segmento**, o hover de segmento (tooltip, destaque na lista e hit largo) fica desligado para não interferir com colocação/desenho; em idle o comportamento de 0.6.5 mantém-se

## [0.6.5] — 2026-08-04

Rede de rotas: aura/snap dos nós, traços mais finos, fecho mais apertado e hover com identidade do segmento.

### Added

- Rede de rotas: aura visível em cada nó (zona clicável); origem activa continua distinta
- Rede de rotas: ao passar o rato sobre um segmento gravado, tooltip com extremos/tipo/distância e destaque (com scroll) da linha correspondente em Segmentos; traço enfatizado; hover não apaga

### Changed

- Rede de rotas: snap de origem mantém folga útil; snap de fecho ~metade — com draft aberto a aura encolhe para coincidir com a zona de fecho; sem draft, aura de origem
- Rede de rotas: linhas de segmento (gravadas e rascunho) mais finas (~60% da espessura anterior) para alinhar melhor ao mapa

## [0.6.3] — 2026-08-04

Menu lateral (scroll e busca), marcadores mais compactos com tamanho fixo no zoom, botão para ir ao grupo, e De/Para só com nós nomeados.

### Added

- Menu lateral: filtro de busca em Locais, NPCs e História (jogador e GM; case/accent-insensitive); História casa título do arco ou nome de local ligado; busca oculta na aba Grupo
- Controlo “Ir ao grupo” no cluster de zoom (+/−/1:1): recentra o pin do grupo no viewport; oculto quando não há posição de grupo

### Fixed

- Menu lateral: scroll do corpo das abas (cadeia de altura flex/grid) para listas longas não ficarem cortadas

### Changed

- Mapa e Rede de rotas: pins, grupo e nós mais compactos (~60% da área anterior); tamanho aparente no ecrã fixo face ao zoom; ênfase de selecção/hover mantida a partir do novo tamanho base
- **Calcular rota**: listas De/Para omitem nós sem nome (sem rótulo `Nó {id}`); nós sem nome continuam a servir de passagem no caminho

## [0.6.2] — 2026-08-03

Pesquisa com autocomplete nas listas De/Para do Calcular rota.

### Added

- **Calcular rota**: comboboxes De/Para com filtragem ao digitar (case- e accent-insensitive); reeditar limpa a seleção até nova escolha

## [0.6.1] — 2026-08-03

Correção do desalinhamento dos nós na Rede de rotas.

### Fixed

- Rede de rotas (digitizer): stage guiado pela imagem (sem `aspect-ratio` fixo + `object-fit: cover`), para nós e cliques alinharem ao mapa

## [0.6.0] — 2026-08-03

Rede de vias e cálculo de rotas (De/Para entre nós), refinamentos do digitizer, e vínculo nó↔Local depois da criação.

### Added

- Rede de viagem: waypoints, segmentos (estrada/rio/trilha), escala mi/unidade; vista GM **Rede de rotas** para digitalizar sem pins de lore
- **Calcular rota**: origem/destino entre **qualquer nó** da rede (com ou sem Local); ritmo de viagem; várias rotas por tempo (mais rápida destacada; alternativas tracejadas)
- Título da rota derivado do tipo de via dominante no percurso
- Vincular nó ↔ Local **depois** da criação: select na lista de nós (Rede) e campo “Nó da rede” no formulário de Local; ao vincular, o pin do Local move para as coordenadas do nó; desvincular não reverte a posição
- Zoom máximo maior na digitalização; zona de fecho de segmento mais apertada; botão direito desfaz o último ponto (ou a origem) ao traçar

### Changed

- Zoom com a roda do mouse mais suave no mapa da campanha e na Rede de rotas (step alinhado aos botões +/−)

### Deferred

- Ajuste de tamanho/âncora dos pins no móvel (spec 030) — revertido do produto; ver `specs/030-pin-size-offset` (Deferred / Staged)

## [0.5.0] — 2026-08-03

Conexões entre locais no mapa, estilo das linhas, pré-visualização no hover do menu e modais que cabem na viewport.

### Added

- Saídas dirigidas entre locais (`saida_ids` / `local_conexao`): cadastro no formulário GM; linhas no mapa ligando origem → destinos
- Pré-visualização das linhas ao passar o mouse sobre um local na aba Locais (ou lista GM), **somente** quando nenhum pin está selecionado
- Diálogos (local, NPC, arco, gate, pin) com altura máxima na viewport: corpo rolável e ações fixas no rodapé

### Changed

- Linhas de conexão usam vermelho claro da família “visitado”, opacidade moderada e sombra suave (em vez do accent roxo)
- Com um local selecionado/aberto, hover na lista só destaca o pin — as linhas permanecem as da seleção

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
