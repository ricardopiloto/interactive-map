# Quickstart: Fit view no grafo de Relações (139)

Validar [spec.md](./spec.md) SC-001–002 e [contracts/fit-view-control.md](./contracts/fit-view-control.md).

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Campanha com muitos personagens (grafo maior que o viewport no zoom 1). Conta qualquer (botão não é GM-only).

## 1. Fit após pan/zoom (SC-001)

1. Abrir `/c/:slug/relacoes`.
2. Zoom out/in e panear até tokens ficarem fora de vista.
3. Clicar no botão que antes dizia «1:1» (agora «Ajustar»/«Fit»).
4. Esperado: todos os tokens visíveis cabem na área do canvas (não escondidos sob o painel); sem erro.

## 2. Grafo pequeno (aceitação 2)

1. Campanha com poucos nós que já cabem em zoom 1.
2. Clicar Ajustar.
3. Esperado: todos visíveis; **sem** zoom-in agressivo (scale ≤ 1).

## 3. Filtros (FR-002)

1. Filtrar estado / isolar selecção de forma a esconder parte dos nós.
2. Clicar Ajustar.
3. Esperado: o enquadramento usa só os tokens ainda desenhados; não “reserva espaço” para os ocultos.

## 4. Um token / zero tokens (FR-004)

1. Isolar ou filtrar até restar 1 personagem → Ajustar → centralizado, sem zoom extremo.
2. Filtrar até lista vazia no grafo → Ajustar → sem crash; vista inalterada (no-op).

## 5. i18n

1. Alternar pt-BR / en.
2. Esperado: rótulo/aria do botão traduzidos; sem «1:1» hardcoded.

## 6. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## Grep sanity (pós-implementação)

```bash
rg -n 'resetView|fitView|1:1|fitView' frontend/src/components/relacoes/GraphStage.tsx frontend/src/locales/pt-BR/relacoes.json frontend/src/locales/en/relacoes.json
```

Esperado: lógica de fit (não só `setScale(1)`); chaves i18n; sem label `1:1`.
