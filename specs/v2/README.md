# Codex v2 — Multi-Sistema & Multi-Campanha

**Target version:** **2.0.0** (major — frentes A–D)  
**Estado:** frentes A–D **implementadas** (0.12.0–0.15.0); follow-ups 081/082 em 0.16.x.

**Source:** [`docs/v2/`](../../docs/v2/)  
**Brief:** [`product-brief-codex-multissistema.md`](../../docs/v2/product-brief-codex-multissistema.md)

## Frentes e specs

| Ordem | Frente | Spec | Release | Estado |
|-------|--------|------|---------|--------|
| 1 | A — Motor agnóstico de sistema | [077-sistema-modulos](../077-sistema-modulos/spec.md) | 0.12.0 | Implemented |
| 2 | B — Multi-deploy + hub índice | [078-multideploy-hub](../078-multideploy-hub/spec.md) | 0.13.0 | Implemented |
| 2* | C — Débito UX + Nocturne | [079-ux-nocturne](../079-ux-nocturne/spec.md) | 0.14.0 | Implemented |
| 2* | D — Internacionalização (UI) | [080-i18n-interface](../080-i18n-interface/spec.md) | 0.15.0 | Implemented |

\* B, C e D puderam intercalar após A; C antes de ou junto com D.

### Follow-ups pós-v2

| Spec | Release | Notas |
|------|---------|--------|
| [081-novos-tipos-vinculo](../081-novos-tipos-vinculo/spec.md) | 0.16.0 | Adversário + Vínculo de Sangue |
| [082-language-combobox](../082-language-combobox/spec.md) | 0.16.1 | Seletor de idioma em combo-box |
| [083-map-absent-gm-access](../083-map-absent-gm-access/spec.md) | 0.16.2 | Sem mapa: esconder Mapa (não-GM); GM pode abrir para upload |
| [084-personagem-visibility](../084-personagem-visibility/spec.md) | 0.17.0 | Visibilidade de personagem (GM) |

## Restrições globais (brief)

- Campanha WFRP em produção **não pode parar** — migração só após validação
- Evolução in-place (não reescrita)
- Sem contas de jogador, multi-tenant na app, monetização, ou tradução de conteúdo do mestre

## Documento de referência (não spec nova)

- [`docs/v2/feature-rede-relacoes.md`](../../docs/v2/feature-rede-relacoes.md) — notas visuais Nocturne; implementação coberta por specs 066–076 + 079 + 081

## Pipeline Speckit

```
/speckit-clarify → /speckit-plan → /speckit-tasks → /speckit-implement
```

Histórico completo de specs: pasta [`specs/`](../).
