# Contract: Isolamento home / painel

**Feature**: 098  
**Extends**: matrizes 094/095

## Catálogo `GET /api/campanhas/catalogo`

| Fixture | Visível? |
|---------|----------|
| A `listada` activa | sim |
| B `so_link` activa | **não** |
| C `listada` inactiva | **não** |

Anónimo e user A/B: mesma resposta (sem cota).

## Minhas `GET /api/campanhas/minhas`

| Actor | Vê A (dono A) | Vê B (dono B) | Vê C (A é mestre não-dono) | Vê D inactiva (dono A) |
|-------|---------------|---------------|----------------------------|-------------------------|
| Anónimo | 401 | 401 | 401 | 401 |
| A | sim | **não** | **não** | **não** |
| B | **não** | sim | **não** | **não** |

Zero fuga de nome/slug/cota de mesas omitidas.

## Criar / PATCH visibilidade

| Actor | POST criar | PATCH visibilidade de A |
|-------|------------|-------------------------|
| Anónimo | 401 | 401 |
| A (dono A) | 201 | 200 |
| B | 201 (nova mesa sua) | 403 em slug A |

## UI

Painel de A MUST NOT renderizar B. Export UI só para dono (botão ausente ou erro 403).
