# Quickstart: Remover hover na linha de vínculo (136)

Validar [spec.md](./spec.md) SC-001–002 e [contracts/edge-hover-removed.md](./contracts/edge-hover-removed.md).

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Campanha com vínculos visíveis; conta GM se quiser validar clique → edição.

## 1. Hover sem foco (SC-001)

1. Abrir `/c/:slug/relacoes` **sem** personagem seleccionado (e sem hover em token/lista que active preview).
2. Passar o mouse lentamente sobre várias linhas de vínculo.
3. Esperado: nenhum rótulo mid-edge aparece; nenhuma mudança de espessura/opacidade só por hover.

## 2. Foco por selecção (FR-002)

1. Seleccionar um personagem com vínculos.
2. Confirmar que as arestas em foco mostram rótulo/destaque como antes.
3. Passar o mouse sobre essas arestas e sobre arestas não relacionadas.
4. Esperado: foco permanece; hover na linha não adiciona efeito extra nas não-foco.

## 3. Clique intacto (SC-002 / FR-003)

1. Como GM, clicar na linha (ou na área larga em torno dela).
2. Esperado: abre edição do vínculo como antes.

## 4. Linha duas vias

1. Hover numa aresta double/duas vias fora de foco.
2. Esperado: nenhum dos traços ganha rótulo/destaque por hover.

## 5. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## Grep sanity (pós-implementação)

```bash
rg -n 'hoveredEdgeId' frontend/src/components/relacoes/GraphStage.tsx || echo 'GONE'
rg -n 'edge-hit|onEdgeClick|midLabelVisible' frontend/src/components/relacoes/GraphStage.tsx
```

Esperado: zero `hoveredEdgeId`; hit-path e clique presentes; `midLabelVisible` só via `highlighted`.
