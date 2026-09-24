# Implementation Plan: Seleção de personagem no Mapa e em Relações

**Branch**: `147-selecao-personagem` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/147-selecao-personagem/spec.md`

## Summary

Garantir que selecionar um personagem abra seus detalhes no Mapa e mantenha a seleção do nó do grafo sincronizada com o painel em Relações. A pesquisa confirma que a aplicação ativa já possui estado e handlers para esses fluxos e que testes E2E cobrem caminhos centrais. Portanto, o trabalho de implementação deve primeiro reproduzir a falha relatada no código ativo e localizar a divergência de interação; então deve corrigir somente o caminho comprovadamente defeituoso e acrescentar uma regressão E2E. Não há indicação para criar estado paralelo, mudar dados ou adicionar endpoints.

## Technical Context

**Language/Version**: TypeScript 6.0 (frontend); Python 3.11+ no backend existente, sem mudança prevista no backend.

**Primary Dependencies**: React 19, React Router 7, Vite 8, Playwright.

**Storage**: N/A — seleção é estado transitório da interface; personagens e relações continuam nos dados existentes da campanha.

**Testing**: Playwright E2E; `npm run build` como verificação de compilação do frontend.

**Target Platform**: Aplicação web, incluindo os viewports desktop e mobile cobertos pelos projetos Playwright existentes.

**Project Type**: Aplicação web com frontend React/Vite e backend FastAPI existente.

**Performance Goals**: A seleção deve atualizar o painel sem uma nova busca de personagem; usa os dados já carregados na tela.

**Constraints**: Preservar os estados de busca/filtro, expansão do painel, visibilidade de campanha e comportamento de clique/arrasto do grafo. Sem mudança visual intencional, de API, de armazenamento ou de schema.

**Scale/Scope**: Dois fluxos de interface: lista de personagens do Mapa → ficha; lista ou nó de Relações → nó selecionado e detalhes correspondentes no painel.

## Constitution Check

*Avaliação inicial e após design — Codex da Campanha v1.0.0.*

- **I. Isolamento — PASS**: não há nova rota nem consulta; a seleção atua somente sobre personagens já carregados para a campanha em tela.
- **II. Testes primeiro — PASS / N/A**: não altera autenticação, permissões, migrações ou importação/exportação. A correção será guiada por teste de regressão E2E.
- **III. Produção legada — PASS**: nenhuma alteração ou dependência de mudança nas instâncias legadas.
- **IV. Simplicidade — PASS**: reaproveitar estado e handlers existentes; nenhuma dependência nova.
- **V. i18n — PASS**: não há copy nova prevista. Se a correção exigir texto de interface, criar chaves pt-BR e en.
- **VI. Migrações — N/A**: não há mudança de schema.

## Project Structure

### Documentation (this feature)

```text
specs/147-selecao-personagem/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── selection-ui.md
└── quickstart.md
```

### Source Code (repository root)

```text
frontend/src/pages/
├── MapPage.tsx                 # seleção da lista e abertura de NpcDetail
└── RelacoesPage.tsx            # estado de seleção e composição da página

frontend/src/components/
├── map/                        # painel compartilhado e mapa de campanha
└── relacoes/GraphStage.tsx     # seleção do nó por interação no grafo

frontend/e2e/
├── mapa-retratos.spec.ts       # seleção da lista do Mapa já coberta
├── relacoes-flows.spec.ts      # lista, grafo e painel já cobertos
└── relacoes-retratos.spec.ts   # seleção da lista e nó selecionado já cobertos
```

**Structure Decision**: manter a aplicação existente em `frontend/`. Não tocar no protótipo `frontend-next/`, no backend nem nos modelos. Reutilizar os componentes e estados atuais; adicionar/ajustar E2E junto ao fluxo reproduzido.

## Complexity Tracking

Sem violações da constituição; nenhuma complexidade adicional requer justificativa.
