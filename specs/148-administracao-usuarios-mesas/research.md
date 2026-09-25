# Research: Administração de usuários e mesas

**Feature**: [148-administracao-usuarios-mesas](spec.md)

## Decisions

### 1. Expand the application-admin router

**Decision**: add global account and campaign administration endpoints to `backend/app/routers/administrador.py`, preserving its router-level `Depends(require_admin)` and existing invite endpoint.

**Rationale**: `require_admin` is already app-scoped and returns 401 for anonymous requests and 403 for authenticated non-admins. `backend/app/main.py` already mounts the router. Campaign-scoped `/api/c/{slug}/admin/*` is for campaign owners and is not the appropriate authorization boundary for a global console.

**Alternatives considered**: reuse campaign-admin routers; rejected because application admins need cross-campaign metadata independent of campaign membership. Add a second global router; unnecessary because the existing router has exactly this boundary.

### 2. Keep administrative responses to allow-listed metadata

**Decision**: use dedicated Pydantic response schemas. User responses include email, account state, admin flag, creation date, and owned campaign summaries; campaign responses include name, slug, system, owner, active state, visibility, and timestamps. Never serialize ORM rows wholesale or return campaign content, passwords, token hashes, sessions, or login lockout data.

**Rationale**: `control.db` contains the needed registry and account metadata, while narrative data is in each campaign database. Avoid opening campaign databases for list views.

**Alternatives considered**: load data from each campaign DB for richer dashboards; rejected because the spec explicitly excludes narrative and this would add cross-database reads and failure modes.

### 3. Derive account state from existing auth fields

**Decision**: `senha_hash is None` means pending activation; otherwise `activo=True` means active and `activo=False` means inactive. Reuse `create_usuario_with_invite`, `reset_usuario`, `issue_invite`, and the existing accept/reset flows. The dashboard displays raw one-use links only after successful creation.

**Rationale**: these services already normalize emails, store only token hashes, enforce the 72-hour one-use flow, and keep password entry with the account owner. `activo` alone cannot distinguish pending from deactivated.

**Alternatives considered**: introduce a new status column or admin-set password; rejected because existing fields encode all required states and the spec forbids an admin password view/set surface.

### 4. Protect ownership and the final active administrator

**Decision**: block user deactivation/deletion if the user owns any campaign until ownership is transferred to an active user or the campaign is separately deleted. Expose an atomic ownership-transfer operation. Block deactivation/deletion of the last active administrator. On eligible hard deletion, explicitly remove the user's invites, sessions, member links, login-lockout row, and user row in one control-DB transaction.

**Rationale**: ownership is `Membro.papel == 'dono'`; FKs lack `ON DELETE CASCADE`, and current SQLite setup does not enable FK enforcement. Existing `assign_owner` commits intermediate operations and cannot be reused as an atomic transfer as-is. Session lookup checks both revocation and `Usuario.activo`.

**Alternatives considered**: rely on FK cascades; rejected because migration declarations omit cascades and FK enforcement is not enabled. Delete owned campaign data with the user; rejected by FR-009 and could remove other members' content.

### 5. Make campaign deactivation reversible and permanent deletion targeted

**Decision**: use existing `Campanha.activa` for soft deactivation/reactivation. Permanent deletion requires confirmation in the UI, sets the row inactive before cleanup, disposes its cached engine, confines the resolved `caminho` beneath `DATA_DIR/campanhas`, stages only that campaign tree for deletion, then removes its memberships and registry row. Make cleanup retryable if filesystem or DB cleanup fails; never infer a path from user-supplied slug or accept a path from the request.

**Rationale**: campaign contents/uploads are a UUID-named tree separate from `control.db`. Deleting only the registry row would orphan files; deleting the wrong path could destroy unrelated data. Deactivation already makes `lookup_campanha` return 404 and is reversible.

**Alternatives considered**: permanent delete by deleting only the control row; rejected because files remain orphaned. Cascade-delete the data when deleting a user; rejected due cross-member data loss. Use deactivation as the only campaign deletion; rejected because FR-017 requires permanent deletion.

### 6. Record campaign creation and modification dates without treating reads as writes

**Decision**: add nullable `criado_em` and `modificado_em` fields to `Campanha` in a new control Alembic revision, plus a singleton `campaign_state` table with nullable `modificado_em` in a new campaign Alembic revision. New campaign creation paths write `criado_em`; old rows remain `NULL` because their actual creation dates cannot be recovered reliably. A campaign-session `before_flush` hook updates `campaign_state.modificado_em` inside the same SQLite transaction as ORM changes; control-DB campaign-setting services update `Campanha.modificado_em` directly. The API's effective value is the maximum known value among content modifications, registry/settings modifications, and creation time, otherwise `null`.

**Rationale**: a `Campanha` row has no timestamps today, while content lives in per-campaign DBs and writes are distributed across many routes/services. A field in `control.db` updated after content commit would not be atomic with that write. A per-campaign state row updated in `before_flush` is committed or rolled back with changed content; a separate control timestamp captures settings. Admin list reads only this operational row from each matched campaign DB, not narrative entities. Legacy timestamps must not be fabricated from migration/deploy time.

**Alternatives considered**: use SQLite file mtime; rejected because copies, migrations, and deployment can alter it independently of content edits. Update timestamp only in the admin router; rejected because ordinary campaign content changes would be missed. Update `control.db` after a campaign commit; rejected because the two SQLite transactions cannot be atomic. Backfill legacy with migration time; rejected as false history.

### 7. Use the existing frontend shell and translation setup

**Decision**: build `/admin` using `SiteChrome`, existing UI dialogs/buttons, the authenticated global API helpers, and both `comum.json` locales; update the admin entry in `UserMenu`. Keep `/admin/convites` working as a compatibility route and point its invite flow into the same API behavior.

**Rationale**: `AdminConvitesPage` already implements page-level `authApi.me()` checks, anonymous/non-admin redirects, and the copy-link pattern. `UserMenu` already conditionally exposes admin navigation.

**Alternatives considered**: campaign-scoped admin page; rejected because it would require choosing a campaign and use the wrong authorization semantics. New UI framework; no need and conflicts with simplicity.

## Repository Evidence

- `backend/app/routers/administrador.py`: only existing `/api/admin` operation is `POST /convites`; router-level admin dependency already applies.
- `backend/app/services/auth_admin.py` and `auth_invite.py`: invite and reset services; `reset_usuario` only permits active accounts.
- `backend/app/models/usuario.py`: user, member, invite, session, and login-lockout models; no cascading FKs.
- `backend/app/models/campanha.py`: global campaign registry with `activa`, visibility, owner data via `Membro`, and no dates.
- `backend/app/campaign_db.py`: campaign content DB path, engine cache/disposal, inactive lookup behavior, Alembic upgrade.
- `backend/app/services/campanha_admin.py`: creation, data-tree setup, active filtering, campaign settings changes.
- `backend/alembic_control/versions/001_control.py` through `006_usuario_is_admin.py`: control schema history and SQLite batch migrations.
- `frontend/src/pages/AdminConvitesPage.tsx`, `frontend/src/App.tsx`, `frontend/src/components/layout/UserMenu.tsx`: existing page, route, and menu patterns.
- `backend/tests/test_admin_convites_route_matrix.py`, `test_admin_auth_matrix.py`, `test_auth_session.py`, `test_auth_reset.py`, and campaign HTTP tests: existing auth/session/route test conventions.

## Remaining Risks Handed to Implementation

- Ensure the campaign-session mutation hook handles multiple commits, rollbacks, and session lifetimes without recursively touching a campaign session.
- Make the two-step filesystem/control-DB deletion idempotent and safely retryable; test that sibling campaign trees are untouched.
- Maintain the existing invite route and response contract while integrating the new console.
- Keep global-admin access checks server-side for every new endpoint; the frontend check is only navigation/UX.
