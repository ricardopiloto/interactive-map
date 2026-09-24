# Implementation Plan: Retratos nas listas de personagens

**Branch**: `145-retrato-lista-personagens` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/145-retrato-lista-personagens/spec.md`

## Summary

Exibir os retratos cadastrados nos avatares das listas de personagens do Mapa e do mapa de Relações, mantendo as dimensões circulares atuais e o comportamento de fallback para iniciais quando a imagem estiver ausente ou falhar. As duas telas já recebem `retrato_url` nos objetos de personagem; a mudança não requer API, persistência ou alteração de domínio. A imagem deve seguir o recorte circular com `object-fit: cover` já usado pelos tokens do grafo de Relações.

## Technical Context

**Language/Version**: TypeScript 6 e React 19, conforme o frontend atual.

**Primary Dependencies**: React, Vite e Playwright já existentes; nenhuma dependência nova.

**Storage**: N/A — utilizar `Personagem.retrato_url` já carregado pela aplicação.

**Testing**: Testes de interface Playwright existentes; validação manual de carregamento, fallback, tema e viewport. Nenhum backend ou contrato HTTP novo.

**Target Platform**: Aplicação web responsiva, desktop e viewport móvel.

**Project Type**: Frontend de aplicação web existente, integrado a API já existente.

**Performance Goals**: Não adicionar chamadas de API nem recomputação de busca/filtro; mostrar somente as imagens dos personagens já presentes nas listas.

**Constraints**: Preservar avatar circular de 28×28 px nas duas listas, ordem, busca, filtros, seleção, hover e permissões atuais; manter iniciais acessíveis como fallback para URL ausente ou imagem inválida; imagem decorativa não deve duplicar o nome anunciado pelo botão.

**Scale/Scope**: Duas listas laterais — Mapa e Relações. O avatar de detalhe maior do Mapa e os tokens do grafo não mudam de aparência nem de comportamento.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS — não há rota nova ou consulta adicional; a lista continuará usando os personagens já carregados para a campanha atual.
- **II. Testes primeiro**: PASS — não envolve autenticação, permissões, migração ou import/export. A constituição permite validação manual para polimento de interface; os cenários de regressão visual/funcional são descritos em quickstart.
- **III. Produção legada**: PASS — nenhuma alteração em instâncias legadas é necessária.
- **IV. Simplicidade**: PASS — somente React/CSS e dependências de desenvolvimento já presentes.
- **V. i18n**: PASS — nenhuma nova copy; o nome existente permanece ao lado da imagem.
- **VI. Migrações**: PASS — sem mudanças de schema.

## Research Findings

- `frontend/src/types/index.ts` define `NPC.retrato_url` como `string | null`, e `Personagem` herda esse campo.
- `frontend/src/pages/MapPage.tsx` renderiza `filteredNpcs` na lista do Mapa e já recebe o retrato via dados de campanha; atualmente o avatar mostra apenas a primeira inicial. Seu CSS já define 28×28 px e formato circular.
- `frontend/src/pages/RelacoesPage.tsx` renderiza `listItems` na lista de Relações e também mostra apenas a primeira inicial; o campo `retrato_url` está presente nos objetos.
- `frontend/src/components/relacoes/GraphStage.tsx` já exibe retratos nos tokens, tratando erro de carregamento e restaurando as iniciais. `GraphStage.css` usa recorte circular e `object-fit: cover`.
- Ambas as listas usam botões que contêm nome e metadados; imagem com `alt=""` e `aria-hidden` evita repetir para tecnologias assistivas o nome já apresentado pelo botão.
- Busca, filtro, ordenação, hover e seleção são controlados independentemente da miniatura. A alteração deve permanecer apenas apresentacional.

## Design Decisions

1. Renderizar a URL do retrato dentro do avatar existente e manter as dimensões atuais das listas. A imagem preenche o círculo com o mesmo padrão de corte do token, sem distorção.
2. Manter as iniciais no avatar como conteúdo de fallback; ocultar a imagem que falhar e reiniciar o estado de erro se o personagem receber outra URL.
3. Aplicar o mesmo comportamento visual às duas listas sem mudar o componente ou o comportamento dos tokens do grafo nem o avatar maior do detalhe do Mapa.
4. Não criar entidade, endpoint, campo, migração ou dependência; os dados existentes já atendem aos requisitos.
5. Manter a interação e as coleções atuais das listas intactas; retrato não deve influenciar visibilidade, busca, filtros, ordem ou seleção.

## Project Structure

### Documentation (this feature)

```text
specs/145-retrato-lista-personagens/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/
    └── requirements.md
```

Não será criado `contracts/`: a funcionalidade não expõe nem altera API ou contrato externo.

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── MapPage.tsx          # avatar na lista lateral do Mapa
│   │   ├── MapPage.css          # recorte/estilo do avatar do Mapa
│   │   ├── RelacoesPage.tsx     # avatar na lista lateral de Relações
│   │   └── RelacoesPage.css     # recorte/estilo do avatar de Relações
│   └── components/relacoes/
│       ├── GraphStage.tsx       # comportamento existente de referência
│       └── GraphStage.css       # imagem circular de referência
└── e2e/
    ├── personagem-retratos-fixtures.ts # respostas determinísticas de imagem
    ├── mapa-retratos.spec.ts          # lista de personagens do Mapa
    └── relacoes-retratos.spec.ts      # lista de personagens de Relações
```

**Structure Decision**: Alterar somente os dois componentes e estilos das listas, preservando os handlers e wrappers dos botões existentes. Adicionar cobertura E2E independente para cada superfície usando a infraestrutura Playwright de `frontend/e2e` e uma fixture compartilhada para respostas válidas e falhas de imagem. O padrão de imagem do grafo é uma referência funcional e visual; não é necessário alterar o grafo para entregar esta funcionalidade.

## Constitution Check (post-design)

- **I. Isolamento**: PASS — nenhuma nova superfície de dados; o retrato pertence ao mesmo objeto de campanha já exibido.
- **II. Testes primeiro**: PASS — não se aplicam exigências de segurança ou dados; quickstart cobre testes de regressão para interface.
- **III. Produção legada**: PASS — escopo isolado ao frontend atual.
- **IV. Simplicidade**: PASS — sem dependências, serviços ou modelo novo.
- **V. i18n**: PASS — não há texto novo.
- **VI. Migrações**: PASS — schema inalterado.

## Complexity Tracking

Sem violações da constituição; nenhuma complexidade adicional requer justificativa.
