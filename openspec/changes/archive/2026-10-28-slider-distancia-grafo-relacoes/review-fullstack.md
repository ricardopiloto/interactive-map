# Review — Desenvolvedor Fullstack

**Change:** slider-distancia-grafo-relacoes
**Data:** 2026-10-28
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os artefatos da change e `review-architect.md`; `frontend-v2/src/lib/graphLayout.ts` (+ `.test.ts`), `components/codex/RelationsGraph.tsx` (+ `.test.tsx`), `components/ui/slider.tsx`, `src/test/setup.ts`, `vitest.config.ts`, `package.json` (`@radix-ui/react-slider ^1.3.6`), `routes/relacoes.tsx` (legenda "Tipos de laço"). Sem CI no repositório: verificação local com vitest, tsc e eslint.

## 1. Desenvolvimento do backend
Veredito: N/A
- Sem API, banco ou migração.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **F1 (Atenção): o wrapper `ui/slider.tsx` não repassa props ao `Thumb`.** Ele renderiza um `SliderPrimitive.Thumb` fixo. `aria-label` e `aria-valuetext` (exigidos pela spec) precisam estar no thumb (no Radix o `aria-label` do Root não vai para o thumb). A tarefa 2.3 deve incluir estender o wrapper (aceitar `thumbProps`/`aria-*`) ou usar o primitivo diretamente. O `Slider` não é usado em nenhum outro lugar, então não há regressão, mas o estilo (`bg-primary/20`, thumb `bg-background`) nunca foi validado no tema paper-parchment: conferir no navegador.
- **F2 (Atenção): painel de controles é uma pílula (`glass ... rounded-full p-1`) numa linha.** Uma segunda linha com rótulo, slider e botão pede `rounded-2xl`/coluna; o painel fica em `top-20 left-3` e a legenda "Tipos de laço" aparece logo abaixo (renderizada em `relacoes.tsx`): checar que o painel maior não a sobreponha, e a largura em telas estreitas (o grafo tem `lg:pr-[400px]` e em mobile o espaço é curto). Prever teste visual manual em 375 px.
- **F3 (Atenção): reenquadramento a cada tick** (ver A2 do arquiteto). Implementação concreta sugerida: estado `sliderValue` (visual, ao vivo) e `spacing` aplicado ao layout; se o `frame` ao vivo for aceitável, o efeito `focusViewport` atual precisa de uma distinção entre "mudou o frame por seleção" e "mudou por fator" para não zerar o zoom durante o arraste do slider. Decidir antes do apply.
- Duplo clique: usar `onDoubleClick` no Root (o Radix não o trata). O `Slider` Radix tem `defaultValue`/`value` como array: passar `value={[v]}`.
- Formatação do fator em pt-BR usa vírgula (0,5×): usar `Intl.NumberFormat(i18n.language)` em vez de `toFixed` + troca manual.

## 3. Deploy e operação
Veredito: N/A
- Sem variável, container ou script. Atualizar README e `CHANGELOG.md` [Unreleased] (tarefa 3.3 cobre).

## 4. Qualidade de código
Veredito: Atenção
- **Q1 (Atenção, forte): jsdom não tem `ResizeObserver`** e `src/test/setup.ts` não o define; o Thumb do Radix usa `useSize` (ResizeObserver) e quebra ao renderizar. Os testes da tarefa 3.1 precisam de um stub de `ResizeObserver` (e possivelmente `PointerEvent`/`hasPointerCapture`) no setup ou no próprio arquivo de teste. Acrescentar à tarefa 3.1. Interação por teclado com `fireEvent.keyDown` nas setas funciona; arrastar com mouse não (cobrir por teclado).
- Os testes de layout existentes (`graphLayout.test.ts`) são o lugar certo; incluir caso de `layoutRing` com 0 e 1 nó e `spacing` diferente de 1 (sem NaN, quadro com tamanho finito).
- Teste de componente: comparar posições de nós antes/depois (padrão do arquivo: `distance(id)` a partir do centro) e a descarte de `sessionShifts`.
- Organização: a mudança cabe em `graphLayout.ts` + `RelationsGraph.tsx` (arquivo já longo); manter o controle como componente interno `DistanceControl` perto de `GraphControls`, sem refactor.
- Divisão do apply no codex: 1 (layout + testes), 2 (UI + i18n + testes), verificação e revisão visual do coordenador.

## 5. Execução das decisões arquiteturais
Veredito: OK
- Tasks seguem o design (fator logarítmico, memória, descarte dos arrastes). Sem decisão reaberta.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- F3/A2: definir se o fator vale ao vivo com reenquadramento a cada passo ou só no commit.
- Q1: stub de `ResizeObserver` nos testes (limitação do jsdom com o Radix Slider).
