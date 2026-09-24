# Implementation Plan: Rede de Relações

**Branch**: `105-rede-relacoes` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`.

## Summary

4 famílias de cor + estilos de linha (RFC §5); rótulos de aresta só hover/selecção; nós ≥12px; chips unificados na coluna; arestas curvas; Tab/Enter; detalhe sem placeholder/«Sem descrição.»; contraste ≥3:1.

## Technical Context

**Language/Version**: TS/React  
**Primary Dependencies**: SVG GraphStage existing  
**Testing**: checklist + lint:tokens + contraste famílias  
**Constraints**: sem API; tokens only

## Constitution Check

PASS (I–VI).

## Project Structure

```text
frontend/src/styles/tokens.css          # --vinculo-familia-* 
frontend/src/components/relacoes/vinculoStyles.ts
frontend/src/components/relacoes/GraphStage.tsx|.css
frontend/src/components/relacoes/RelacoesSideColumn.tsx|.css
frontend/src/components/relacoes/RelacoesDetailPanel.tsx
frontend/scripts/check-contrast.mjs     # family vs stage bg
CHANGELOG.md
```

## Complexity Tracking

(none)
