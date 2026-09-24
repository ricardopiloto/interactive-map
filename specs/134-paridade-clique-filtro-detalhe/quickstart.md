# Quickstart: Paridade de clique no filtro do painel de detalhe (134)

Validar [spec.md](./spec.md) SC-001–003 e [contracts/tipo-chip-click.md](./contracts/tipo-chip-click.md).

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Campanha com personagem que tenha vínculos de ≥2 tipos. Backend opcional se a campanha já estiver servida.

## 1. Baseline — filtro do grafo (sem selecção)

1. Abrir `/c/:slug/relacoes` sem personagem seleccionado (ou fechar o detalhe).
2. Clique único num chip de tipo → tipo só alterna após ~280 ms (não instantâneo).
3. Duplo-clique num chip → isola só esse tipo; segundo duplo-clique no mesmo → restaura todos.

Guardar esta sensação como referência.

## 2. Painel de detalhe — mesma pausa (SC-001)

1. Seleccionar um personagem com vários tipos de vínculo.
2. Clique único num chip **do painel de detalhe** → a lista/tipos só mudam após a **mesma** pausa que no grafo (não imediata).
3. Comparar mentalmente com o passo 1.2 — MUST sentir-se idêntico.

## 3. Painel de detalhe — isolar / restaurar (SC-002)

1. Duplo-clique num chip do detalhe → só esse tipo activo; lista reflecte o filtro.
2. Duplo-clique de novo no mesmo chip → todos os tipos de volta.
3. Resultado visual MUST coincidir com o solo/restore do grafo (mesmo que os Sets sejam independentes).

## 4. Duplo cancela o simples (FR-003)

1. Clique único num chip do detalhe e, antes da pausa, duplo-clique no mesmo chip.
2. Esperado: não aplica o toggle do clique simples; aplica solo/restore do duplo.

## 5. Troca de personagem cancela pendente (SC-003 / FR-004)

1. Clique único num chip do detalhe e, **antes** da pausa, seleccionar outro personagem (nó ou vizinho na lista).
2. Esperado: o novo detalhe abre com filtro “todos”; o tipo do personagem anterior **não** muda “atrasado” depois da troca.

## 6. Independência (regressão 133)

1. Isolar um tipo no grafo geral; abrir detalhe de alguém com outros tipos.
2. Esperado: detalhe começa com todos os tipos (não herda o grafo); filtrar no detalhe não altera os chips do grafo.

## 7. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## Grep sanity (pós-implementação)

```bash
rg -n 'CHIP_CLICK_DELAY_MS|onDoubleClick' frontend/src/pages/RelacoesPage.tsx frontend/src/components/relacoes/
rg -n 'toggleDetailTipo\(|onClick=\{\(\) => toggleDetailTipo' frontend/src/pages/RelacoesPage.tsx || true
```

Esperado: delay partilhado; chips do detalhe com `onDoubleClick`; **sem** `onClick={() => toggleDetailTipo(...)}` directo sem delay.
