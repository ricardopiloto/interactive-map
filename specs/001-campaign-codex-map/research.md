# Research: 001-campaign-codex-map

## 1. Stack monorepo vs SPA+JSON estático

**Decision**: Manter FastAPI + SQLite + React SPA (scaffold + PRD).

**Rationale**: Painel GM com CRUD e uploads precisa de validação e persistência; OpenAPI facilita futura integração Eber-Saltbock; mesmo padrão Python/Docker do ambiente do autor.

**Alternatives considered**:
- SPA + JSON editado à mão — mais simples, mas contradiz meta de <2 min e uploads/imagens.
- Backend Node único — possível, mas PRD e scaffold já fixam Python/FastAPI.

## 2. Autenticação do GM *(amendment 2026-08-01)*

**Decision**: **Defense in depth** — HTTP Basic Auth **obrigatório na API** (`/api/admin/*`) em todos os ambientes + Basic Auth no Caddy em produção para `/admin*` e escritas. A UI `/admin` exige credencial válida antes de expor o shell de edição (gate mínimo usuário/senha alinhado ao desafio Basic; sem contas multi-usuário).

**Rationale**: Clarificação Q4 original (“só na borda”) deixava localhost sem Caddy com admin aberto — **rejeitado** pelo requisito explícito de não deixar a rota aberta. Fail closed: sem `ADMIN_USER`/`ADMIN_PASSWORD`, rotas admin respondem 503/401 e a UI não libera o CRUD.

**Alternatives considered**:
- Só Caddy — insuficiente em `npm run dev` / API direta.
- Só dialog in-app sem validação no servidor — inseguro (bypass via curl).
- JWT/sessão — overkill para 1 GM.
- Dialog do protótipo como única barreira — rejeitado; senha deve valer na API.

## 3. Zoom/pan do mapa

**Decision**: `react-zoom-pan-pinch` no frontend; coordenadas de pin/grupo em fração 0–1 sobre a imagem.

**Rationale**: Já no scaffold; atende desktop wheel + pinch mobile; evita canvas custom no MVP.

**Alternatives considered**:
- Leaflet com CRS simple — útil, mas overhead para uma imagem única.
- Canvas/WebGL próprio — custo alto sem necessidade.

## 4. Campo “data da sessão”

**Decision**: Campo string livre (`data_sessao` / rótulo); ordenação de locais **dentro de um arco** por `id` crescente (ordem de cadastro). Arcos ordenados por `ordem`, depois `id`.

**Rationale**: Clarificação Q2; protótipo usa “Sessão 3”.

**Alternatives considered**:
- `date` calendar — rejeitado.
- Dois campos (rótulo + date) — rejeitado na clarify.

**Gap no scaffold**: modelo atual tipa `data_sessao` como `date` — migrar para `str | null` na implementação. *(Resolvido na implementação anterior.)*

## 5. Visibilidade de updates

**Decision**: Sem WebSocket/SSE/polling; jogadores veem estado no load/reload.

**Rationale**: Clarificação Q1; fora de escopo PRD.

## 6. Reposicionamento de pins

**Decision**: Modo “clique no mapa” na criação **e** na edição de local (igual mover grupo); não usar drag contínuo de pin no MVP.

**Rationale**: Clarificação Q3; consistente com protótipo de posicionamento.

## 7. Seed de dados

**Decision**: Produção vazia (só `GrupoPosicao` default 0.5/0.5 + placeholder de mapa). Script/fixture só para dev/teste.

**Rationale**: Clarificação Q5.

## 8. Uploads e serving de imagens

**Decision**: Upload via `POST /api/admin/uploads` (multipart); arquivos em volume; servir em `GET /uploads/...` pela API. Validar MIME allowlist + tamanho máx. Mapa canônico: `campaign-map.<ext>`.

**Rationale**: PRD §10.

## 9. Testes

**Decision**: Validação E2E manual (quickstart); smoke de 401 sem Basic Auth nas rotas admin.

**Rationale**: Volume baixo.

## 10. UI admin vs mapa unificado

**Decision**: Rota `/` = visão jogador; rota `/admin` = UI GM (mapa + abas + forms), atrás de credencial.

**Rationale**: PRD `/admin` separado.

## 11. Paleta e tokens visuais *(amendment 2026-08-01)*

**Decision**: Adotar tokens **Nocturne** de `prototype/nocturne.css` como fonte de verdade da UI:

| Token | Valor |
|-------|--------|
| `--color-bg` | `#161826` |
| `--color-surface` | `#232532` |
| `--color-text` | `#e9e9ed` |
| `--color-accent` | `#9184d9` |
| `--color-accent-2` | `#a7a1db` |
| `--color-divider` | mix texto 16% |
| Neutrals / accent ramps | conforme nocturne |
| `--font-body` / heading | Inter (ou equivalente self-hosted se CDN for indesejada) |

Substituir a paleta âmbar/marrom (`#0f0c0a`, `#f0d060`, `#c9a227`, etc.) nos CSS de `frontend/src/`.

**Rationale**: Pedido explícito de adequação ao protótipo; Nocturne já é o DS do protótipo.

**Alternatives considered**:
- Manter tema “pergaminho/âmbar” — rejeitado.
- Importar `nocturne.css` inteiro com todas as classes de componente — pesado; preferir tokens + mapear componentes existentes.
- CDN Google Fonts obrigatória — evitar se política self-hosted; usar Inter empacotada ou system stack com métricas próximas.
