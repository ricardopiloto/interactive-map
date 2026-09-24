# Implementation Plan: Estrutura e navegação

**Branch**: `102-estrutura-navegacao` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/102-estrutura-navegacao/spec.md`

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`. Sem `/opt`. Sem SemVer bump só por UX-3.

**Depends on**: UX-1 (100), UX-2 (101) Implemented; 094/095 Implemented; clarifications 2026-09-20 (tema `localStorage`; Modo edição no topo com persistência na campanha; bottom nav só Mapa/Relações; tabs ocultas no móvel; marca → `/`).

## Summary

Unificar o chrome: barra de topo partilhada (marca «Campaign Codex» → `/`, tabs Mapa/Relações só em viewport largo, nome da campanha texto, menu utilizador com Entrar/Sair + idioma + tema Auto/Claro/Escuro em `localStorage`, um único «Modo edição» no topo para quem pode editar). Barra inferior móvel só Mapa/Relações. Remover marca/tags GM duplicados na coluna. Separar sessão (menu) do modo de edição (toggle UI). Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite  
**Primary Dependencies**: React Router, i18next, `@tabler/icons-react`, primitivos UX-2 (`Button`, `IconButton`, `Menu`/`DropdownMenu`)  
**Storage**: `localStorage` (tema); `sessionStorage` ou estado React no `CampaignShell` (modo edição por slug)  
**Testing**: checklist/aceitação manual + asserts de unicidade marca/modo; smoke tema reload; i18n brand fixa  
**Target Platform**: SPA  
**Project Type**: web frontend  
**Performance Goals**: N/A  
**Constraints**: tokens/hex gate UX-1; um Modo edição; zero `/opt`  
**Scale/Scope**: chrome layout + theme module + edit-mode context; MapPage/RelacoesPage/SideMenu/SiteChrome; locales + `<title>`

## Constitution Check

- **I Isolamento**: chrome mostra só nome/slug da campanha actual; modo edição reset ao mudar slug. **PASS**
- **II Testes**: checklist unicidade marca/modo; persistência tema; bottom nav. **PASS** (sem API nova crítica)
- **III Produção legada**: Zero `/opt`. **PASS**
- **IV Simplicidade**: sem libs novas de nav; reutilizar UX-2. **PASS**
- **V i18n**: copy chrome pt-BR/en; marca fixa «Campaign Codex». **PASS**
- **VI Migrações**: N/A. **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation

```text
specs/102-estrutura-navegacao/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/
│   ├── chrome-layout.md
│   ├── theme-preference.md
│   └── edit-mode.md
└── tasks.md
```

### Source Code

```text
frontend/src/theme/applySystemTheme.ts   # → preferência Auto|Claro|Escuro + localStorage
frontend/src/theme/themePreference.ts    # chave, parse, apply
frontend/index.html                      # FOUC script lê localStorage
frontend/src/components/layout/
  CodexHeader.tsx|css                    # → CampaignChrome (topo + bottom nav)
  SiteChrome.tsx|css                     # alinhar marca/menu/tema (home/painel)
  CampaignBottomNav.tsx                  # móvel: Mapa | Relações
frontend/src/context/EditModeContext.tsx # estado isEditMode no CampaignShell
frontend/src/pages/MapPage.tsx           # consumir chrome + edit mode; remover logout-no-toggle
frontend/src/pages/RelacoesPage.tsx      # idem
frontend/src/components/sidebar/SideMenu.tsx  # remover brand + tag Modo GM
frontend/src/locales/{pt-BR,en}/comum.json
frontend/src/App.tsx                     # provider no CampaignShell se necessário
CHANGELOG.md
```

**Structure Decision**: Evoluir `CodexHeader` → chrome de campanha; `SiteChrome` partilha menu/tema/marca; `EditModeProvider` no `CampaignShell`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
