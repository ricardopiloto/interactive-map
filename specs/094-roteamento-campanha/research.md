# Research: Roteamento por campanha

**Feature**: `094-roteamento-campanha`  
**Date**: 2026-09-19

## 1. Prefixo HTTP da API

**Decision**: Montar conteúdo público em `/api/c/{slug}/…` e admin em `/api/c/{slug}/admin/…` (incl. `/session`, uploads POST). Health permanece `/api/health` (fora do prefixo). OpenAPI/docs (se `DEBUG`) reflectem os novos paths.

Implementação: alterar `APIRouter(prefix=…)` em `public/__init__.py` e `admin/__init__.py` para incluir `{slug}`; `get_session` recebe `slug: str` via `Path` (ou Depends partilhado no router pai). Handlers filhos **não** reescrevem consultas — só a origem do slug muda (URL vs env).

Caminhos antigos (`/api/locais`, `/api/admin/…`, `/api/config`, …) **deixam de ser registados** → 404 do framework (clarificação: 404 sem redirect). Não manter stubs com corpo custom salvo se os testes de caracterização o exigirem para código de erro; o mínimo é 404.

**Rationale**: Spec FR-001/001a; brief fase 094.

**Alternatives considered**: Redirect 307 para path com slug — rejeitado (clarify A). Duplicar routers antigos + novos — rejeitado (dois contratos). Middleware que injeta slug do env — rejeitado (clarify: HTTP só URL).

## 2. Erros opacos (inactivo = desconhecido)

**Decision**: Em resolução HTTP, slug inexistente **e** `activa=false` levantam o **mesmo** erro estruturado `CAMPANHA_NAO_ENCONTRADA` (HTTP 404). Não expor `CAMPANHA_INACTIVA` nem `CAMPAIGN_SLUG_AUSENTE` em pedidos sob `/api/c/{slug}/…` (slug ausente no path = 404 de routing). CLI/testes internos MAY continuar a distinguir inactivo se útil; a superfície HTTP pública/admin por slug é opaca.

**Rationale**: Clarificação Q5.

**Alternatives considered**: Códigos distintos no body — rejeitado. 403 para inactivo — rejeitado.

## 3. `CAMPAIGN_SLUG` e `get_session`

**Decision**: `get_session` / resolve de uploads para **pedidos HTTP** usam **só** o `{slug}` do path. `settings.campaign_slug` deixa de alimentar Depends HTTP. A variável permanece opcional para `seed`, scripts e eventualmente CLI helpers que não passam `--slug`; **nunca** como fallback se o path tiver (ou deveria ter) slug.

Harness 092+: criar campanha de teste; pedidos usam `/api/c/{slug_teste}/…` — sem depender de env para o TestClient.

**Rationale**: Clarificação Q4; assume 093.

**Alternatives considered**: Env como fallback — rejeitado. Remover setting por completo nesta fase — desnecessário (ainda útil a scripts).

## 4. Uploads sob slug

**Decision**: Servir ficheiros em `/uploads/c/{slug}/<relative>` a partir de `{DATA_DIR}/{caminho}/uploads/` da Campanha resolvida (mesma pasta 093). Implementação: montagem/`StaticFiles` custom ou route que valida slug (opaco 404 se mau) e faz lookup sem path traversal. POST admin `/api/c/{slug}/admin/uploads` grava nessa pasta e **devolve URL** já com `/uploads/c/{slug}/…`.

Path global `/uploads/…` (sem `c/{slug}`) **não** serve conteúdo de campanha → 404 (desmontar o mount antigo ou substituir por handler 404).

Sem ACL por `visivel_para_todos`, sem cota (096).

**Rationale**: Clarificação Q3; constituição I para mídia nesta fase.

**Alternatives considered**: Manter `/uploads` global — rejeitado (mistura imagens). Meter estáticos sob `/api/c/{slug}/files/…` — rejeitado (quebra clientes que esperam URL de imagem simples; path `/uploads/c/…` é suficiente).

## 5. Frontend: rotas e API

**Decision**:

| Path FE | Comportamento |
|---------|----------------|
| `/c/:slug` | MapPage (slug de `useParams`) |
| `/c/:slug/relacoes` | RelacoesPage |
| `/`, `/relacoes` | Página «não encontrado» / peça link com slug (i18n); sem fetch de mesa |
| slug inválido / API 404 config | Mesmo ecrã de campanha indisponível |

Cliente API: funções `apiPath(slug, resource)` → `/api/c/${slug}/…`; admin idem sob `/admin/…`. `VITE_API_BASE` continua host-only. Map image: preferir URL da config/resposta; default ` /uploads/c/${slug}/map/campaign-map.webp` (ou `mapa_arquivo` da Campanha quando preenchido) — **não** `VITE_MAP_URL` global como fonte única multi-mesa.

Config cache: `Map<slug, InstanceConfig>` (+ inflight por slug); `clear`/`markHasMap` keyados por slug.

Links internos mapa ↔ relações: preservar slug.

**Rationale**: FR-005/005a/009a; US1/US4.

**Alternatives considered**: Redirect `/` → env slug — rejeitado (clarify). Manter rotas antigas a funcionar — rejeitado.

## 6. Matriz de testes

**Decision** (TDD — falhar antes):

1. Adaptar todos os testes 092: prefixo `/api/c/{slug}/` (+ admin).
2. Isolamento HTTP: A tem local/ficheiro; GET público e admin autenticado em B → ausente; GET `/uploads/c/B/...` de ficheiro só em A → 404.
3. `so_link` activa → 200 em config/conteúdo.
4. `activa=false` e slug inexistente → mesmo status + mesmo código `CAMPANHA_NAO_ENCONTRADA`.
5. `/api/locais` (sem slug) → 404.
6. Regressão: 0 falhas na suíte após adaptação.

**Rationale**: FR-007/008; SC-001–004; princípio II.

## 7. i18n e docs

**Decision**: Chaves novas em `pt-BR` e `en` para ecrã sem slug / campanha não encontrada. README backend: exemplos `/api/c/{slug}/…` e uploads; mencionar que `CAMPAIGN_SLUG` não drive HTTP. CHANGELOG `[Unreleased]` Added — sem bump 0.19.2.

**Rationale**: Constituição V; notes da spec.
