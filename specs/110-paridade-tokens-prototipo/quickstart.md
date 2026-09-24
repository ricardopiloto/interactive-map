# Quickstart: Paridade tokens / forma

**Feature**: `110-paridade-tokens-prototipo`

## Prerequisites

- `frontend-next`: `npm run dev` (porta 5183) — género fantasia
- `frontend` + API: `npm run dev` / uvicorn — tema claro/escuro no menu

## 1. Contraste

```bash
cd frontend && npm run test:contrast
```

**Expect**: OK ambos os temas; nenhum rácio pior que o registo pré-mudança (guardar output antes se necessário).

## 2. Lado a lado (checklist humano)

Para cada tela × tema (escuro / claro):

| # | App | Protótipo (fantasia) | Cor | Raio | Sombra |
|---|-----|----------------------|-----|------|--------|
| 1 | `/` | `/` ou explorar/home equivalente | ☐ | ☐ | ☐ |
| 2 | `/painel` (auth) | `/painel` | ☐ | ☐ | ☐ |
| 3 | `/c/{slug}` mapa | `/c/{slug}` | ☐ | ☐ | ☐ |
| 4 | `/c/{slug}/relacoes` | `/c/{slug}/relacoes` | ☐ | ☐ | ☐ |
| 5 | mapa + tab Rota | `/c/{slug}/rota` | ☐ | ☐ | ☐ |

**Expect**: nenhuma diferença a olho nu em cor/raio/sombra (layout pode diferir).

## 3. Pílula + display

- Botão primário, tag/chip, busca: cantos pílula.
- Título Home: Cormorant (display); nav: Inter.

## 4. Acentos 108

No painel, comutar os 5 acentos — mesa actualiza; sem acento = latão/base fantasia.

## 5. Baselines CI

```bash
cd frontend
# seed e2e se necessário (ver spec 109)
npx playwright test --update-snapshots
npx playwright test
```

**Expect**: 0 critical axe; snapshots commitados.
