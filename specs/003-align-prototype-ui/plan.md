# Implementation Plan: Alinhamento total com o protótipo

**Branch**: `003-align-prototype-ui` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-align-prototype-ui/spec.md` (clarificações 2026-08-01).

## Summary

Alinhar a SPA ao protótipo Nocturne (`prototype/Mapa da Campanha.dc.html` + `prototype/nocturne.css`) em cores, componentes, mapa (pins/grupo/zoom), modal de pin, mobile e **Modo GM in-page** (canto → dialog de senha sem dica → mesma tela). Inclui slots visuais de mídia (mapa, local, NPC), persistência do formato do grupo (`bandeira` | `brasão`), e autenticação admin fail-closed na API (Basic Auth) alimentando o gate da UI — sem shell `/admin` separado como jornada principal.

## Technical Context

**Language/Version**: TypeScript (frontend, Node 22+), Python 3.12+ (backend)

**Primary Dependencies**: React 19, Vite 8, React Router, `react-zoom-pan-pinch`; FastAPI, SQLModel, Pydantic Settings, uvicorn, python-multipart; HTTP Basic Auth (Starlette) para `/api/admin/*`

**Storage**: SQLite; uploads em `uploads/map|locals|portraits`; novo campo `formato` em `grupo_posicao`

**Testing**: Validação manual via [quickstart.md](./quickstart.md) (side-by-side com protótipo); smoke de auth 401; opcional pytest no schema/auth

**Target Platform**: Self-hosted Linux (Docker) + browsers modernos; `mapa.1nodado.com.br`

**Project Type**: Web application (SPA + API)

**Performance Goals**: Inalterados vs 001 (mapa fluido; sem sync ao vivo)

**Constraints**:
- Fonte de verdade UI: `prototype/` (fidelidade visual/comportamental, não o runtime `.dc.html`)
- Modo GM **in-page**; `/admin` não é a jornada alvo (redirect/abre gate na tela principal)
- Gate de senha **sem** revelar credencial; API admin sempre autenticada (fail closed)
- Feature 002 preservada (placeholder do mapa só se imagem ausente/falhou)
- Sem sync ao vivo; produção sem seed narrativo obrigatório

**Scale/Scope**: 1 campanha, 1 GM; remodelagem de shell UI + delta de modelo no grupo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution ainda é placeholder. Gates informais do projeto:

| Gate | Status |
|------|--------|
| Separação leitura pública vs escrita admin | PASS |
| Admin exige senha (UI + API); gate sem dica de senha | PASS |
| UI alinhada ao protótipo Nocturne | PASS (objetivo desta feature) |
| Modo GM in-page (não shell admin como jornada principal) | PASS |
| Sem sync ao vivo / polling | PASS |
| Self-hosted Docker, non-root | PASS |

**Post-design re-check**: PASS — contratos documentam `formato` do grupo + Basic Auth; data-model e UI contracts refletem clarificações; sem violação que exija Complexity Tracking além do já justificado (auth API + UI).

## Project Structure

### Documentation (this feature)

```text
specs/003-align-prototype-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi-delta.md
│   └── ui-parity.md
└── tasks.md                 # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
prototype/
├── Mapa da Campanha.dc.html   # referência UX
└── nocturne.css               # tokens + classes DS

frontend/src/
├── styles/
│   ├── nocturne.css           # port de tokens + .btn/.card/.seg/.dialog/.tag/.input
│   └── global.css             # layout app; consome tokens
├── components/
│   ├── map/CampaignMap.*      # pins gota, grupo bandeira/brasão, slot mapa GM, zoom chrome
│   ├── media/ImageSlot.*      # slot visual drag/choose (novo)
│   ├── common/PinModal.*      # dialog leitura pin (substitui LocalPanel flutuante)
│   ├── gm/                    # gate dialog, badge, listas/forms admin in-page
│   └── sidebar/SideMenu.*     # seg, cards, mobile overlay
├── pages/MapPage.tsx          # shell único jogador + Modo GM
├── pages/AdminPage.tsx        # deprecar: redirect para / + gate (ou remover rota)
├── api/admin.ts               # Basic Auth header
└── App.tsx                    # rota / principal; /admin → redirect

backend/app/
├── config.py                  # ADMIN_USER, ADMIN_PASSWORD
├── deps/auth.py               # verify_admin (novo)
├── models/grupo.py            # + formato
├── schemas/grupo.py           # + formato
└── routers/admin|public/grupo.py
```

**Structure Decision**: Monorepo existente; unificar experiência em `MapPage` (shell Codex); portar Nocturne para `frontend/src/styles/nocturne.css`; delta backend mínimo (`formato` + Basic Auth se ainda ausente).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Auth na API **e** gate na UI | Spec exige senha; fail closed em localhost | Só Caddy — abre admin em dev |
| Shell in-page vs rota `/admin` | Clarificação Q1 = mesma tela do protótipo | Manter `/admin` separado — falha aceite de paridade |
| Campo `formato` persistido | Clarificação Q5 = GM escolhe bandeira/brasão | Só prop de UI — jogadores não veriam a escolha após reload |
