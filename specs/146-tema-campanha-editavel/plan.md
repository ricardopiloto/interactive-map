# Implementation Plan: Tema visual da campanha editável

**Branch**: `146-tema-campanha-editavel` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/146-tema-campanha-editavel/spec.md`

## Summary

Permitir ao dono alterar, depois da criação, o gênero visual compartilhado da campanha entre as quatro opções existentes. O campo `Campanha.genero`, já persistido no banco de controle e exposto pela configuração da campanha, será atualizado por uma operação autenticada e a mudança será oferecida no Painel. O frontend reutilizará as paletas e as regras `applyCampaignGenre` existentes, sem alterar a preferência pessoal Claro/Escuro/Automático.

## Technical Context

**Language/Version**: Python >=3.12; TypeScript com React 19 e Vite 8.

**Primary Dependencies**: FastAPI, SQLModel, Pydantic, React, react-i18next; todas já presentes.

**Storage**: SQLite `control.db`; coluna `campanha.genero` existente. Não é necessária migration.

**Testing**: pytest/TestClient para autenticação, autorização, validação e isolamento; validação frontend com build e cenários manuais de interface.

**Target Platform**: Aplicação web responsiva, servida pelo backend FastAPI.

**Project Type**: Aplicação web com backend e frontend separados.

**Performance Goals**: Atualização de configuração de baixo volume, concluída em uma chamada; sem regressão perceptível no carregamento ou navegação entre campanhas.

**Constraints**: Somente quatro IDs de gênero existentes; somente dono autenticado altera; cada alteração fica limitada ao slug autorizado; manter produção legada e preferência pessoal; nova copy em pt-BR e en.

**Scale/Scope**: Um atributo existente por campanha, um PATCH de gestão e controles de alteração no cartão de cada campanha do dono no Painel.

## Constitution Check

| Princípio | Avaliação antes do desenho |
|-----------|-----------------------------|
| I. Isolamento entre campanhas | PASS — alteração restrita ao slug do PATCH e protegida por `require_dono`; os testes devem confirmar que mudar A não altera B e que outro membro não altera B. Incluir a nova rota na matriz de isolamento. |
| II. Testes primeiro | PASS — escrever primeiro testes HTTP falhantes para dono, anônimo, membro não dono, gênero inválido e isolamento antes da implementação. |
| III. Produção legada não para | PASS — não requer operação manual nem mudança em instâncias legadas. |
| IV. Simplicidade | PASS — reutiliza FastAPI/SQLModel, SQLite e endpoints de gestão já existentes; nenhuma dependência nova. |
| V. Interface PT-BR e EN | PASS — reaproveitar rótulos dos quatro gêneros e adicionar chaves bilingues para controle, salvar/cancelar, estado e erro de gênero inválido. |
| VI. Migrações versionadas | PASS — sem mudança de schema; campo `genero` já existe desde a revisão Alembic 005. |

**Gate pré-pesquisa**: PASS. Não há violação ou ponto pendente de esclarecimento.

## Project Structure

### Documentation (this feature)

```text
specs/146-tema-campanha-editavel/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── genero-api.md
│   └── painel-tema.md
└── quickstart.md
```

### Source Code (repository root)

```text
backend/
├── app/routers/campanhas.py             # PATCH de gênero com require_dono
├── app/schemas/campanhas.py             # request/response do PATCH
├── app/services/campanha_admin.py       # validação e persistência no control.db
└── tests/
    ├── test_campanha_genero_http.py      # auth, validação e sucesso
    └── test_isolation_http.py            # sem efeito em campanhas diferentes

frontend/src/
├── api/campanhas.ts                      # cliente patchGenero
├── pages/PainelPage.tsx                  # seleção, salvar/cancelar e erro
├── hooks/useInstanceConfig.ts             # invalidar configuração em cache
└── locales/{pt-BR,en}/comum.json         # copy bilingue

specs/111-genero-identidade-campanha/
└── quickstart.md                          # remover a expectativa antiga de imutabilidade
```

**Structure Decision**: Aplicação web existente com backend em `backend/app` e `backend/tests`, e frontend React em `frontend/src`. A edição ficará no Painel, que já apresenta as campanhas do dono e seus controles de visibilidade, unidade e capa.

## Complexity Tracking

Sem violações da constituição; nenhuma complexidade adicional requer justificativa.

## Design Summary

- API de gestão: `PATCH /api/campanhas/{slug}/genero`, com sessão e papel de dono obrigatórios.
- Request carrega o ID de gênero; o `slug` é o identificador da rota. A response confirma `slug` e gênero persistido. A lista permitida permanece `fantasia`, `gotico`, `scifi` e `urbano`.
- A gravação atualiza somente `Campanha.genero` no banco de controle. O `GET /api/c/{slug}/config` já expõe o atributo e continuará sendo a fonte de verdade para todos os participantes.
- O Painel permite escolher e confirmar ou cancelar uma alteração pendente por campanha. Em falha, conserva o gênero confirmado anteriormente e apresenta erro traduzido.
- Depois de salvar, o Painel atualiza seus dados e invalida o cache de configuração daquele slug, para que a próxima abertura da campanha aplique a identidade visual salva.
- `applyCampaignGenre` continua decidindo paleta e suporte a modo claro; a chave pessoal `codex.theme` continua independente e não é escrita pela operação.
- Atualizar o quickstart legado da spec 111 para remover a expectativa antiga de que gênero nunca pode ser alterado após criação; a regra de criação, paletas e comportamento de export/import continuam válidos.

## Constitution Check (post-design)

| Princípio | Avaliação após o desenho |
|-----------|---------------------------|
| I. Isolamento entre campanhas | PASS — endpoint de escrita recebe slug individual e `require_dono`; teste cobre A e B e a nova superfície entra na matriz HTTP. |
| II. Testes primeiro | PASS — testes de auth, papel, validação e isolamento antecedem implementação. |
| III. Produção legada não para | PASS — nenhuma alteração operacional legada. |
| IV. Simplicidade | PASS — sem dependência, serviço ou armazenamento novos. |
| V. Interface PT-BR e EN | PASS — reutiliza traduções existentes para nomes de gêneros e adiciona mensagens bilingues de edição. |
| VI. Migrações versionadas | PASS — sem alteração de schema ou migration. |

**Gate pós-desenho**: PASS.
