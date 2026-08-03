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

- Clique no pin → modal de leitura (descrição com Markdown seguro); fechar limpa a seleção
- Hover no nome na aba Locais → destaque do pin no mapa

### Modo GM

- CRUD via abas / diálogos; cor do pin e descrição (texto ou Markdown) no formulário de local
- Botão **Mapa** nos controles para substituir a imagem da campanha
- Clique na área vazia do mapa → deseleciona o pin (não fecha formulários admin abertos)
- Placement (novo local / reposicionar / mover grupo) tem prioridade sobre deseleção
