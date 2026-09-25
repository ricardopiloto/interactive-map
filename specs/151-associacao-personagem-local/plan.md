# Implementation Plan: Associar personagens a Locais

**Branch**: `151-associacao-personagem-local` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/151-associacao-personagem-local/spec.md`

## Summary

Permitir que mestres associem PJs e NPCs a Locais e que membros consultem as associações visíveis. A investigação mostrou que o modelo unificado de personagens, a tabela de vínculo Local-personagem, os esquemas e os endpoints atuais já aceitam ambos os tipos. O filtro de `useCampaignData` e as labels de interface limitam a experiência a NPCs. O plano amplia seleção, exibição e identificação do tipo no frontend, com testes de regressão de visibilidade e isolamento, sem nova tabela, endpoint ou migração.

## Technical Context

**Language/Version**: Python 3.13 (backend); TypeScript 6, React 19 (frontend)

**Primary Dependencies**: FastAPI, SQLModel, React, Vite, Playwright já existentes; nenhuma dependência nova

**Storage**: SQLite por campanha, com relação N:N existente `local_npc`

**Testing**: pytest focado para vínculo e visibilidade; Playwright focado no fluxo do Mapa; build/lint/contraste conforme arquivos alterados. Não executar a suite completa para toda alteração; ampliar para suite completa em mudança de risco elevado, marco de entrega ou CI.

**Target Platform**: Aplicação web ativa em desktop e mobile

**Project Type**: Aplicação web full-stack; alteração principal no frontend e testes de regressão no backend

**Performance Goals**: Preservar os tempos e número de chamadas atuais; não adicionar chamadas remotas para exibir o tipo do personagem

**Constraints**: Respeitar visibilidade de Locais e personagens, manter os caminhos de edição atuais, suportar PT-BR e EN, e preservar payloads e dados existentes

**Scale/Scope**: Associação de personagens da mesma campanha no Mapa; sem mudanças no comportamento de Sessões, Linha do Tempo, Relações ou no vínculo entre personagens

## Constitution Check

- **I. Isolamento entre campanhas — PASSA**: os dados permanecem na base SQLite da campanha ativa. Não se adicionam rotas; validar que leitura e gravação da relação continuam restritas ao slug/campanha da sessão, incluindo requisição com conta sem associação à campanha.
- **II. Testes primeiro — PASSA**: sem mudança de autenticação, autorização, migração ou import/export. Como a mudança toca visibilidade, adicionar/ajustar testes de persistência, leitura pública/autenticada e isolamento antes da implementação correspondente. A permissão de edição atual é a associação autenticada à campanha (`require_membro`); não existe papel de membro jogador somente leitura.
- **III. Produção legada — PASSA**: não exige alteração nas instâncias legadas.
- **IV. Simplicidade — PASSA**: reaproveita tabelas, endpoints, bibliotecas e componentes existentes; sem dependências novas.
- **V. i18n — PASSA**: novas labels e tipos devem ter chaves em pt-BR e en; nomes e lore do mestre permanecem sem tradução.
- **VI. Migrações — N/A**: a tabela e as chaves existentes já comportam os dois tipos; não se prevê mudança de schema.

**Reavaliação pós-design — PASSA**: não há endpoint, dado persistido, esquema ou dependência novos. O payload atual continua válido e os testes focados cobrem visibilidade e isolamento. Nenhum gate da constituição exige exceção.

## Project Structure

### Documentation (this feature)

```text
specs/151-associacao-personagem-local/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

Não há contratos externos novos. As rotas existentes de leitura e edição mantêm o mesmo contrato.

### Source Code

```text
backend/app/models/
├── npc.py                 # entidade unificada Personagem PJ|NPC
├── local.py               # relação de Local com personagens
└── links.py               # LocalNPCLink existente
backend/app/schemas/local.py
backend/app/routers/admin/locais.py
backend/app/routers/public/locais.py
frontend/src/hooks/useCampaignData.ts
frontend/src/components/admin/LocalFormDialog.tsx
frontend/src/pages/MapPage.tsx
frontend/src/locales/{pt-BR,en}/{admin,mapa}.json
backend/tests/test_visibility_local_arco.py
backend/tests/test_visibility.py
frontend/e2e/
```

**Structure Decision**: manter a relação e os contratos atuais; alterar a seleção e apresentação da lista de personagens no fluxo do Mapa e cobrir o comportamento em backend e E2E. A implementação deve evitar uma conversão ampla da terminologia interna `NPC` quando não for necessária para cumprir a feature.

## Complexity Tracking

Sem violações da constituição ou dependências novas.
