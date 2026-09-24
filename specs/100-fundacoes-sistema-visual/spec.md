# Feature Specification: Fundações do sistema visual

**Feature Branch**: `100-fundacoes-sistema-visual`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Fundações do sistema visual. Implementar os tokens de docs/v2/rfc-ux-redesign.md como CSS variables com dois temas (data-theme dark|light, padrão pela preferência do sistema): cores, escala tipográfica, espaçamento em 4px, raios, elevação, movimento e prefers-reduced-motion. Hospedar Inter localmente (sem Google Fonts). Remover tokens e classes mortas herdadas do template de slides (--color-section*, .table, .hr, comentários de "review round"). Migrar todos os hexadecimais fora do arquivo de tokens (RouteDigitizer, CampaignMap, RoutePlanner, LocalFormDialog, MapPage, GraphStage) para tokens, exceto a cor de pino escolhida pelo mestre. Regra de lint que proíbe hexadecimal fora dos tokens. Página /__styleguide só em desenvolvimento mostrando tokens e temas. Script de contraste (AA para texto, 3:1 para componentes) rodando nos dois temas dentro dos testes. Fora de escopo: componentes novos, mudanças de layout, seletor de tema visível. Critério-chave: o script de contraste passa nos dois temas; nenhum hexadecimal fora dos tokens; a app inteira renderiza nos dois temas sem texto ilegível."

**Depends on**: RFC de redesenho ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-1); constituição v1.0.0 (III, IV, V); visual Nocturne existente ([079-ux-nocturne](../079-ux-nocturne/spec.md)) como ponto de partida a substituir pelos tokens do RFC

**Phase**: UX-1 (frente de redesenho UI/UX). Bloqueia UX-2+. Pode correr em paralelo com backend já entregue (093–098); não bloqueia 099.

## Clarifications

### Session 2026-09-20

- Q: Se a preferência de cores do sistema mudar com a app já aberta, o que deve acontecer? → A: Actualizar o tema na sessão actual (ouvir `prefers-color-scheme` e aplicar de imediato)
- Q: Como o guia `/__styleguide` deve permitir rever os dois temas? → A: Controlo só no guia para alternar dark/light na pré-visualização (não aparece no resto da app)
- Q: A regra «nenhum hexadecimal fora dos tokens» aplica-se a quê? → A: CSS e literais de cor de UI no código da app (TS/TSX), excepto cor de pino do mestre
- Q: Além de `#RRGGBB`, o gate automatizado deve falhar também com `rgb()`/`hsl()` soltos? → A: Só hex (`#…`) é gate obrigatório; outras notações — limpeza desejável, não bloqueante nesta fase
- Q: O controlo dark/light do `/__styleguide` deve afectar o quê? → A: Só um contentor de pré-visualização dentro do guia (a app fora do guia continua a seguir o sistema)

## Constitution

- Isolamento (I): N/A para dados entre campanhas — esta fase não adiciona rotas de conteúdo de mesa. A página de guia visual de desenvolvimento MUST NOT expor dados de campanha.
- Testes primeiro (II): contraste nos dois temas e a regra «sem hexadecimal fora dos tokens» MUST ter verificação automatizada a falhar **antes** da migração completa ser considerada feita.
- Produção legada (III): MUST NOT exigir alteração de `/opt/codex-*` nem `git pull` nas instâncias antigas.
- Simplicidade (IV): um ficheiro (ou conjunto mínimo) de tokens; fonte Inter local; sem CDN de fontes; sem biblioteca de design system nova nesta fase.
- i18n (V): o guia de desenvolvimento MAY ficar só num idioma de trabalho; copy de produto já existente MUST permanecer com chaves pt-BR/en. Nome de marca: alinhar ao RFC nas fases seguintes (UX-3); nesta fase MUST NOT exigir renomear a marca em todas as strings.
- Migrações (VI): N/A (sem schema).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A app respeita o tema do sistema com paleta legível (Priority: P1)

Um jogador ou mestre abre a aplicação. O aspeto segue a preferência de cor do sistema (escuro ou claro). Texto, bordas e acentos permanecem legíveis. Não há controlo visível para mudar o tema nesta fase.

**Why this priority**: Critério-chave de legibilidade; base de todas as telas seguintes do redesenho.

**Independent Test**: Em ambiente com preferência escura, a UI usa o tema escuro; com preferência clara, o tema claro («pergaminho»). Em ambos, texto primário/secundário e controlos principais são legíveis (validado pelo script de contraste + revisão visual).

**Acceptance Scenarios**:

1. **Given** o sistema do utilizador prefere esquema escuro, **When** abre a app, **Then** o tema escuro está activo (sem seletor na UI).
2. **Given** o sistema prefere esquema claro, **When** abre a app, **Then** o tema claro está activo.
3. **Given** a preferência do sistema muda com a app já aberta, **When** a mudança é detectada, **Then** o tema da sessão actualiza de imediato (sem reload obrigatório).
4. **Given** qualquer um dos temas, **When** navega pelas telas existentes (mapa, relações, login, home/painel se existirem), **Then** não há texto de interface ilegível por contraste insuficiente nos pares cobertos pelo script.

---

### User Story 2 - Cores e tipografia vêm só do sistema de tokens (Priority: P1)

Quem mantém o código (e a revisão automática) garante que cores e tipografia da interface usam o sistema de tokens do RFC — não valores soltos herdados do template antigo — excepto a cor de pino que o mestre escolhe por local.

**Why this priority**: Critério-chave «nenhum hexadecimal fora dos tokens»; evita regressão visual e dívida do template de slides.

**Independent Test**: Pesquisa automatizada / lint falha se existir hexadecimal de cor fora do ficheiro (ou conjunto) de tokens em CSS **ou** em literais de cor de UI no código da app (TS/TSX), excepto a cor de pino do mestre. Tokens mortos de slides e classes órfãs (tabela/hr de template) já não existem. Inter carrega localmente (sem pedido a Google Fonts).

**Acceptance Scenarios**:

1. **Given** a árvore de estilos e componentes listados no RFC (incl. mapa, digitalizador, planeador, formulário de local, grafo), **When** se valida a regra de lint, **Then** não há hexadecimal de cor de UI fora dos tokens em CSS nem em TS/TSX (exceto cor de pino do mestre).
2. **Given** o código legado do template de slides, **When** se inspecciona o CSS da app, **Then** tokens `--color-section*` e classes mortas (`.table`, `.hr`, comentários de «review round») já não fazem parte do produto.
3. **Given** a tipografia da interface, **When** a app carrega, **Then** Inter é servida localmente; MUST NOT depender de Google Fonts (ou outro CDN de fontes) em runtime.

---

### User Story 3 - Guia visual e contraste verificáveis em desenvolvimento (Priority: P1)

Quem desenvolve ou revê o redesign abre o guia de estilos só em ambiente de desenvolvimento, vê os tokens e troca entre os dois temas. Os testes automatizados correm o script de contraste (texto AA; componentes 3:1) nos dois temas.

**Why this priority**: Mitiga o risco do RFC de mudar a app toda de uma vez sem rede de segurança.

**Independent Test**: Em modo desenvolvimento, a rota do guia existe e mostra tokens/temas. Em build de produção, essa rota não está disponível ao utilizador final. A suíte de testes inclui a verificação de contraste para dark e light e passa.

**Acceptance Scenarios**:

1. **Given** a app em modo desenvolvimento, **When** se abre o guia de estilos (`/__styleguide`), **Then** vê amostras dos tokens e pode **alternar dark/light só num contentor de pré-visualização** desse guia (MUST NOT alterar o tema da app fora desse contentor; MUST NOT aparecer controlo equivalente no resto da app).
2. **Given** uma build de produção, **When** um visitante tenta a mesma rota, **Then** o guia **não** é oferecido como página de produto (404 ou equivalente).
3. **Given** a suíte de testes do projecto, **When** corre, **Then** o script de contraste avalia os dois temas (texto com critério AA; componentes UI com contraste mínimo 3:1) e **passa**.

---

### Edge Cases

- Preferência do sistema muda enquanto a app está aberta: MUST actualizar o tema na sessão actual (listener a `prefers-color-scheme`). Sem seletor manual nesta fase.
- `prefers-reduced-motion`: animações/transições do sistema de tokens MUST reduzir ou desligar.
- Cor de pino escolhida pelo mestre: hexadecimal (ou valor livre) permitido **só** nesse dado de conteúdo; MUST NOT abrir excepções genéricas noutros sítios.
- Valores de acento hover / elevado do RFC ainda não medidos no documento: o script de contraste MUST validá-los; se falharem, MUST ajustar tokens até passarem (sem adiar para UX-10).
- Conteúdo desenhado pelo mestre (nomes, lore) e imagens de mapa: fora do âmbito do contraste de UI tokens.
- Instâncias `/opt/codex-*`: intocadas (III).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir um sistema de tokens (variáveis de apresentação) cobrindo, no mínimo: cores de superfície e texto, acento, sucesso/aviso/perigo/info, tipografia (escala e família), espaçamento em grelha de 4, raios, elevação, durações/easing de movimento, conforme o RFC UX.
- **FR-002**: MUST existir dois temas, escuro e claro, seleccionáveis por atributo de tema na raiz da aplicação (`dark` | `light`). O tema inicial MUST seguir a preferência de esquema de cores do sistema. Se a preferência do sistema mudar com a app aberta, MUST actualizar o tema na sessão actual de imediato. MUST NOT haver seletor de tema visível nesta fase.
- **FR-003**: Inter MUST ser hospedada e servida localmente (pesos necessários à UI, alinhados ao RFC). MUST NOT carregar fontes a partir do Google Fonts (nem CDN equivalente) em runtime.
- **FR-004**: MUST remover tokens e classes mortas herdadas do template de slides (incluindo `--color-section*`, `.table`, `.hr`, e comentários de «review round» associados).
- **FR-005**: MUST migrar hexadecimais de cor fora do ficheiro/conjunto de tokens nos sítios identificados (RouteDigitizer, CampaignMap, RoutePlanner, LocalFormDialog, MapPage, GraphStage e demais ocorrências de UI em CSS e TS/TSX), excepto a cor de pino escolhida pelo mestre.
- **FR-006**: MUST existir regra de lint (ou verificação equivalente na CI/testes) que **proíbe** hexadecimal de cor de UI (`#…`) fora dos tokens em **CSS e em literais TS/TSX** da app, com a excepção documentada da cor de pino do mestre. Literais `rgb`/`hsl`/`rgba` (e similares) fora dos tokens são limpeza desejável mas **MUST NOT** ser gate bloqueante nesta fase. SVG/assets estáticos ficam fora do âmbito obrigatório.
- **FR-007**: MUST existir página de guia de estilos em `/__styleguide` **apenas** em desenvolvimento, mostrando tokens e os dois temas. O guia MUST oferecer um controlo **local** que altera o tema **apenas** num contentor de pré-visualização (não a raiz da app). Esse controlo MUST NOT existir no resto da aplicação nesta fase.
- **FR-008**: MUST existir script de contraste que valide, nos dois temas: texto segundo critério AA; componentes de interface com contraste mínimo 3:1. O script MUST correr como parte dos testes automatizados e MUST passar.
- **FR-009**: Transições/movimento definidos nos tokens MUST respeitar `prefers-reduced-motion`.
- **FR-010**: MUST NOT introduzir componentes base novos (Button/Dialog/etc. — UX-2), mudanças de layout de ecrãs (UX-3+), nem seletor de tema na UI (UX-3).
- **FR-011**: MUST NOT exigir alterações às instâncias legadas em `/opt/codex-*`.

### Out of Scope

- Biblioteca de componentes novos e ícones Tabler (UX-2).
- Barra de navegação unificada, menu de utilizador, seletor Auto/Claro/Escuro persistido (UX-3).
- Redesenho de mapa, listas, relações, rotas, formulários (UX-4–UX-8).
- Acento/capa por campanha (UX-9).
- Auditoria a11y completa (UX-10), além do contraste e reduced-motion desta fase.
- Corte de produção legada (099).

### Key Entities

- **Tema**: escuro | claro; origem = preferência do sistema nesta fase.
- **Token**: papel visual nomeado (cor, tipo, espaço, raio, elevação, movimento) com valor por tema quando aplicável.
- **Excepção de pino**: cor livre por local, definida pelo mestre; fora da regra anti-hexadecimal de UI (CSS + TS/TSX).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das execuções da suíte de testes relevante, o script de contraste **passa** para o tema escuro e para o tema claro (texto AA; componentes 3:1).
- **SC-002**: Em 100% das verificações da regra anti-hexadecimal, **zero** literais `#…` de cor de UI fora dos tokens em CSS e TS/TSX (exceto cor de pino do mestre).
- **SC-003**: Com preferência de sistema escura e com preferência clara, um revisor percorre as telas principais existentes e **não** encontra texto de interface ilegível por falta de contraste nos pares cobertos pelo script.
- **SC-004**: Em desenvolvimento, o guia `/__styleguide` está acessível, mostra tokens/temas e permite alternar dark/light **só no contentor de pré-visualização**; em produção, o guia **não** está disponível ao visitante.
- **SC-005**: Em runtime normal da app, **não** há pedido de rede a Google Fonts (ou CDN de fontes equivalente) para a tipografia da interface.

## Assumptions

- Os valores de cor, tipografia, espaço, raios e movimento do RFC (§4) são a fonte de verdade; o plano de implementação mapeia nomes de tokens sem reinventar a paleta, salvo ajuste mínimo exigido pelo script de contraste.
- Preferência do sistema = `prefers-color-scheme` (ou equivalente da plataforma), com actualização em tempo real na sessão. Persistência Auto/Claro/Escuro fica para UX-3.
- «Componentes» no script de contraste = pares definidos no RFC/plano (texto sobre superfícies, borda de campo, acento sobre fundo, etc.), não cada pixel do mapa.
- A cor de pino do mestre continua a ser dado de conteúdo; contraste do pino sobre a imagem do mapa não é da responsabilidade desta fase.
- A regra anti-hex (gate) aplica-se a literais `#…` em CSS e TS/TSX; SVG/assets estáticos e `rgb`/`hsl` soltos não são gate obrigatório nesta fase.
- Inter pesos 400 e 600 (ou 400 e 500 conforme RFC) bastam; não é necessário carregar a família completa.
- CHANGELOG `[Unreleased]`; bump SemVer só se o plano o exigir. Sem corte `/opt`.
- O toggle do styleguide é scoped ao preview; a raiz da app continua a seguir `prefers-color-scheme` mesmo com o guia aberto.

## Notes

- Referência: [docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) (UX-1); prompts em [docs/v2/ux-redesign-speckit-prompts.md](../../docs/v2/ux-redesign-speckit-prompts.md).
- Actualizar `specs/v2/README.md` com a frente UX quando conveniente (Prompt 0 do documento de prompts).
- Próximo: `/speckit-tasks` → `/speckit-implement`.
