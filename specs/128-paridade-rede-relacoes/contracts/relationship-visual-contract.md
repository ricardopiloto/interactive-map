# Relationship Graph Visual and Privacy Contract

## Page and interaction structure

- Preserve the branch's shared floating `MapSidePanel` and its mobile collapsed/expanded behavior.
- Search, type/status filters, isolation, list selection, graph selection, details and GM CRUD remain available and synchronized as they are today.
- Preserve the radial overview and focus layout. Only adjust graph viewport origin/fit when a repeatable case shows essential nodes hidden behind the panel.
- Do not restore the fixed left column or separate detail panel from the former page structure.

## Privacy contract

- GM mode may render the full administrative graph and must visibly distinguish a private pair from a player-visible pair without requiring the edit form.
- In two-way pairs, GM mode must identify each player-unknown direction next to the correct endpoint, and continue to show its type, qualifier and note to the GM.
- Player mode consumes the existing public projection only. The server must omit private pairs and pairs involving hidden characters, and redact unknown directional types, qualifiers and notes.
- Player mode must not show a lock/secret badge, unknown-direction marker, private-line pattern, secret label, count, or alternative rendering that discloses the presence or content of hidden data.
- An openly known direction may retain its permitted direction semantics; a secret opposite direction must not be inferable from a two-color gradient, second stroke, arrow, label, or detail entry.
- Privacy styling is supplemental; it never replaces the server's access/redaction boundary.

## Edges, direction and labels

- Every visible relationship segment is straight. A two-way relationship may use one straight gradient segment with each perspective labeled at its matching endpoint. If separate segments are required, they are parallel straight segments.
- Direction A→B and B→A must render in the correct orientation. Do not use one generic arrow for both values.
- Preserve hit target, selection/hover, focus emphasis, fade behavior, and the existing rule that labels appear on focus/hover where currently intended.
- Labels identify type and qualifier for the correct perspective. A one-known-sense public edge is rendered as the approved known perspective only; never hint at the unknown counterpart to players.
- Preserve the existing minimum readable node labels and keyboard selection semantics.

## Eight type styles

- Each of the eight vínculo types has its own clearly distinguishable color in both light and dark themes.
- Keep non-color cues (stroke pattern/weight and localized type name) so type identification does not depend on color alone.
- Filter chips/sample lines use the same color and stroke style as the corresponding graph edge. Do not replace the line sample with a generic color dot.
- Color and stroke remain stable in the graph, two-way endpoint labels, detail entries and filter samples.
- Validate the complete eight-type set in a dense graph and both themes; document the chosen type-color mapping in `docs/manual-relacoes.md`.

## Existing API boundary

No new endpoint or data contract is planned:

- GM reads the existing `/api/admin/vinculos` projection under current GM access.
- Player reads the existing `/api/vinculos` projection, which applies pair visibility, character visibility and per-sense redaction server-side.
- Existing `Vinculo` types, privacy flags, direction, notes and qualifiers remain unchanged.
- Any verified projection leak must first be covered by a failing endpoint regression test; only the smallest server redaction fix may be introduced.

## Documentation and intentional differences

- Update `docs/manual-relacoes.md` and `specs/116-relacoes-rota-reconstrucao/spec.md` with approved visual/privacy behavior and the existing floating-panel structure.
- Record that straight edges and eight distinguishable type colors supersede the curved edges/four-family mapping of historical spec 105; do not erase the historical decision.
- Preserve the current branch's page shell and interaction model when documenting differences from `main`.
