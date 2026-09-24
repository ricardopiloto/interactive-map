# Codex v2 — Multi-Sistema & Multi-Campanha

**Target version:** **2.0.0** (major — frentes A–D) + evolução **Campaign Codex** (specs 092–099)  
**Estado:** frentes A–D **implementadas** (0.12.0–0.15.0); follow-ups 081–091 em 0.16.x–0.19.x. Frente B (multi-deploy + hub) **substituída** pelo Campaign Codex para campanhas novas.

**Source:** [`docs/v2/`](../../docs/v2/)  
**Brief v2 (A–D):** [`product-brief-codex-multissistema.md`](../../docs/v2/product-brief-codex-multissistema.md)  
**Brief Campaign Codex:** [`product-brief-campaign-codex.md`](../../docs/v2/product-brief-campaign-codex.md) · RFC: [`rfc-campaign-codex.md`](../../docs/v2/rfc-campaign-codex.md)

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
| [085-vinculo-color-rethink](../085-vinculo-color-rethink/spec.md) | 0.17.1 | Paleta: Sangue borgonha, Inimizade magenta, Adversário cobre |
| [086-relacoes-list-compact](../086-relacoes-list-compact/spec.md) | 0.18.0 | Lista na coluna, hover-preview, anel interior compacto (>6) |
| [087-relacoes-overview-compact](../087-relacoes-overview-compact/spec.md) | 0.18.1 | Vista geral mais compacta (folga 120; foco intacto) |
| [088-relacoes-focus-tighter](../088-relacoes-focus-tighter/spec.md) | 0.18.2 | Anel interior de foco >6 ainda mais compacto (160→112) |
| [089-relacoes-few-spread](../089-relacoes-few-spread/spec.md) | 0.18.3 | Anel interior de foco ≤3 mais aberto (240→312) |
| [090-relacoes-status-filter](../090-relacoes-status-filter/spec.md) | 0.19.0 | Filtro de estado (Todos / Vivos / Mortos / Desconhecidos / Desaparecido) |
| [091-relacoes-legend-position](../091-relacoes-legend-position/spec.md) | 0.19.1 | Chave da Rede no palco (canto inferior esquerdo, como no mapa) |

### Campaign Codex (instância única multi-campanha)

Specs 092–099 — uma por fase. Brief + RFC acima. Frente B deixa de ser o modelo de deploy para campanhas novas.

| Spec | Fase | Estado |
|------|------|--------|
| [092-fundacao-testes](../092-fundacao-testes/spec.md) | Fundação de testes | Implemented |
| [093-controle-alembic-sqlite](../093-controle-alembic-sqlite/spec.md) | Banco de controle + Alembic + SQLite por campanha | Implemented |
| [094-roteamento-campanha](../094-roteamento-campanha/spec.md) | Roteamento por campanha | Implemented |
| [095-contas-sessao-permissoes](../095-contas-sessao-permissoes/spec.md) | Contas, convite, sessão, permissões | Implemented |
| [096-uploads-cota](../096-uploads-cota/spec.md) | Uploads controlados e cota | Implemented |
| [097-exportar-importar](../097-exportar-importar/spec.md) | Exportar / importar | Implemented |
| [098-home-painel-mestre](../098-home-painel-mestre/spec.md) | Página inicial e painel do mestre | Implemented |
| [099-migracao-legado-corte](../099-migracao-legado-corte/spec.md) | Migração legada e corte | Implemented |

## Restrições globais (brief)

- Campanha WFRP em produção **não pode parar** — migração só após validação; instâncias antigas intactas na janela de retorno
- Evolução in-place (não reescrita)
- **Multi-tenant na app** (SQLite por campanha + banco de controle) e **contas de mestre** (convite, sem cadastro aberto) **fazem parte do escopo**
- Jogadores **continuam sem conta**; sem monetização; sem tradução de conteúdo do mestre

## Documento de referência (não spec nova)

- [`docs/v2/feature-rede-relacoes.md`](../../docs/v2/feature-rede-relacoes.md) — notas visuais Nocturne; implementação coberta por specs 066–076 + 079 + 081

## Pipeline Speckit

Constituição: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (v1.0.0). Planos MUST passar o Constitution Check (isolamento, testes de segurança/dados, legado intacto, SQLite, i18n, Alembic).

```
/speckit-clarify → /speckit-plan → /speckit-tasks → /speckit-implement
```

Histórico completo de specs: pasta [`specs/`](../).
