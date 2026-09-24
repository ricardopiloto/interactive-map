# Implementation Plan: Alinhamento da Linha do Tempo ao protótipo

**Branch**: `144-alinhamento-prototipo-timeline` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/144-alinhamento-prototipo-timeline/spec.md`

## Summary

Alinhar a página de Linha do Tempo ao comportamento por papel ilustrado em `tmp/timeline.html`, reutilizando a implementação de Evento da spec 141. A mudança fica no frontend: subtítulos localizados, cards expansíveis para mestre e totalmente abertos para jogador, resumo da sessão vinculada quando permitida, lembrete final na visão do jogador e preservação do mês ao editar eventos antigos sem mostrá-lo. A identidade visual permanece a da aplicação por meio de `CodexHeader`, `FormDrawer`, controles compartilhados e tokens existentes. O nome da sessão será resolvido pela lista pública existente, que já omite sessões ocultas.

## Technical Context

**Language/Version**: TypeScript, React 19, Vite; backend Python 3.12+ existente, sem alteração planejada.

**Primary Dependencies**: Dependências existentes: React Router, i18next, componentes compartilhados de UI e formulários. Nenhuma dependência nova.

**Storage**: SQLite por campanha existente; nenhum campo, entidade ou migração nova. Manter `mes` persistido em eventos já cadastrados.

**Testing**: Playwright E2E para os fluxos por papel, privacidade da sessão, associação, localização e viewport/tema. Testes backend atuais de eventos/sessões permanecem como cobertura dos contratos e isolamento existentes; ampliar somente se a validação identificar regressão no serviço existente.

**Target Platform**: Aplicação web na rota existente `/c/:slug/linha-do-tempo`, nos temas e larguras já suportados.

**Project Type**: Aplicação web full-stack existente; implementação desta feature concentrada em `frontend/`.

**Performance Goals**: Sem novo orçamento de performance; carregar a lista de eventos e as sessões visíveis usando os endpoints existentes dentro do fluxo atual da página.

**Constraints**: Não adicionar rotas, alterar schema/API, introduzir migrações ou dependências; não exibir mês; preservar o valor de mês já persistido ao editar; sessão oculta não pode ser identificada por jogadores; nova copy em pt-BR e en; controles devem usar tokens e componentes da aplicação.

**Scale/Scope**: Uma página e seus textos/local styles; nenhuma mudança no CRUD, modelo de domínio ou fluxo de autorização já entregue pela spec 141.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: PASS — nenhuma rota nova ou consulta entre campanhas. Usar somente APIs existentes com slug da campanha; executar cobertura E2E com sessões/eventos de campanhas distintas ou manter os testes atuais de isolamento como gate de regressão.
- **II. Testes primeiro**: PASS — adicionar/ajustar cenários E2E antes da mudança de UI, incluindo que uma sessão oculta não seja revelada ao jogador. Não há autenticação, autorização, migração ou import/export novos.
- **III. Produção legada**: PASS — a mudança limita-se à aplicação Codex no repositório; não depende de alteração de instâncias legadas.
- **IV. Simplicidade**: PASS — reutilizar APIs, componentes, dependências e estilos existentes; sem nova dependência.
- **V. i18n**: PASS — subtítulos e lembrete de eventos ainda não revelados em pt-BR e en; conteúdo cadastrado pelo mestre continua sem tradução.
- **VI. Migrações**: PASS / N/A — nenhum schema é alterado; valores `mes` existentes são preservados.

**Post-design re-check**: PASS — desenho confirma mudança somente na página/i18n; nenhuma rota, migração ou dependência nova. Privacidade da sessão é garantida pelo catálogo público existente, que lista somente sessões visíveis.

## Project Structure

### Documentation (this feature)

```text
specs/144-alinhamento-prototipo-timeline/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── timeline-ui.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── pages/LinhaTempoPage.tsx             # apresentação por papel, sessão e expansão
├── pages/LinhaTempoPage.css             # composição responsiva com tokens existentes
├── locales/pt-BR/linhaTempo.json        # copy de subtítulos e lembrete
├── locales/en/linhaTempo.json           # traduções correspondentes
├── api/campaign.ts                      # reutilizar listSessoes/listEventos
└── api/admin.ts                         # reutilizar listSessoesAdmin/listEventosAdmin

frontend/e2e/
└── timeline-flows.spec.ts               # cobertura de leitura, privacidade e papel
```

**Structure Decision**: Alterar somente a página e recursos de localização da feature, adicionando cobertura E2E no padrão do projeto. Reutilizar APIs públicas/admin já existentes. Não alterar `backend/`, esquema SQLite, rotas, nav, APIs de CRUD, ou tokens globais.

## Complexity Tracking

Nenhuma violação.
