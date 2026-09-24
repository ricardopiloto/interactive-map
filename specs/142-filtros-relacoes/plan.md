# Implementation Plan: Filtros consistentes em Relações

**Branch**: `142-filtros-relacoes` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/142-filtros-relacoes/spec.md`

**Backlog**: [BKLG-032](../../docs/backlog/backlog.md#bklg-032-bug--filtros-de-vínculo-em-relações-devem-manter-paridade-entre-sidepanel-e-grafo)

## Summary

Fazer o SidePanel e o Grafo de Relações refletirem uma única seleção de tipos de vínculo. A seleção também governa a lista de vínculos quando um personagem está em detalhe; status continua definindo o conjunto de personagens disponível, busca continua filtrando a lista e destacando correspondências no grafo, e isolamento continua restringindo as arestas ao personagem selecionado. Seguir a semântica da SPEC 134: conjunto vazio significa “todos”; clique único adiciona/remove um tipo; duplo-clique isola um tipo ou restaura todos quando esse tipo já é o único ativo.

## Technical Context

**Language/Version**: TypeScript, React 19, CSS (frontend Vite)

**Primary Dependencies**: Dependências existentes: React, `GraphStage`, `MapSidePanel`, funções de direção/tipo de vínculo e hook de interação dos chips. Nenhuma dependência nova.

**Storage**: N/A — os filtros são estado efêmero da tela e os dados de Personagem/Vínculo já existem.

**Testing**: Verificação da lógica de filtragem e roteiro manual end-to-end para chip, status, busca, seleção e isolamento. Constitution II permite validação manual para UI sem auth, persistência ou API nova; nenhum teste será executado como parte deste planejamento.

**Target Platform**: Aplicação web na rota `/c/:slug/relacoes`, desktop e viewport estreita.

**Project Type**: Frontend web application.

**Performance Goals**: N/A — filtra as listas locais já carregadas na tela.

**Constraints**: Sem alteração visual, backend, contrato HTTP ou modelo persistido. Preservar busca, status, seleção, isolamento, estados vazios e regras de vínculo direcional. Conjunto de tipos vazio deve significar “mostrar todos”.

**Scale/Scope**: Página de Relações, `GraphStage` e conteúdo de lista/detalhe do SidePanel; uma seleção compartilhada de tipos deve controlar tanto arestas quanto linhas de vínculo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rotas; usa somente dados da campanha que a tela já recebeu.
- **II. Testes primeiro**: PASS — UI sem auth, migração ou operação de dados sensíveis; quickstart manual e validação da lógica cobrem o escopo.
- **III. Produção legada**: PASS — não exige mudança nas instâncias legadas.
- **IV. Simplicidade**: PASS — estado compartilhado e funções existentes; zero dependências novas.
- **V. i18n**: PASS — sem copy nova esperada; rótulos de tipos já são localizados.
- **VI. Migrações**: PASS / N/A — sem mudança de schema.

**Post-design re-check**: PASS — o contrato de UI não introduz endpoint, dado persistido, texto novo ou dependência. A regra de visibilidade continua no conjunto de dados já recebido pela tela.

## Phase 0: Research

Decisões e divergências estão em [research.md](./research.md). A investigação confirmou que a branch `main` usa um estado global de tipos no filtro da coluna e no grafo, enquanto esta branch também mantém `activeDetailTipos` independente no detalhe. A SPEC 133 havia escolhido essa independência, mas o requisito mais recente do BKLG-032/SPEC 142 a substitui para esta feature. A SPEC 134 também fixa a semântica de conjunto vazio como “todos”; o helper atual do grafo não implementa essa regra e precisa ser incluído na correção planejada.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md): documenta estado transitório da tela; nenhuma entidade persistida muda.
- [contracts/ui-filters.md](./contracts/ui-filters.md): contrato comportamental da interface para tipos, status, busca e isolamento.
- [quickstart.md](./quickstart.md): cenários manuais para confirmar paridade painel/grafo e ausência de regressão.

## Project Structure

### Documentation (this feature)

```text
specs/142-filtros-relacoes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-filters.md
└── tasks.md             # criado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── pages/RelacoesPage.tsx                      # fonte de estado e montagem do SidePanel/Grafo
├── components/relacoes/GraphStage.tsx          # arestas, isolamento e correspondência de tipos
├── components/relacoes/vinculoDirection.ts     # regra de correspondência por direção
├── components/relacoes/useVinculoTipoChipClicks.ts # clique e duplo-clique dos chips
└── components/relacoes/RelacoesDetailPanel.tsx # referência da implementação em main; branch usa detalhe na página
```

**Structure Decision**: Manter a lógica de filtragem como estado da página de Relações e encaminhar o mesmo estado ao SidePanel/detalhe e ao `GraphStage`. Revisar a filtragem em ambas as perspectivas direcionais do vínculo para que um vínculo de duas vias seja incluído quando qualquer direção corresponder. Preservar o layout atual desta branch; mudanças são comportamentais.

## Complexity Tracking

Nenhuma violação.
