# Campaign Codex — v3 (protótipo navegável)

Protótipo **100% desconectado de qualquer backend** — dados mocados em
[`src/data/mock.ts`](src/data/mock.ts), estado só em memória do navegador. Serve para
validar a direção de produto/UX da v3 antes de qualquer trabalho de implementação real.
Nada aqui é código de produção; é a referência visual e de interação.

## Por que existe

A v1/v2 do Campaign Codex (`frontend/`) cobre bem mapa, locais, NPCs, rotas, rede de
relações, linha do tempo e — desde a última mudança — Capítulos de preparação com stat
block por sistema. Para virar uma ferramenta completa de **"game prep" e "game codex"**
(na linha de vvd.world / Chronicler), faltam peças que mudam a espinha dorsal da
navegação, então vale prototipar a direção antes de construir:

- **Wikilinks** (`[[Nome]]`) resolvendo para qualquer entidade, com backlinks — hoje no
  backlog (ver `openspec/specs/capitulo-prep` e `design.md` do change arquivado).
- Busca global (Cmd+K) cruzando personagens, locais, capítulos e sessões.
- Um Codex unificado (personagens/locais/facções/itens) em vez de abas separadas.
- Um Painel ("hoje eu preparo") como ponto de entrada do mestre, não o mapa.
- A visão de exportação para Foundry VTT como superfície de produto (mesmo que a
  implementação real venha depois).
- Múltiplos temas visuais (não só claro/escuro) — a pedido explícito para esta rodada.

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5190`. De dentro do Claude Code, `preview_start` com o nome
`frontend-v3` (já configurado em `../.claude/launch.json`).

## O que está aqui

- **Painel** (`/`) — próxima sessão, progresso dos arcos, capítulos pendentes de
  preparo, crônica recente, atalhos para PJs.
- **Codex** (`/codex`) — personagens (com ficha WFRP em tabela), locais, facções e
  itens; busca, visibilidade (Modo Mestre vs. Jogador), narrativa com wikilinks
  clicáveis e lista de backlinks ("mencionado em").
- **Mapa** (`/mapa`) — pins sobre um mapa estilizado em SVG; painel de detalhe do local.
- **Relações** (`/relacoes`) — grafo de vínculos com filtro por tipo e painel de
  detalhe do personagem selecionado.
- **Linha do Tempo** (`/linha-do-tempo`) — modos Cronológica e Por arcos.
- **Preparação** (`/prep`) — Arcos → Capítulos, corpo em Markdown com wikilinks e
  handouts, e o botão **"Exportar para Foundry VTT"** como vitrine da visão de longo
  prazo (desativado — é só o desenho da ideia).
- **Sessões** (`/sessoes`) — crônica com o capítulo jogado em cada sessão.
- **3 temas completos**, trocáveis em runtime (ícone de paleta na topbar), persistidos
  em `localStorage`: Nocturne (escuro/dourado, continuidade com o produto atual),
  Pergaminho (claro/sépia, "grimório de mesa") e Arcano (escuro/violeta-teal).
- **Busca global** (`Cmd+K` / `Ctrl+K`) cruzando todo o codex mocado.

## O que não está aqui (de propósito)

- Qualquer chamada de rede, autenticação ou persistência real.
- i18n (o protótipo é só PT-BR, para focar na direção de produto).
- Edição de verdade — os formulários de criação do produto real não foram
  reproduzidos; o foco é a experiência de **consulta e navegação** do codex.
- A implementação real de wikilinks (parser/resolução/desambiguação no backend) — aqui
  é só a simulação do resultado final, calculada no cliente a partir do mock.

## Dados

O flavor usado (Armada Agazzi, Ettore Agazzi, Sigurd Ugenhauer, Domínio de Falkenried
etc.) vem da campanha real do mestre, para o protótipo parecer uma mesa de verdade em
vez de lorem ipsum. Ver `src/data/mock.ts`.
