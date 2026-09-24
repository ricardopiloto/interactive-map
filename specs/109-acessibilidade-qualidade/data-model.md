# Data model: Acessibilidade e qualidade

N/A para schema de produto. Artefactos de teste:

| Entity | Location | Notes |
|--------|----------|-------|
| Baseline PNG | `frontend/e2e/snapshots/**` | nome `{tela}-{locale}-{theme}-{viewport}.png` |
| E2E campaign | data root tmp / fixture slug | campanha seed com mapa mínimo |
| Session cookie | `codex_session` | token opaco da tabela `Sessao` |
