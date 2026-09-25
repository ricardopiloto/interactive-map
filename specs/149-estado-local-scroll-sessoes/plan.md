# Implementation Plan: Estado de locais e rolagem de sessões

**Branch**: `149-estado-local-scroll-sessoes` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Corrigir BUG-002 (alternância bidirecional do estado Conhecido/Visitado de um Local) e BUG-003 (acesso por rolagem à lista completa de Sessões no desktop).

## Summary

Separar o estado de exploração do Local de sua cor e do rótulo textual de sessão, persistindo `conhecido` ou `visitado` no banco isolado de cada campanha e propagando o valor pelos contratos de leitura e gravação existentes. Migrar dados legados preservando a interpretação atual baseada em `data_sessao`. Tornar a lista principal de Sessões alcançável por rolagem em desktop e mobile, diagnosticando no navegador qual elemento recebe o scroll e preservando a navegação já funcional no mobile.

## Technical Context

**Language/Version**: Python 3.13; TypeScript 6 e React 19.

**Primary Dependencies**: FastAPI, SQLModel, Alembic, SQLite, React, React Router, i18next e Playwright; sem dependências novas.

**Storage**: banco SQLite isolado por campanha (`campanha.db`) para o estado de cada Local. A lista de Sessões já é carregada pelos serviços existentes e não requer alteração de persistência.

**Testing**: pytest para schemas, regras e migração; testes HTTP existentes para leitura/gravação e isolamento entre campanhas; Playwright para os dois estados de Local e para uma lista longa de Sessões em desktop e mobile; `npm run build` para o frontend.

**Target Platform**: aplicação web existente, executada em navegadores desktop e mobile; backend Linux com SQLite.

**Project Type**: aplicação web com frontend React/Vite e backend FastAPI.

**Performance Goals**: persistir o estado na mesma gravação normal do Local, sem uma consulta adicional só para o estado; uma lista longa deve continuar respondendo à rolagem sem truncar entradas.

**Constraints**: estado compartilhado por campanha; `data_sessao` e `cor_pin` permanecem campos independentes; respeitar as permissões atuais de edição; não alterar a ordem, visibilidade ou conteúdo de Sessões; conservar o espaço inferior da navegação mobile; nenhuma dependência nova.

**Scale/Scope**: adicionar o estado de exploração ao Local e corrigir o acesso vertical da lista principal da página Sessões. Sem endpoints novos, mudança de autenticação ou alteração do modelo de Sessão.

## Constitution Check

*Avaliação inicial — Codex da Campanha v1.0.0.*

- **I. Isolamento — PASS**: o estado vive no banco da campanha e percorre endpoints já escopados por slug. Testes devem provar que alterar ou ler esse valor em uma campanha não altera outra. A tela Sessões não recebe nova superfície de dados.
- **II. Testes primeiro — PASS**: criar testes que falhem antes da alteração para default/backfill, persistência bidirecional, leitura do mesmo valor e isolamento; cobrir a acessibilidade da última sessão por Playwright antes da correção do layout.
- **III. Produção legada — PASS**: nenhuma alteração manual das instâncias legadas é necessária; a revisão versionada acompanha a aplicação até o corte 099.
- **IV. Simplicidade — PASS**: manter SQLite, SQLModel e ferramentas existentes, sem dependências.
- **V. i18n — PASS**: labels/estado ou mensagens novas devem existir em pt-BR e en; nomes e conteúdo escritos pelo mestre permanecem intactos.
- **VI. Migrações — PASS COM ROLLBACK DOCUMENTADO**: o campo de estado precisa de migração Alembic de campanha em batch mode. O downgrade remove o campo novo; para preservar estados alterados após a migração, deve-se restaurar backup antes do downgrade, pois o schema anterior não representa esse dado.

**Gates iniciais**: PASS, com a ressalva de rollback de dados do estado novo documentada acima. Nenhuma violação exige dependência ou exceção constitucional.

## Design Decisions

1. **Estado de exploração explícito**: acrescentar ao Local um valor `estado_exploracao` com domínio `conhecido`/`visitado`, default `conhecido`; atualizar contratos de criação, edição e leitura sem adicionar endpoints. O modelo de apresentação continuará permitindo cor personalizada independente do estado.
2. **Compatibilidade dos Locais existentes**: nova revisão Alembic de campanha adiciona o campo e faz backfill: `data_sessao` preenchido → `visitado`; vazio/nulo → `conhecido`. O downgrade remove apenas o campo novo e será documentado como dependente de backup para recuperar estados alterados após upgrade.
3. **Interação de estado**: os controles do editor que identificam Conhecido e Visitado devem selecionar o valor semântico e persistente correspondente. A seleção não deve sobrescrever `data_sessao`; mudança direta da cor deve continuar sendo uma escolha visual independente.
4. **Representações consistentes**: mapa, lista e painel que indiquem se um Local é conhecido ou visitado passam a ler o estado persistido. Os detalhes visuais existentes podem continuar utilizando a cor do pin, sem usá-la como fonte de verdade do estado.
5. **Scroll da tela Sessões**: antes da correção, medir no navegador a região que recebe a rolagem com lista longa em desktop e mobile. Corrigir a área responsável para que a lista completa seja alcançável; preferir o scroll natural da página se não houver contêiner ancestral limitante e usar região rolável explícita se o layout impedir esse comportamento. Não aplicar uma regra global de overflow que afete outras telas.
6. **Validação de navegação**: usar uma campanha descartável com sessões que excedam a altura do viewport. Confirmar que a primeira e a última entrada podem ser alcançadas com wheel/trackpad e teclado no desktop, e com touch no mobile; preservar espaço para a navegação inferior móvel.

## API Contracts (summary)

As rotas atuais permanecem no escopo da campanha; não serão criadas rotas novas.

- `GET /api/c/{slug}/locais` e `GET /api/c/{slug}/admin/locais` incluem `estado_exploracao` na representação do Local.
- `POST /api/c/{slug}/admin/locais` aceita `estado_exploracao` opcional; ausência usa `conhecido`.
- `PUT /api/c/{slug}/admin/locais/{id}` aceita a atualização parcial de `estado_exploracao`; valores fora de `conhecido`/`visitado` são rejeitados sem modificar o Local.
- A mudança de estado não substitui `data_sessao`, `cor_pin` ou demais campos não enviados.
- Listagem e leitura de Sessões não alteram seu contrato; o scroll é comportamento de apresentação.

Detalhes de campos e compatibilidade: [contrato de estado do Local](contracts/local-status.md).

## Project Structure

### Documentation

```text
specs/149-estado-local-scroll-sessoes/
├── plan.md
├── research.md
├── data-model.md
├── contracts/local-status.md
└── quickstart.md
```

### Source Code

```text
backend/
├── app/models/local.py
├── app/schemas/local.py
├── app/routers/admin/locais.py
├── app/routers/public/locais.py
├── alembic_campaign/versions/007_estado_exploracao_local.py
└── tests/
    ├── test_local_status.py
    ├── test_local_status_migration.py
    └── test_local_status_isolation.py

frontend/src/
├── types/index.ts
├── components/admin/LocalFormDialog.tsx
├── components/map/CampaignMap.tsx
├── pages/MapPage.tsx
├── pages/SessoesPage.css
└── locales/{pt-BR,en}/

frontend/e2e/
├── local-status.spec.ts
└── sessoes-scroll.spec.ts
```

**Structure Decision**: manter a divisão existente entre API e interface. Estado do Local modifica o modelo e os schemas de campanha existentes, com migração isolada por campanha; rolagem fica restrita à tela principal de Sessões. Os caminhos finais de testes podem seguir a organização de fixtures Playwright já existente.

## Constitution Check (post-design)

- **I. Isolamento — PASS**: nenhum endpoint novo; campo no SQLite individual da campanha. A cobertura de isolamento é requisito explícito para a leitura e gravação do campo.
- **II. Testes primeiro — PASS**: migração, default, backfill, update/read e isolamento devem ter testes antes da implementação; fluxo visual e scroll cobertos por E2E.
- **III. Produção legada — PASS**: migração executada no ciclo normal da aplicação, sem modificar instalações antigas manualmente.
- **IV. Simplicidade — PASS**: sem dependências novas, mantendo stack atual.
- **V. i18n — PASS**: status e quaisquer mensagens novas em português e inglês; conteúdo textual do mestre não será reescrito nem traduzido.
- **VI. Migrações — PASS COM ROLLBACK DOCUMENTADO**: revisão SQLite batch reversível estruturalmente; backup necessário antes de downgrade para preservar escolhas posteriores à migração.

**Gates finais**: PASS, sob as mesmas condições documentadas para isolamento e downgrade. Sem Complexity Tracking adicional.

## Complexity Tracking

Nenhuma violação constitucional ou dependência adicional foi identificada.
