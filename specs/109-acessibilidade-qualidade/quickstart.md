# Quickstart: Acessibilidade e qualidade

## Prerequisites

- Backend + frontend locais; ou `npx playwright test` com `webServer` configurado
- Seed e2e (script documentado em `frontend/e2e/`) com dono + campanha fixture

## Scenarios

1. **Teclado mapa**: Tab pelos controlos; abrir lista; seleccionar local; Esc fecha drawer e devolve foco.
2. **Teclado relações**: lista da coluna selecciona nó; foco visível.
3. **aria-live**: calcular rota → anúncio; toast polite.
4. **Reduced motion**: OS reduce → sem animações decorativas.
5. **Touch**: viewport 390px; IconButtons/chrome ≥ 44px.
6. **CI local**: `cd frontend && npx playwright test` — 0 critical axe; snapshots OK pt-BR+en.
7. **Contraste**: `npm run test:contrast` passa (incl. acentos UX-9).
