# Research: Tema claro e escuro em todos os gêneros

**Feature**: `150-tema-claro-escuro-universal`  
**Date**: 2026-09-25

## 1. Alvo de implementação

**Decision**: implementar no frontend ativo em `frontend/`.

**Rationale**: o produto e as suítes Playwright existentes estão nesse diretório. `frontend-next/` é um protótipo de interface com dados e armazenamento separados; alterá-lo não corrigiria a aplicação ativa.

**Alternatives considered**: modificar também `frontend-next/` — fora do escopo de BKLG-036 e não necessário para a aplicação de produção.

## 2. Resolução da preferência

**Decision**: manter `auto | light | dark`, a chave local `codex.theme` e a resolução de Automático pela media query `prefers-color-scheme`. Remover a capacidade dos gêneros de sobrepor essa preferência.

**Rationale**: `themePreference.ts` já resolve os três modos, persiste a escolha no navegador, reage à mudança do sistema no modo Auto e atualiza outras abas. `campaignGenre.ts` é o ponto que hoje força escuro quando `supportsLight` é falso.

**Alternatives considered**: armazenar a preferência na conta no backend — rejeitado para esta feature porque não existe essa persistência atualmente e isso exigiria API, modelo, migração e matriz de isolamento; o backlog pede preservar a preferência individual sem solicitar sincronização entre dispositivos.

## 3. Escopo da preferência

**Decision**: a preferência continua local ao perfil do navegador, como hoje. Contextos de navegador separados não compartilham a escolha; sincronização por conta ou entre dispositivos fica fora do escopo.

**Rationale**: o valor é lido e gravado em `localStorage`; não há preferência de tema em `Usuario` nem endpoint correspondente. A spec foi ajustada para não prometer persistência por conta.

**Alternatives considered**: mudar a semântica para preferência server-side — maior escopo e alteração de dados que não é necessária para remover a restrição de gênero.

## 4. Paletas por gênero

**Decision**: fornecer tokens de modo claro para Fantasia, Gótico, Sci-Fi e Urbano, mantendo tokens escuros e a identidade cromática própria de cada gênero. Validar contraste nos pares de texto/superfície cobertos pelo verificador existente.

**Rationale**: `tokens.css` contém base clara de Fantasia, enquanto regras atuais de Gótico, Sci-Fi e Urbano também se aplicam quando `data-theme='light'` e mantêm valores escuros. Apenas remover a trava de modo deixaria controles nativos claros sobre superfícies escuras e não entregaria um tema claro utilizável.

**Alternatives considered**: permitir selecionar Claro sem criar paletas claras — rejeitado por não satisfazer o resultado funcional nem legibilidade coerente. Reaproveitar a paleta clara de Fantasia em todos os gêneros — rejeitado por apagar diferenças de identidade.

## 5. Impacto de contrato, dados e compatibilidade

**Decision**: nenhum contrato externo, modelo de domínio, valor persistido, API ou migração é necessário. Preservar valores armazenados `auto`, `light` e `dark`; valores ausentes/inválidos continuam caindo para `auto`.

**Rationale**: a feature muda a resolução e a apresentação do modo no cliente. A chave atual continua válida, portanto não há transformação de estado persistido.

**Alternatives considered**: criar versão nova da chave — desnecessário, pois o formato de preferência não muda.

## 6. Validação existente

**Decision**: ampliar os E2Es de tema para cobrir os quatro gêneros em Auto, Claro e Escuro, a reação do modo Auto à troca de preferência do dispositivo e a estabilidade da preferência explícita; manter acessibilidade, persistência e validação de contraste existentes.

**Rationale**: os testes atuais cobrem opções, persistência e sistema principalmente na campanha fixture corrente, mas não cobrem as combinações de gênero. `check-contrast.mjs` é a validação de contraste já disponível.

**Alternatives considered**: adicionar framework ou biblioteca de temas — rejeitado porque os recursos atuais cobrem a necessidade.
