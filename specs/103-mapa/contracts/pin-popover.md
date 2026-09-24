# Contract: Pin popover

**Feature**: `103-mapa`

## Open

Selecting a local opens popover anchored beside pin (narrow viewport: centered).

## Close

- Escape
- Click on map / transparent backdrop (outside panel)
- Close button

## Visual

- MUST NOT dim/darken the map (no scrim opacity on backdrop)
- Empty description: omit description block (no «Sem descrição.» / «No description.»)

## Content

Reuse existing PinModal fields (name, image, data_sessao, markdown, arco/npc chips) without new API fields.
