# Implementation Plan: Tema claro e escuro em todos os gêneros

**Branch**: `150-tema-claro-escuro-universal` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/150-tema-claro-escuro-universal/spec.md`

## Summary

Permitir Claro, Escuro e Automático nos quatro gêneros de campanha. O comportamento atual força Gótico, Sci-Fi e Urbano para Escuro e só possui paleta clara completa para Fantasia. O desenho remove essa restrição no frontend ativo, adiciona variantes claras calibradas para os três gêneros restantes, mantém Automático ligado à preferência do sistema operacional e preserva a preferência no armazenamento local do navegador. Não há mudança de backend, schema ou sincronização entre dispositivos.

## Technical Context

**Language/Version**: TypeScript 6, React 19; CSS

**Primary Dependencies**: React, Vite e Playwright já existentes; nenhuma dependência nova

**Storage**: `localStorage` do navegador, chave `codex.theme`; sem mudança de persistência

**Testing**: Playwright E2E existentes (`frontend/e2e/theme-selector-menu.spec.ts`, `theme-selector-trigger.spec.ts`), verificação de contraste e build do frontend

**Target Platform**: Aplicação web ativa em desktop e mobile, nos navegadores suportados pelo projeto

**Project Type**: Aplicação web com frontend e backend; esta feature altera somente `frontend/`

**Performance Goals**: Sem regressão perceptível na troca de tema; a preferência explícita ou automática deve refletir-se imediatamente

**Constraints**: Manter quatro identidades de gênero, preferências explícitas estáveis diante de mudanças do sistema, Automático reativo à preferência do sistema e UI acessível em pt-BR e en

**Scale/Scope**: Tokens visuais e aplicação da preferência de tema no frontend ativo; nenhuma rota, API, entidade persistida ou migração

## Constitution Check

- **I. Isolamento entre campanhas — PASSA**: não há nova rota nem leitura/escrita de dados de campanha; o tema é uma preferência local e a paleta é selecionada pelo gênero da campanha já carregada.
- **II. Testes primeiro — PASSA / N/A**: não altera autenticação, permissões, migrações, importação ou exportação. A cobertura E2E de tema será ampliada antes da implementação dos comportamentos novos.
- **III. Produção legada — PASSA**: alteração restrita ao frontend deste produto; não exige mudança nas instâncias legadas.
- **IV. Simplicidade — PASSA**: mantém CSS, TypeScript e ferramentas atuais; nenhuma dependência ou serviço novo.
- **V. i18n — PASSA**: opções existentes permanecem; qualquer copy nova deve receber chaves pt-BR e en. Não há texto escrito pelo mestre envolvido.
- **VI. Migrações — N/A**: nenhum schema é alterado.

**Conflito deliberado com a spec 111**: a spec 111 decidiu que somente Fantasia teria suporte a claro e que os demais gêneros forçariam escuro. A BKLG-036 e esta spec substituem essa decisão somente quanto à disponibilidade do modo claro/escuro; preservam as identidades e os dados de gênero definidos pela spec 111.

**Reavaliação pós-design — PASSA**: o desenho continua sem rotas ou dados novos, não adiciona dependências, não altera instâncias legadas e mantém copy em pt-BR/en. Como não há mudança de schema, não é necessária migração. A cobertura de tema e contraste será ampliada nos comandos já existentes.

## Project Structure

### Documentation (this feature)

```text
specs/150-tema-claro-escuro-universal/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

Não há contrato de API: a feature não expõe interfaces externas nem altera endpoints.

### Source Code

```text
frontend/src/theme/
├── campaignGenre.ts       # aplicar gênero e restaurar a preferência efetiva
├── genres.ts              # capacidades dos gêneros
└── themePreference.ts     # Auto/Claro/Escuro e sincronização com o sistema

frontend/src/styles/tokens.css # tokens escuros e claros por gênero
frontend/e2e/
├── theme-selector-menu.spec.ts
└── theme-selector-trigger.spec.ts
frontend/scripts/check-contrast.mjs # matriz de contraste já existente
```

**Structure Decision**: manter a lógica de preferência e gênero nos módulos existentes de `frontend/src/theme`, as paletas em `tokens.css` e a validação nas suítes atuais do frontend. `frontend-next/` é um protótipo independente e não integra esta entrega.

## Complexity Tracking

Sem violações da constituição ou dependências novas.
