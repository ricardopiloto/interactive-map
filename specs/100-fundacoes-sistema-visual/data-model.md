# Data Model: Fundações do sistema visual

**Feature**: `100-fundacoes-sistema-visual`  
**Date**: 2026-09-20

Sem schema de persistência. Modelo **apresentacional**:

## Theme

| Campo | Valores | Origem |
|-------|---------|--------|
| `data-theme` (raiz `html`) | `dark` \| `light` | `prefers-color-scheme` + listener live |
| Preview theme (só styleguide) | `dark` \| `light` | estado local do contentor `.styleguide-preview` |

## Token roles (canónicos)

Cores (por tema): fundo, coluna, card, elevado, texto primário/secundário/terciário, borda sutil, borda de campo, acento, acento hover, on-accent, etiqueta acento, sucesso, aviso, perigo, info. Opcional nesta fase: `--color-visited` (mapeamento UI do vermelho visitado legado).

Tipografia: família Inter; escala 12/13/14/16/20/24.

Espaço: 4/8/12/16/24/32.

Raios: 6/8/12.

Movimento: 120/200/300 ms + easing; reduced-motion.

## Excepções

| Excepção | Regra |
|----------|--------|
| Cor de pino do mestre | Hex/livre no **dado** do local; permitida no gate |
| Literais `rgb`/`hsl` | Fora do gate obrigatório |
| SVG/assets | Fora do gate obrigatório |

## Lifecycle

1. Boot → aplicar tema sistema na raiz.  
2. SO muda preferência → actualizar raiz.  
3. Abrir styleguide → toggle só no preview.  
4. Sair do styleguide → raiz inalterada (ainda sistema).
