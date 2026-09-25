# Implementation Plan: Administração de usuários e mesas

**Branch**: `148-administracao-usuarios-mesas` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: `/specs/148-administracao-usuarios-mesas/spec.md` (BKLG-035)

## Summary

Criar um console `/admin` para listar e administrar contas e mesas, reaproveitando a autorização global existente (`require_admin`), o fluxo de convites/reset de uso único e os bancos SQLite atuais. As rotas do console retornam somente metadados operacionais. Desativação é reversível; exclusões são operações permanentes com verificações de propriedade/último administrador e confirmação explícita na interface. A data efetiva de alteração combina criação registrada e gravações posteriores de conteúdo/configuração, sem usar acessos ou leituras como atividade de modificação.

## Technical Context

**Language/Version**: Python 3.13 no backend e TypeScript 6 / React 19 no frontend.

**Primary Dependencies**: FastAPI, SQLModel, Alembic, SQLite, React Router, i18next, Playwright; nenhuma dependência nova.

**Storage**: `control.db` mantém usuários, sessões, convites, vínculos e metadados de mesas; cada mesa mantém `campanha.db`, uma linha de controle de modificação e uploads próprios em `DATA_DIR/campanhas/<uuid>/`.

**Testing**: pytest/ FastAPI TestClient para autorização, regras de conta, ciclo de vida, migração e timestamp; Playwright para console, estados e confirmações; `npm run build` para compilação.

**Target Platform**: aplicação web existente e backend FastAPI em Linux, com bancos SQLite.

**Project Type**: aplicação web com frontend React/Vite e backend FastAPI.

**Performance Goals**: consultas administrativas devem filtrar no servidor por e-mail/nome/slug/proprietário e estado; não carregar nem serializar dados narrativos das mesas.

**Constraints**: manter SQLite e as instâncias legadas sem alterações obrigatórias; proteger cada rota no servidor; nunca mostrar senha/token armazenado; garantir operação destrutiva sobre a entidade confirmada; usar migração Alembic com suporte a SQLite.

**Scale/Scope**: uma área global de administração com seções de usuários e mesas; endpoints de listagem, convite, reset, estado, transferência de propriedade e exclusão; migrações nos bancos de controle e campanha e instrumentação centralizada de gravações.

## Constitution Check

*Avaliação inicial — Codex da Campanha v1.0.0.*

- **I. Isolamento — PASS, com limite explícito**: os endpoints são globais por desenho, mas consultam somente metadados de `control.db`. Nenhum endpoint lê narrativa de `campanha.db`; exclusão física usa apenas o `caminho` confiável da linha selecionada e testa que outros bancos/arquivos permanecem intactos. Listas e ações retornam apenas campos previstos no contrato.
- **II. Testes primeiro — PASS**: testes de matriz (anônimo/não-admin/admin), último administrador, revogação de sessão, bloqueio por propriedade, transferência, exclusão isolada, migração e data de modificação devem existir antes de implementar os respectivos comportamentos.
- **III. Produção legada — PASS**: não exige alteração nas instâncias legadas anteriores ao corte 099; a migração roda apenas no banco de controle da aplicação que implanta esta feature.
- **IV. Simplicidade — PASS**: preserva FastAPI, SQLModel, Alembic, React, i18next e SQLite; sem serviço ou pacote novo.
- **V. i18n — PASS**: toda copy do console terá chaves em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`; textos narrativos não serão carregados.
- **VI. Migrações — PASS**: revisão `007` aditiva no Alembic de controle, com `batch_alter_table`; campos novos aceitam `NULL` para campanhas legadas sem data confiável. Downgrade remove apenas as colunas novas.

**Gates**: PASS inicial. Reavaliar após design abaixo.

## Design Decisions

1. **Superfície global de administração**: expandir `backend/app/routers/administrador.py`, que já aplica `Depends(require_admin)` a todo o router; conservar `POST /api/admin/convites` e acrescentar endpoints no mesmo escopo. IDs internos selecionam as entidades; schemas de resposta são allow-list de metadados.
2. **Conta e ciclo de credenciais**: estado derivado de `activo` + presença de `senha_hash` (`pendente`, `ativa`, `inativa`). Convite e reset chamam os serviços existentes e retornam somente link copiável. Desativação e exclusão revogam sessões na mesma transação; reativação não recria sessões. Alteração de `is_admin` continua fora da UI.
3. **Proteção de contas**: bloquear desativação/exclusão do último administrador ativo. Bloquear desativação/exclusão de proprietário enquanto possuir qualquer mesa, até transferência ou exclusão dessas mesas. Transferência valida proprietário ativo e atualiza o vínculo `dono` de forma atômica.
4. **Exclusão de conta**: numa transação explícita remover convites, sessões, vínculos de membro e bloqueios de login da conta e então usuário. Não tocar em bancos/uploads de mesas nem em conteúdo dos demais membros.
5. **Ciclo de vida da mesa**: `activa` é estado operacional reversível; `visibilidade` continua atributo separado. Exclusão permanente primeiro desativa para barrar novas resoluções, fecha engine em cache, move somente a pasta UUID da mesa confirmada para uma área temporária de remoção, remove vínculos e linha de controle transacionalmente e, após sucesso, apaga a pasta temporária. Falha antes do commit restaura a pasta e conserva a linha desativada para retry; validação canônica do caminho deve confiná-lo ao diretório de campanhas.
6. **Última modificação**: adicionar `criado_em` e `modificado_em` opcionais ao registry `Campanha` via Alembic de controle 007, e criar `campaign_state.modificado_em` por nova revisão Alembic do banco de cada mesa. Novas mesas recebem `criado_em`; para legado, timestamps históricos ficam desconhecidos, sem backfill com a data da migração. Um listener `before_flush` atualiza a linha `campaign_state` dentro da mesma transação somente quando a sessão da mesa possui alterações ORM; rollback não deixa timestamp adiantado. Mutações de configuração no banco de controle atualizam `Campanha.modificado_em`. A listagem lê somente essa linha operacional de cada banco e retorna o máximo entre `criado_em`, `Campanha.modificado_em` e `campaign_state.modificado_em`; ausência de datas históricas permanece `null`. Leituras e autenticação não alteram timestamps.
7. **Interface**: criar página global `/admin` com abas/listas Usuários e Mesas, pesquisa/filtro, estados de carregamento/vazio/erro e confirmações que identificam a entidade. Atualizar navegação de `UserMenu`; preservar `/admin/convites` para links existentes e integrar nela o mesmo fluxo de convite. Usar `SiteChrome`, componentes UI existentes e i18n `comum`.

## API Contracts (summary)

- `GET /api/admin/usuarios?email=&estado=` — lista allow-listed com id, e-mail, estado, `is_admin`, criação e mesas próprias (slug/nome/estado).
- `POST /api/admin/convites` — contrato atual `{email}` → `{email, link}`; duplicado retorna `409 EMAIL_DUPLICADO`.
- `POST /api/admin/usuarios/{id}/reset` — link de reset copiável; somente conta ativa.
- `PATCH /api/admin/usuarios/{id}/estado` — `{activo: boolean}`; 409 para último administrador ou proprietário protegido.
- `DELETE /api/admin/usuarios/{id}` — 204 quando removida; 409 com identificadores/nome/slug das mesas que impedem exclusão.
- `GET /api/admin/campanhas?q=&estado=` — metadados de campanha, dono, `activa`, visibilidade, `criado_em` e data efetiva de modificação.
- `PATCH /api/admin/campanhas/{id}/estado` — `{activa: boolean}`.
- `PATCH /api/admin/campanhas/{id}/proprietario` — `{email}` para transferência atômica a usuário ativo.
- `DELETE /api/admin/campanhas/{id}` — 204 após exclusão da mesa confirmada; 404 se ausente, 409 se conflito operacional.

Todos os endpoints novos permanecem sob a dependência global `require_admin`; códigos de erro são mapeáveis para i18n e não retornam segredos.

## Project Structure

### Documentation

```text
specs/148-administracao-usuarios-mesas/
├── plan.md
├── research.md
├── data-model.md
├── contracts/admin-console.md
└── quickstart.md
```

### Source Code (repository root)

```text
backend/
├── app/routers/administrador.py       # rotas globais protegidas
├── app/schemas/admin_console.py       # respostas allow-listed e payloads
├── app/services/admin_console.py      # regras, propriedade e lifecycle
├── app/campaign_db.py                 # hook de gravação em transação da mesa
├── app/models/campanha.py             # timestamps operacionais do registry
├── app/models/campaign_state.py       # metadado de escrita de conteúdo
├── alembic_control/versions/007_*.py  # datas de criação/configuração
├── alembic_campaign/versions/006_*.py # metadado de escrita da mesa
└── tests/test_admin_console_*.py      # route matrix, regras, dados e exclusões
frontend/
├── src/pages/AdminConsolePage.tsx     # navegação entre listas
├── src/pages/AdminConvitesPage.tsx    # compatibilidade e fluxo integrado
├── src/api/client.ts                  # chamadas globais autenticadas
├── src/components/layout/UserMenu.tsx # entrada para administradores
├── src/locales/{pt-BR,en}/comum.json  # copy traduzida
└── e2e/admin-console.spec.ts          # jornadas admin
```

**Structure Decision**: manter backend e frontend existentes; separar serviços/schemas novos do router fino, seguindo os limites já usados pelo app. Não criar aplicação ou armazenamento adicional.

## Phase 0 — Research

Decisões e evidências detalhadas em [research.md](research.md). Os principais pontos resolvidos foram autorização global já disponível, ausência de rotas de listagem/remoção, armazenamento de campanha em árvore separada, inexistência de timestamp de criação/modificação na entidade `Campanha`, e necessidade de limpeza explícita dos relacionamentos sem depender de cascatas SQLite.

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md) descreve projeções e estados derivados sem expor hash/token.
- [contracts/admin-console.md](contracts/admin-console.md) define requests, responses, erros e matriz de autorização.
- [quickstart.md](quickstart.md) contém cenários executáveis de backend, migration, frontend e E2E.

## Re-evaluation: Constitution Check

- **I. Isolamento — PASS**: consultas globais limitadas a metadados do banco de controle; operações de mesa apontam para um ID e caminho validado; cenários de teste preservam e conferem outras mesas e conteúdo narrativo.
- **II. Testes primeiro — PASS**: migrations, auth, ownership, exclusão física e sessão invalidada têm tarefas de teste anteriores a implementação.
- **III. Produção legada — PASS**: nenhuma operação depende de deploy nas instâncias legadas.
- **IV. Simplicidade — PASS**: sem nova dependência ou tipo de armazenamento.
- **V. i18n — PASS**: todos os estados, ações e erros novos cobertos em pt-BR/en.
- **VI. Migrações — PASS**: revisão Alembic aditiva, reversível por remoção das colunas; datas históricas incertas ficam nulas.

## Complexity Tracking

Sem violações da constituição ou dependências adicionais. O mecanismo de timestamp de commits é necessário para satisfazer FR-014 sem confundir leitura com modificação; uma coluna atualizada apenas nas rotas de metadados não satisfaria a especificação.
