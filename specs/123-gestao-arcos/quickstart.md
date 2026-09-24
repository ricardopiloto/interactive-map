# Quickstart: Gestão de arcos

Run from the repository root. Use disposable test campaigns only.

## Prerequisites

- Backend development environment and test dependencies installed.
- Node dependencies installed in `frontend` and `frontend-next`.
- A campaign test fixture with one master, one player, at least two Arcos and several Locals (including a Local assigned to an Arco).
- Product and prototype run locally; no production credentials or data.

## Validate authorization and data behavior

1. Before UI work, run the focused backend tests for admin authorization, Arco visibility and campaign isolation.
2. As an anonymous client, attempt an Arco write and confirm it is denied.
3. As a member of campaign A, create/edit/delete an Arco in A and verify a same-ID Arco in campaign B is unchanged.
4. Hide an Arco. Confirm it remains in the master list, disappears from the public Arco list/detail, and its ID is redacted from public Local results while public Locals remain visible.
5. Delete an Arco with assigned Locals after confirming. Verify Locals remain and have no Arco association. Cancel another deletion and verify no changes.
6. Save a Local with `arco_id` set to null and verify it remains unassigned; attempt to associate it with a nonexistent Arco ID and verify the request is rejected without changing the Local.

Backend tests are run from `backend` using the project environment, e.g. `uv run pytest tests/test_visibility_local_arco.py tests/test_admin_auth.py` plus the Arco isolation cases established during implementation.

## Validate the product flow

1. Run the frontend and API using the existing development commands and log in as the seeded master.
2. Open the campaign map and open master tools; enter Arc management.
3. Create an Arc, edit its title/summary, change visibility and order, and verify the ordered list updates.
4. Assign and unassign a Local through its existing editor, including “Sem arco”; confirm the Arc list and Local list/detail reflect the relationship.
5. Delete an Arc with Locals. Verify the confirmation explains that Locals remain unassigned; cancel once, then confirm in a separate attempt.
6. Repeat the UI flow in player mode and confirm that management controls are absent.
7. Switch locale to pt-BR and en. Check labels, empty state, validation, delete warning and errors in both languages.

## Validate the prototype and parity

1. Run the `frontend-next` prototype and select master mode for a campaign.
2. Open the equivalent map tools and exercise list/create/edit/order/visibility/delete states against mock data. Assign a Local to an Arco, then choose “Sem arco” and confirm the relationship clears.
3. Compare the overall map-context hierarchy and responsive behavior with the product. The prototype is the design reference; mock content may differ.
4. Build both frontend packages and run the relevant Playwright/a11y checks after the design is wired.

## Expected results

- Master can manage Arcos without leaving the map context; player mode exposes no management actions.
- Arco changes persist in the product and in the correct campaign only.
- Hidden Arcos and associations follow existing public redaction rules.
- Delete preserves associated Locals and clears their association only after confirmation.
- Prototype and product present equivalent interactions, and all new UI copy is present in pt-BR/en.
- No API contract, migration or dependency is added unless implementation discovers a documented necessity.
