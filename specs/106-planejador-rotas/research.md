# Research: Planejador de rotas

## 1. Unidade por campanha

**Decision**: `Campanha.unidade_distancia` ∈ {`mi`,`km`} default `mi`; exposto em `GET …/config`; `PATCH /api/campanhas/{slug}/unidade-distancia` (dono). FE multiplica milhas × 1.609344 só no ecrã.

## 2. Chips de resumo

**Decision**: Sempre listar modo, ritmo, ordenação, preferência; velocidade só se `modo === proprio`. Usar `Chip` UX-2.

## 3. Tempo humanizado

**Decision**: FE formata a partir de `tempo_horas` + ritmo (6/8 h/dia) com dias + horas **inteiras** (arredondar resto); ignorar decimais de `tempo_texto` no ecrã.

## 4. Dentro/Fora

**Decision**: i18n `Via {{n}} bp` / `Fora da via {{n}} bp` (en: On-road / Off-road).

## 5. Timeline

**Decision**: Bloco sob o item seleccionado (ou imediatamente abaixo da lista, ligado à selecção) com `pernoites[]` (Local nome / ao relento).
