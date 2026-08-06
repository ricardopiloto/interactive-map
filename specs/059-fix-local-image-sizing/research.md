# Research: Apply Portrait Sizing Policy to Locals

**Feature**: `059-fix-local-image-sizing` | **Date**: 2026-08-05

## 1. Audit — is 057/058 applicable?

**Decision**: Yes, on two surfaces.

| Surface | File | Current bug |
|---------|------|-------------|
| Local detail (read) | `PinModal.tsx` | `style={{ width: '100%', height: 150 }}` + default cover |
| Local create/edit (write) | `LocalFormDialog.tsx` | Same fixed height 150 |
| Locais list in side menu | `SideMenu.tsx` | No large image slot — **N/A** |

**Rationale**: Spec Audit Result; grep confirmed both call sites. Side-menu Locais are name cards only (no expanded image equivalent to NPC portrait).

**Alternatives considered**: Treat only the form as in-scope (reject — pin modal is the player-facing equivalent of 057); change global ImageSlot defaults (reject — map and other slots need their own sizing).

## 2. Sizing policy

**Decision**: Identical to 057/058 when `src` is set:

- Slot: `width: 100%`; `height: auto`; `max-height: 50vh`
- `img`: `height: auto`; `max-height: 50vh`; `object-fit: contain`
- `fit="contain"` on ImageSlot
- Shrink-to-fit (no empty frame stuck at 50vh)

**Empty form placeholder**: modest `min-height` (~110–150px) only when no image — mirror `npc-form__portrait--empty` (class toggled when `!imagem_url`).

**Pin modal without image**: keep current behaviour (no broken empty frame); ImageSlot may still render placeholder — do not force a tall empty box; if placeholder shows, min-height modest is OK.

**Rationale**: Spec FR-001–FR-007; reuse proven CSS from nocturne `.npc-form__portrait`.

## 3. Where to put CSS

**Decision**:

- **Form**: Add `.local-form__image` / `--empty` next to `.npc-form__portrait` in `nocturne.css` (same dialog token context).
- **Pin modal**: Add `.pin-modal__image` in `PinModal.css` (component already has a stylesheet) **or** nocturne — prefer **PinModal.css** to keep pin chrome colocated.

**Rationale**: Mirror 058 nocturne for forms; PinModal already owns layout CSS.

## 4. Pin modal shell interaction

**Decision**: Image max-height 50vh is sufficient; pin modal already scrolls via `.dialog` max-height. Do not change modal positioning/beside logic.

**Rationale**: Spec edge case — image must not push modal off-screen; body scroll already handles overflow.

## 5. Non-goals

**Decision**: Do not change NPC 057/058 classes; map campaign ImageSlot; digitizer; Locais list cards; API/schema.

**Rationale**: Spec Out of Scope / FR-008.
