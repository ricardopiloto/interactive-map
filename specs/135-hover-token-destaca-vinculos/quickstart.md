# Quickstart: Hover no token destaca vínculos (135)

Validar [spec.md](./spec.md) SC-001–002 e [contracts/graph-token-hover.md](./contracts/graph-token-hover.md).

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Campanha com ≥2 personagens ligados por vínculos visíveis no grafo.

## 1. Baseline — lista lateral

1. Abrir `/c/:slug/relacoes`.
2. Passar o mouse sobre um nome na lista (sem clicar).
3. Confirmar destaque das arestas desse personagem + preview no nó.
4. Sair com o mouse → destaque some.

## 2. Token no canvas (SC-001 / SC-002)

1. Passar o mouse sobre o **token** (disco/nome) do mesmo personagem no canvas, sem clicar.
2. Esperado: **mesmo** destaque visual do passo 1.
3. Mover o mouse para fora do token → destaque some de imediato.

## 3. Sequência rápida

1. Passar o mouse rapidamente por vários tokens.
2. Esperado: o preview acompanha o token actual; não fica “preso” no anterior.

## 4. Com selecção activa

1. Clicar/seleccionar um personagem (detalhe aberto).
2. Hover noutro token.
3. Esperado: selecção **não** é limpa; preview comporta-se como ao hover na lista com alguém já seleccionado (paridade; sem flicker estranho no token já seleccionado).

## 5. Sem vínculos

1. Hover num personagem sem vínculos (se existir).
2. Esperado: sem erro; nada a destacar (ou só preview do nó, conforme o CSS actual de `graph-node--preview`).

## 6. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## Grep sanity (pós-implementação)

```bash
rg -n 'onHoverPersonagem|onPointerEnter' frontend/src/components/relacoes/GraphStage.tsx frontend/src/pages/RelacoesPage.tsx
```

Esperado: handlers nos `.graph-node`; `RelacoesPage` liga ao mesmo `setHoveredId` (ou equivalente) da lista.
