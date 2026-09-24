# Quickstart: Diminuir distância entre tokens (138)

Validar [spec.md](./spec.md) SC-001–003 e [contracts/token-spacing-base.md](./contracts/token-spacing-base.md).

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Campanha com: (a) vista geral com vários PJ+NPC; (b) personagem com 2–3 vínculos; (c) com 4–6; (d) com >6; (e) se possível dezenas de personagens.

## 1. Overview ~−30% (SC-001)

1. Abrir `/c/:slug/relacoes` sem selecção.
2. Comparar mentalmente (ou screenshot before/after) a folga entre tokens adjacentes.
3. Esperado: grafo nitidamente mais compacto (~30%); tokens **não** colados/sobrepostos.

## 2. Foco — ramos distintos (SC-003 / FR-002)

1. Seleccionar personagem com **2** vínculos → anel interior relativamente aberto (sparse).
2. Seleccionar (ou criar) com **5** vínculos → folga default, menor que sparse.
3. Seleccionar com **≥7** vínculos → anel mais apertado (compact), ainda legível.
4. Esperado: os três casos **não** convergem para o mesmo espaçamento; todos ~30% mais apertados que antes da mudança.

## 3. Densidade / sem overlap (SC-002 / FR-003)

1. Vista geral na campanha mais povoada disponível.
2. Foco no personagem com mais vínculos directos.
3. Esperado: caixas/discos sem sobreposição; nomes ainda atribuíveis a um token.

## 4. Poucos nós

1. Campanha ou filtro com 2–3 personagens na overview.
2. Esperado: não colados; redução não os “cola” um ao outro.

## 5. Zoom

1. Usar zoom in/out existentes.
2. Esperado: limites de zoom inalterados e utilizáveis (sem precisar de os alargar por causa desta mudança).

## 6. Sanity numérica (opcional)

No consolé ou snippet rápido:

```ts
// Esperado com alvos 84/168:
// OVERVIEW_SPACING === 84
// focusInnerSpacing(168, 2) === 218
// focusInnerSpacing(168, 5) === 168
// compactInnerSpacing(168) === 67
```

## 7. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## Grep sanity (pós-implementação)

```bash
rg -n 'COMPACT_INNER_SPACING_MIN|OVERVIEW_SPACING|espacamento = ' frontend/src/components/relacoes/graphLayout.ts frontend/src/components/relacoes/GraphStage.tsx
```

Esperado: min/overview ≈84; default `espacamento` ≈168; factores `2/3`, `0.6`, `1.3` intactos.
