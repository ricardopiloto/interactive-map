# Side-by-side: app × frontend-next fantasia (spec 110)

Recorded after token + pill + Cormorant parity. Themes: light and dark.

| # | App | Protótipo | Cor | Raio | Sombra | Notes |
|---|-----|-----------|-----|------|--------|-------|
| 1 | `/` | fantasia home | pass | pass | pass | Cormorant on title; parchment/ink surfaces |
| 2 | `/painel` | `/painel` | pass | pass | pass | Pill CTAs; accent swatches intact |
| 3 | `/c/{slug}` mapa | mapa | pass | pass | pass | Column/surface map to fantasia |
| 4 | `/c/{slug}/relacoes` | relações | pass | pass | pass | Vínculo family hues aligned |
| 5 | mapa + tab Rota | rota | pass | pass | pass | Soft elevation shadows |

**Contrast**: `npm run test:contrast` — no pair worse than `contrast-before.txt` (light accent nudged from `#8a5a12` → `#7c5110` for FR-008).

**Pill**: `.ui-btn` / `.btn` / `.tag` / `.ui-chip` / search fields use `--radius-full`; box `.input` / `.ui-input` stay `--radius-sm`.
