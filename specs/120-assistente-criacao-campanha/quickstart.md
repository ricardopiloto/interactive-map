# Quickstart: Assistente criação campanha — 120

## Prerequisites

- Backend + `frontend` (Vite) a correr; utilizador mestre de teste.
- Spec **119** (ou equivalente): `/painel` e `/explorar` utilizáveis.
- Protótipo: `frontend-next` NovoCodexWizard (referência visual).

## Setup

```bash
# API + frontend conforme README do repo
cd frontend && npm run dev
```

## Manual scenarios

### A — Happy path listada

1. Login → `/painel` → «Criar novo codex» → URL **`/painel/novo`**.
2. Passo Identidade: nome → slug auto; editar slug; ver aviso imutável; Continuar.
3. Passo Sistema: escolher género (ex. gótico) → UI do assistente muda já; sistema; Continuar.
4. Passo Visibilidade: **listada**; Continuar.
5. Revisão → Criar → ecrã sucesso → Abrir campanha → `/c/:slug`.
6. `/painel` e `/explorar`: campanha visível.

### B — Só por link

Repetir A com visibilidade **só por link** → em `/explorar` **não** aparece no catálogo público (regras actuais); em `/painel` sim.

### C — Cancel / auth

- Passo 1 Cancelar → `/painel`, sem campanha nova.
- Sessão limpa → abrir `/painel/novo` → redirect login com `next=/painel/novo`.

### D — Erros

- Slug já usado → mensagem; sem sucesso falso.
- Offline / API down no Criar → erro; permanece no assistente.

## Capturas (SC-001 / SC-004)

Por passo (0–3 + sucesso), claro/escuro, ≥2 géneros — lado a lado com NovoCodexWizard.

## Automated

```bash
cd frontend && npx tsc --noEmit
# pytest API create existing (sem mudanças de contrato)
```

## Expected

- Zero formulário create inline no Painel como fluxo principal.
- POST idêntico ao antigo; listagens reais.
