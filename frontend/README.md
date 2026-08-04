# Mapa Campanha — Frontend

React + Vite + TypeScript + design system Nocturne. Versão do pacote: ver `package.json` (alinhada ao [CHANGELOG](../CHANGELOG.md)).

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em http://localhost:5173. O Vite faz proxy de `/api` e `/uploads` para o backend em `:8000`.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Oxlint |

## Rotas / modos

- `/` — Codex: mapa + menu (jogador); Modo GM in-page via “Acesso restrito (GM)” ou `/?gm=1`
- `/admin` — redireciona para `/?gm=1` (gate de senha)

### Jogador

- Clique no pin ou no local no menu → foca a vista (pan/zoom) e abre o modal de leitura ao lado do pin (Markdown seguro); fechar limpa a seleção
- Hover no cartão/nome na aba Locais → destaque visual do pin (sem mover pan/zoom da vista); sem seleção, também mostra as linhas de saída daquele local
- Com local selecionado/aberto → linhas de saída no mapa (vermelho claro); hover na lista não troca as linhas
- **Calcular rota** → De/Para entre quaisquer nós da rede (rótulo: nome do nó → Local → `Nó {id}`); ritmo; rotas por tempo; overlay no mapa
- Zoom com a roda mais suave (mapa da campanha)
- Diálogos longos → corpo rolável com ações fixas no rodapé
- Em viewport estreito, pins um pouco menores; ponta alinhada às coordenadas

### Modo GM

- CRUD via abas / diálogos; cor do pin, saídas, **nó da rede** e descrição (texto ou Markdown) no formulário de local
- Botão **Mapa** nos controles para substituir a imagem da campanha
- Clique no pin → seleciona sem foco automático da câmera; clique no menu → pode focar como no jogador
- **Rede de rotas** → digitalizar waypoints/segmentos (mapa sem pins de lore); escala mi/unidade; select Local por nó; botão direito desfaz ponto ao traçar; zoom máximo alto e roda suave
- Ao vincular nó↔Local, o pin do Local move para o nó; desvincular não reverte a posição
- Clique na área vazia do mapa → deseleciona o pin (não fecha formulários admin abertos)
- Placement (novo local / reposicionar / mover grupo) tem prioridade sobre deseleção
