# Codex — Frontend

React + Vite + TypeScript + tokens RFC (UX-1) + i18n (`react-i18next`).  
Versão do pacote: ver `package.json` (alinhada ao [CHANGELOG](../CHANGELOG.md)).

## Desenvolvimento

```bash
npm install
npm run dev
```

http://localhost:5173 — proxy `/api` e `/uploads` → backend `:8000`.  
Tema: `data-theme` dark/light segue `prefers-color-scheme` (live). Em dev: `/__styleguide` (preview scoped).

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Oxlint |
| `npm run lint:tokens` | Gate: sem `#hex` de UI fora de `tokens.css` (excepto cor de pino) |
| `npm run test:contrast` | Gate: contraste AA/3:1 nos dois temas |

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Mapa + menu lateral (jogador / Modo GM in-page) |
| `/relacoes` | Rede de Relações (grafo PJ/NPC) |
| `/admin` | Redireciona para `/?gm=1` (gate de senha) |

Idioma da UI: combo-box **PT / EN** no `CodexHeader` (persistido no dispositivo). Conteúdo escrito pelo mestre **não** é traduzido.

## Jogador — Mapa

- Clique no pin ou no local no menu → foca a vista e abre o modal de leitura (Markdown seguro)
- Hover no menu → destaque do pin (sem pan/zoom); pré-visualiza saídas se não houver selecção
- Local aberto → linhas de saída no mapa
- **Rota** → De/Para, opções de viagem, alternativas no mapa
- Zoom suave (roda / pinch); em viewport estreito os pins ficam um pouco menores

## Jogador — Relações

- Grafo com filtros por tipo de vínculo (8 tipos), busca, isolar selecção
- Painel de detalhe com ficha e vínculos (qualificador / direcção quando existirem)
- Pinch-zoom e pan no palco

## Modo GM

- Gate “Acesso restrito (GM)” ou `/?gm=1`
- CRUD de locais (cor, saídas, nó da rede, Markdown), personagens/NPCs, arcos; uploads; mover grupo
- Botão **Mapa** para substituir a imagem da campanha
- **Rede de rotas** → digitalizar waypoints/segmentos (coluna / bottom sheet ≤800px)
- Vincular nó ↔ Local (pin segue o nó)
- Em Relações: criar/editar personagens e conexões (recíproco / duas vias)

## i18n

Namespaces em `src/locales/{pt-BR,en}/`: `comum`, `mapa`, `relacoes`, `admin`.  
Erros API surfaced → `comum:erros.*` via `useApiErrorMessage`.
