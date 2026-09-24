# Implementation Plan: Planejador de rotas

**Branch**: `106-planejador-rotas` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`.

## Summary

Opções avançadas recolhidas com chips (todos os grupos); tempo dias+horas inteiras; distância mi/km por campanha; meta «Via / Fora da via» + bp; selecção em acento; timeline de pernoites na rota seleccionada; digitalizador alinhado a tokens. Sem mudar cálculo.

## Technical Context

**Language/Version**: TS/React + FastAPI/SQLModel  
**Primary Dependencies**: RoutePlannerPanel, Chip UX-2, Campanha control.db  
**Testing**: checklist + formatação unitária FE onde fizer sentido  
**Constraints**: cálculo/API numérica inalterada; km só apresentação (~1.609344)

## Constitution Check

PASS (I–VI). Migração control para `unidade_distancia`.

## Project Structure

```text
backend/alembic_control/versions/003_unidade_distancia.py
backend/app/models/campanha.py
backend/app/schemas/config.py + campanhas.py
backend/app/services/instance_config.py + campanha_admin.py
backend/app/routers/campanhas.py
frontend/src/types/index.ts
frontend/src/utils/routeFormat.ts          # tempo/distância/bp
frontend/src/components/routes/RoutePlannerPanel.tsx|.css
frontend/src/components/gm/RouteDigitizer*.css (tokens polish)
frontend/src/pages/PainelPage.tsx          # UI unidade
frontend/src/locales/{pt-BR,en}/mapa.json + comum/painel
CHANGELOG.md
```

## Complexity Tracking

(none)
