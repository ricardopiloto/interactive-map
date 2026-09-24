# Contract: Token role mapping (110)

Fonte: `frontend-next/src/styles/tokens.css` (fantasia) + `global.css` (forma).

## Colors (dark = fantasia default; light = fantasia light)

| App token | Prototype source (dark) | Prototype source (light) |
|-----------|-------------------------|--------------------------|
| `--color-bg` | `#191610` | `#f3ecd9` |
| `--color-surface` | `#211d17` | `#faf5e8` |
| `--color-column` | `#211d17` (surface) | `#faf5e8` |
| `--color-elevated` | `#342f25` | `#ffffff` |
| `--color-text` | `#efeeec` | `#26200f` |
| `--color-text-secondary` | `#b4afa7` | `#5b5138` |
| `--color-text-tertiary` | `#958f83` | `#756a4c` |
| `--color-border-subtle` / `--color-divider` | border mix | border mix |
| `--color-border-field` | field mix | field mix |
| `--color-accent` / `--color-accent-fill` | `#d8aa5a` | `#8a5a12` |
| `--color-accent-hover` | `#e0bb7b` | `#714a0e` |
| `--color-on-accent` | `#1b160e` | `#fff8ec` |
| `--color-accent-label-bg` | accent-wash / elevated wash | wash light |
| `--color-success` … `--color-info` | semânticas `:root` / `[data-mode=light]` | |
| `--vinculo-*` famílias | `--link-affinity/bond/hostile/neutral` | |

`--color-surface-2` (protótipo `#2c2820` / `#ffffff`): expor como alias opcional `var(--color-elevated)` ou token intermédio se side-by-side exigir; default elevated = elevated do protótipo.

## Radii / space / shadow / type

| Token | Value |
|-------|-------|
| `--radius-sm/md/lg/full` | 8 / 12 / 20 / 999 |
| `--space-7` | 48px (additive; keep `--space-6=24`, `--space-8=32`) |
| `--shadow-sm/md/lg` | prototype dark values; light: softer equivalents from prototype spirit (plan: use same soft stacks with lower alpha on light) |
| `--shadow-float` | add; wire elevations to md/lg/float |
| `--font-display` | `'Cormorant Garamond', Georgia, serif` |

## Pill selectors

`.ui-btn`, `.ui-icon-btn`, `.ui-chip`, search field container, `.btn`, `.tag` → `border-radius: var(--radius-full)`.

## Compatibility aliases (MUST remain)

`--color-accent-fill`, `--color-accent-100`, `--color-accent-300`, `--color-accent-800`, `--color-accent-2`, `--color-accent-2-100`, `--color-accent-2-800`, `--color-neutral-100`, `--color-neutral-800`.
