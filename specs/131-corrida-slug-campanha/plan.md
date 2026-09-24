# Implementation Plan: Corrigir travamento ao entrar numa campanha vindo de fora

**Branch**: `131-corrida-slug-campanha` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/131-corrida-slug-campanha/spec.md`

## Summary

`MapPage` busca a rede de rotas (waypoints) no seu próprio efeito de montagem, através de `campaignApi.listWaypoints()`, que resolve o slug da campanha a partir de um estado de módulo (`activeSlug` em `campaignSlug.ts`) escrito por `CampaignShell` — o componente pai — no próprio efeito de montagem. Como o React executa efeitos de componentes filhos antes dos efeitos do pai no mesmo commit, numa navegação vinda de fora da campanha (`CampaignShell` e `MapPage` montando juntos) o efeito do `MapPage` roda antes do slug estar definido, lançando `CAMPAIGN_SLUG_REQUIRED` de forma síncrona e não tratada. Sem `ErrorBoundary` na aplicação, isso derruba a árvore de componentes montada, travando a tela. A correção: `MapPage` já tem o slug disponível via `useParams()`; passar esse valor explicitamente para `campaignApi.listWaypoints` elimina a dependência do estado de módulo para essa chamada específica — mas isso exige encadear um `slug?` opcional por três pontos (`campaignApiPrefix` já aceita, o helper interno `p()` de `campaign.ts` e `listWaypoints` em si ainda não repassam; ver `contracts/list-waypoints.md` pra a correção exata, achada só ao reconferir o código durante o planejamento).

## Technical Context

**Language/Version**: TypeScript/React 19 + Vite 8

**Primary Dependencies**: Nenhuma nova — reaproveita `campaignApi`/`campaignApiPrefix` já existentes

**Storage**: N/A

**Testing**: Verificação manual (quickstart) dos três caminhos de entrada; teste de regressão leve opcional na função de API do cliente

**Target Platform**: Frontend web, todas as telas de campanha (Mapa é o caso afetado; Relações/Rota não chamam `listWaypoints` no mount)

**Project Type**: Frontend web application

**Performance Goals**: N/A — mesma quantidade de chamadas de rede, só corrige qual slug é usado

**Constraints**: Não alterar o contrato de `campaignApi.listWaypoints` de forma incompatível (o parâmetro `slug?` já existe e é opcional); não introduzir `ErrorBoundary` nesta mudança (fora de escopo, ver spec)

**Scale/Scope**: Um componente (`MapPage.tsx`), uma chamada de efeito; nenhuma mudança de schema, rota ou dependência

## Constitution Check

- **I. Isolamento**: PASS / N/A. Não adiciona rota nem acessa dado de outra campanha.
- **II. Testes primeiro**: PASS. Correção de UI/carregamento, não é rota de auth/permissão/migração/import — validação por quickstart é suficiente; teste de regressão leve é recomendado, não bloqueante.
- **III. Produção legada**: PASS / N/A. Sem mudança em instâncias `/opt`.
- **IV. Simplicidade**: PASS. Reaproveita parâmetro já existente; zero dependência nova.
- **V. i18n**: PASS / N/A. Nenhuma copy nova.
- **VI. Migrações**: PASS / N/A. Sem mudança de schema.

## Project Structure

### Documentation (this feature)

```text
specs/131-corrida-slug-campanha/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── list-waypoints.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
├── pages/MapPage.tsx            # Efeito de montagem que chama listWaypoints — ponto da correção
├── api/campaign.ts              # campaignApi.listWaypoints — já aceita slug? opcional
├── api/campaignSlug.ts          # campaignApiPrefix(slug?)/requireCampaignSlug() — não muda
└── App.tsx                      # CampaignShell — contexto da corrida, não precisa mudar
```

**Structure Decision**: Três mudanças pequenas e encadeadas — `campaign.ts` (`p()` e `listWaypoints` ganham `slug?` opcional, aditivo, sem quebrar call sites existentes) e `MapPage.tsx` (passa o `slug` de `useParams()` explicitamente). `campaignApiPrefix`/`campaignSlug.ts` não mudam — já aceitam o parâmetro, só não estavam sendo alimentados.

## Complexity Tracking

Sem violação de constituição nem dependência nova.
