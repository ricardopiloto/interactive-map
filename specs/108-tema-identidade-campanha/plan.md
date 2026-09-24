# Implementation Plan: Tema e identidade por campanha

**Branch**: `108-tema-identidade-campanha` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

## Summary

Paleta 5 acentos AA; `acento_id` + `capa_arquivo` em Campanha; upload `covers`; painel configura; mesa aplica token; home/cards; sugestão por sistema; export/import.

## Project Structure

```text
backend/alembic_control/versions/004_identidade.py
backend/app/models/campanha.py
backend/app/services/accent_palette.py
backend/app/services/media_paths.py + media_acl + uploads tree
frontend/src/theme/campaignAccent.ts + tokens
frontend/src/pages/PainelPage + HomePage
```
