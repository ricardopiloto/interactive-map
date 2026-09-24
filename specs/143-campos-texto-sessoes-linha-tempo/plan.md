# Implementation Plan: Campos de texto padronizados em Sessões e Linha do Tempo

**Branch**: `143-campos-texto-sessoes-linha-tempo` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/143-campos-texto-sessoes-linha-tempo/spec.md`

**Backlog**: [BKLG-033](../../docs/v2/backlog.md#bklg-033-design--campos-de-texto-de-sessões-e-linha-do-tempo-divergem-do-padrão-visual)

## Summary

Padronizar os campos de texto de uma linha e as áreas de escrita Markdown de Sessões e Linha do Tempo com o mesmo modelo visual usado pelos campos de texto da criação de Novo Codex. Extrair esse tratamento para um estilo reutilizável baseado nos tokens existentes e fazer Novo Codex e os dois formulários usarem o mesmo modelo. Preservar abas/prévia Markdown, dados, validações, salvamento, layout geral e campos numéricos/de seleção.

## Technical Context

**Language/Version**: TypeScript, React 19, CSS (frontend Vite)

**Primary Dependencies**: React/CSS e tokens existentes. Nenhuma dependência nova.

**Storage**: N/A — os valores continuam usando os campos existentes de Sessão e Evento.

**Testing**: Verificação visual manual em criação e edição, nos temas claro/escuro e em viewport estreita; `npm run build` em `frontend/` para validar tipagem e build. A SPEC é polimento de UI, sem rota, auth, migração ou dados.

**Target Platform**: Aplicação web, rotas `/c/:slug/sessoes` e `/c/:slug/linha-do-tempo`; desktop e mobile.

**Project Type**: Frontend web application.

**Performance Goals**: N/A — mudança de apresentação de controles nativos existentes.

**Constraints**: Igualar altura, padding, borda, raio, fundo, tipografia e foco à referência Novo Codex; usar os tokens atuais para cores/temas; não alterar os fluxos Markdown, validações nem dados persistidos; sem mudança de copy/i18n, API ou backend.

**Scale/Scope**: Campos textuais de uma linha e áreas de escrita Markdown em Novo Codex, Sessões e Linha do Tempo. Não redesenhar páginas, cards ou drawer e não alterar outros controles.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS / N/A — sem rota nova ou leitura/escrita adicional de dados.
- **II. Testes primeiro**: PASS / N/A — polimento de UI; verificação visual manual e build são suficientes conforme a Constituição.
- **III. Produção legada**: PASS — não exige alterações nas instâncias legadas.
- **IV. Simplicidade**: PASS — extrair e reutilizar um único estilo de campo derivado do padrão visual já usado por Novo Codex; zero dependências novas.
- **V. i18n**: PASS — sem copy nova; rótulos e dados de campanha permanecem como estão.
- **VI. Migrações**: PASS / N/A — sem mudança de schema.

**Post-design re-check**: PASS — o desenho permanece restrito ao frontend; os três formulários usam o mesmo tratamento de campo, sem contratos externos, persistência ou novos textos.

## Phase 0: Research

Decisões detalhadas em [research.md](./research.md): tornar reutilizável o modelo visual específico da criação Novo Codex; aplicá-lo aos campos simples e à área de escrita Markdown de Sessões e Linha do Tempo sem modificar o comportamento Markdown.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md): confirma que Sessão e Evento mantêm seus campos atuais e que não há mudança de modelo.
- Contratos: não aplicável; esta mudança interna de apresentação não altera APIs nem interfaces externas.
- [quickstart.md](./quickstart.md): roteiro manual para validar criação, edição, temas e viewport.

## Project Structure

### Documentation (this feature)

```text
specs/143-campos-texto-sessoes-linha-tempo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md             # criado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── pages/SessoesPage.tsx        # campos título/data do formulário
├── pages/LinhaTempoPage.tsx     # campos título/era do formulário
├── pages/NovoCodexPage.tsx      # passa a usar o estilo compartilhado de referência
├── pages/NovoCodexPage.css      # remove regra local substituída pelo estilo compartilhado
├── components/ui/ui.css         # variante visual reutilizável para campos Novo Codex
├── components/forms/MarkdownField.tsx  # aceitar classe visual opcional no textarea
└── components/ui/Field.tsx      # controles Input/Textarea compartilhados
```

**Structure Decision**: Extrair para `ui.css` uma variante compartilhada fiel ao estilo de campo já usado em Novo Codex; migrar os inputs de Novo Codex para essa variante e aplicá-la aos campos simples e à área de escrita Markdown dos formulários de Sessões e Linha do Tempo. Permitir que `MarkdownField` receba a classe visual sem alterar seu comportamento nem afetar outros usos.

## Complexity Tracking

Nenhuma violação.
