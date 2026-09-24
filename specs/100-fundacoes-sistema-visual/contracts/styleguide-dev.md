# Contract: Styleguide (dev only)

**Feature**: `100-fundacoes-sistema-visual`

## Rota

| Ambiente | `/__styleguide` |
|----------|-----------------|
| `import.meta.env.DEV` | Página com amostras de tokens + toggle dark/light no **contentor** `.styleguide-preview` |
| Production build | Rota **não** registada → 404 |

## Regras

- Toggle MUST NOT escrever `document.documentElement.dataset.theme`.
- MUST NOT carregar dados de campanha / API de conteúdo.
- Copy do guia: idioma de trabalho OK (sem i18n obrigatório).
