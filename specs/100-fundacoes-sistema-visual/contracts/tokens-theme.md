# Contract: Tokens e tema

**Feature**: `100-fundacoes-sistema-visual`

## API de apresentação

| Superfície | Contrato |
|------------|----------|
| Raiz | `html[data-theme="dark"\|"light"]` |
| Boot | Tema = `prefers-color-scheme`; listener `change` actualiza de imediato |
| Tokens | Variáveis CSS RFC §4 em ficheiro canónico (`tokens.css`); consumidas via `var(--…)` |
| Fonte | Inter 400/500 local; sem Google Fonts runtime |
| Movimento | Tokens de duração; `prefers-reduced-motion: reduce` anula/minimiza |
| Produto | MUST NOT haver seletor de tema na UI (excepto preview styleguide) |

## Migração

- Remover `--color-section*`, `.table`, `.hr`, comentários «review round».
- Hex de UI em CSS/TSX → tokens (excepto pino).
- Fallbacks `#0f1115` / blurple legado → tokens RFC.
