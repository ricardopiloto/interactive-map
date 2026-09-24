# Quickstart: Crônica de sessões

**Feature**: `112-cronica-sessoes`

## Prerequisites

- Backend + frontend running; campaign with map/relacoes seed optional for chips.

## 1. Schema

```bash
cd backend
# open any campaign — ensure_campaign_schema upgrades to head including 002_sessao
uv run pytest tests/test_sessoes_isolation.py tests/test_sessoes_visibility.py tests/test_sessoes_crud.py -q
```

**Expect**: green.

## 2. Public list

1. As GM (edit mode): create sessions 1 (visible), 2 (visible), 3 (hidden).
2. Logout / anonymous: open `/c/{slug}/sessoes`.
3. **Expect**: 2 then 1; no 3; empty state if none.

## 3. Chips

1. Session linked to a local and a visible NPC.
2. Click local chip → map with that local selected (`?local=`).
3. Click personagem chip → relações with selection (`?personagem=`).
4. Hidden NPC linked → chip absent for anonymous.

## 4. CRUD + number

1. With max numero 4, open create → suggested 5.
2. Save duplicate 5 twice → second fails with clear error.
3. Toggle visibility → public list updates.
4. Delete with confirm → gone.

## 5. Nav + i18n

1. Chrome shows Sessões (desktop + mobile bottom).
2. Switch language → chrome/empty/actions translated; titles stay as authored.

## 6. Isolation

```bash
uv run pytest tests/test_sessoes_isolation.py -q
```

**Expect**: session of A never in B responses.
