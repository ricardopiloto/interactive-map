# Mapa Campanha — Frontend

React + Vite + TypeScript.

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

## Rotas

- `/` — mapa público + menu lateral
- `/admin` — painel GM (protegido no Caddy em produção)
