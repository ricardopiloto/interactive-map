# Quickstart: validar administração de usuários e mesas

## Prerequisites

- Backend dependencies installed with `uv sync --group dev` from `backend/`.
- Frontend dependencies installed with `npm ci` from `frontend/`.
- Test fixtures use isolated temporary control/campaign SQLite databases; destructive cases must never target a developer or production `DATA_DIR`.

## Backend route and data tests

From repository root:

```bash
cd backend
uv run pytest tests/test_admin_console_auth.py tests/test_admin_console_users.py tests/test_admin_console_campaigns.py
```

Expected results: anonymous and non-admin requests are rejected for every `/api/admin` operation; admin list responses contain only allowed metadata; last-admin and owner safeguards hold; deactivate revokes existing sessions; transfer/deletion affect only the selected user/campaign and expected relationships.

## Migration and modification timestamp

```bash
cd backend
uv run pytest tests/test_admin_console_migration.py tests/test_campaign_modified_at.py
```

Expected results: a control DB at revision 006 and campaign DB at revision 005 upgrade to their new heads and downgrade cleanly; new campaigns have creation time; committed campaign writes advance the campaign-local timestamp in the same transaction; settings writes advance the control timestamp; reads, login, rollback, and failed writes do not; legacy unknown dates stay null.

## Frontend build and E2E

```bash
cd frontend
npm run build
npx playwright test e2e/admin-console-users.spec.ts e2e/admin-console-campaigns.spec.ts e2e/admin-console-auth.spec.ts
```

Expected results: admin can search/filter accounts and campaigns, copy invite/reset links, transfer ownership, deactivate/reactivate, and confirm targeted deletion; loading, empty, and error states are clear; non-admin/anonymous users cannot reach data or actions; pt-BR and en copy render correctly.

## Manual safety review

Use a disposable test `DATA_DIR` and verify campaign deletion removes only the confirmed UUID tree while another campaign remains accessible. Verify account deletion leaves campaign records and files intact, and campaign visibility remains distinct from active/inactive state.

## Implementation safety review

Validated using isolated `tmp_path` data: deleting one campaign removes only its UUID directory and registry row while a sibling directory and row remain; invalid paths are rejected; an interrupted staged deletion restores the directory when the registry row still exists. User deletion leaves campaign registry/data untouched. These checks are automated in `backend/tests/test_admin_console_campaign_service.py` and `backend/tests/test_admin_console_user_service.py`.

## Validation results (2026-09-24)

- `DEBUG=false .venv/bin/pytest tests/test_admin_console_user_service.py tests/test_admin_console_campaign_service.py tests/test_admin_console_migration.py tests/test_campaign_modified_at.py -q` — 15 passed.
- `npm run build` — passed.
- The three Playwright suites listed above — 10 passed across desktop and mobile. The E2E seed uses a disposable campaign per browser project so destructive cases remain isolated.
- `tests/test_admin_console_auth.py`, `tests/test_admin_console_users.py`, and `tests/test_admin_console_campaigns.py` were attempted with a 60-second limit but did not complete because the local `TestClient` request hangs in this environment. Their authenticated/unauthenticated HTTP flows are covered by the passing E2Es; T031 remains open until these backend route tests run successfully.
