# Feature Specification: Paridade de tokens e forma visual com o protótipo

**Feature Branch**: `110-paridade-tokens-prototipo`

**Created**: 2026-09-21

**Status**: Implemented

**Input**: User description: "Paridade de tokens e forma visual com o protótipo. Fonte da verdade: `frontend-next/` (tokens + global + README). O app real (`frontend/`) passa a usar exactamente os valores de cor, raio, sombra, espaço e fonte do protótipo, sem reestruturar ecrãs. Pílula em botões/chips/busca; Cormorant Garamond local em títulos editoriais já existentes; espaço 48 px; sombras mais suaves. Acentos de campanha (108) mantêm o mecanismo; género (111) fora de escopo. Critério-chave: lado a lado com o protótipo sem diferença a olho nu em cor/raio/sombra nas telas principais; contraste não piora."

**Depends on**: [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (tokens + gate de contraste); [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (kit `.ui-*`); [108-tema-identidade-campanha](../108-tema-identidade-campanha/spec.md) (5 acentos — mecanismo intacto); [109-acessibilidade-qualidade](../109-acessibilidade-qualidade/spec.md) (telas principais / baselines). **Precede** a futura spec de género por campanha (prompt 111). Fonte visual: [`frontend-next/`](../../frontend-next/) (protótipo Compass).

**Phase**: Correção de identidade visual pós-UX-10. Alinha a paleta de **base** (tema claro/escuro) e a **forma** (pílula, raios, sombras, tipografia editorial) ao protótipo `frontend-next`, sem redesenhar layouts nem inventar ecrãs.

## Clarifications

### Session 2026-09-22

- Q: Como se aceita a paridade visual (SC-001)? → A: Revisão humana lado a lado (checklist) **e** reaprovação das baselines Playwright das 5 telas (109) no CI nesta fase.
- Q: Amplitude da pílula? → A *(default no plano — clarify interrompido)*: Kit UI + chips/tags + busca + `.btn`/`.tag` legados nas telas principais.
- Q: Tokens dos 4 géneros agora? → A *(default no plano)*: Só fantasia → `data-theme`; góticos/scifi/urbano ficam para 111.
- Q: Hex do latão/base? → A *(default no plano)*: Acento de base = fantasia do protótipo (`#d8aa5a` / `#8a5a12`); swatches 108 recalibrados só se o gate de contraste exigir, mecanismo intacto.

## Constitution

- Isolamento (I): N/A — só tokens e estilos partilhados; sem novas rotas de dados.
- Testes primeiro (II): o script de contraste existente MUST correr e **não piorar** nenhum par já coberto; regressão visual das cinco telas principais (ou revisão lado a lado documentada) MUST falhar se cor/raio/sombra divergirem do alvo.
- Produção legada (III): N/A para `/opt` (corte 099 já feito); mudanças só em `frontend/` servido pela instância actual.
- Simplicidade (IV): um mapeamento de papéis de token documentado; aliases de compatibilidade para nomes já referidos no código; sem segunda folha de estilo paralela.
- i18n (V): N/A para copy nova; fonte editorial não traduz conteúdo do mestre.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A mesa e o catálogo «parecem» o protótipo (Priority: P1)

Um visitante ou jogador abre as **telas principais** (página inicial, painel, mapa, relações, planejador de rota) em tema **claro** e **escuro**. As cores de fundo, superfície, texto, acento de base, raios e sombras batem com o género **fantasia** do protótipo (modo correspondente), a olho nu — sem reorganizar o layout.

**Why this priority**: Critério-chave; toda feature futura nasce em cima desta base.

**Independent Test**: Capturas lado a lado (app × protótipo, mesmas cinco superfícies, ambos os temas) — revisor humano não distingue cor, raio nem sombra; script de contraste sem regressão.

**Acceptance Scenarios**:

1. **Given** tema escuro no app e protótipo em fantasia/escuro, **When** se comparam home, painel, mapa, relações e rota, **Then** fundo, superfícies, textos e acento de base coincidem a olho nu com o protótipo.
2. **Given** tema claro no app e protótipo fantasia/claro, **When** se faz a mesma comparação, **Then** o mesmo critério de paridade visual aplica-se.
3. **Given** a paleta de base actualizada, **When** corre o gate de contraste existente, **Then** **nenhum** resultado piora face à baseline pré-mudança.

---

### User Story 2 - Controlos em pílula (Priority: P1)

Botões do kit UI, chips/tags de filtro e o campo de busca passam a usar a forma **pílula** (cantos completamente arredondados), como no protótipo — sem mudar a estrutura das páginas.

**Why this priority**: Diferença de forma mais óbvia entre produção e protótipo.

**Independent Test**: Inspecionar botão primário/secundário, chip activo e campo de busca; raio visual = pílula; restantes controlos de formulário (inputs rectangulares) podem manter cantos médios do protótipo.

**Acceptance Scenarios**:

1. **Given** o kit de botões partilhado, **When** se renderiza primário/secundário/fantasma/ícone, **Then** o contorno é pílula.
2. **Given** chips/tags usados em filtros (mapa, relações, formulários), **When** se renderizam, **Then** usam pílula.
3. **Given** o campo de busca das listas/painéis, **When** se renderiza, **Then** o contentor é pílula (como `.search-field` do protótipo).

---

### User Story 3 - Tipografia editorial só onde já existe (Priority: P2)

Títulos editoriais que **já** pedem fonte de display (ex.: título da Home e cabeçalhos equivalentes que já referenciam display) passam a usar **Cormorant Garamond** hospedada **localmente** (mesmo padrão da Inter). Não se criam ecrãs de marketing novos nem se aplica display a toda a UI.

**Why this priority**: Fecha a lacuna tipográfica sem expandir âmbito de produto.

**Independent Test**: Título da Home usa display; chrome e corpo continuam Inter; rede/fonte local sem Google Fonts.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** se inspeciona o título principal, **Then** usa a fonte de display (Cormorant) local.
2. **Given** o resto da UI (navegação, botões, listas), **When** se inspeciona, **Then** permanece Inter / fonte de UI — MUST NOT forçar display em todo o produto.
3. **Given** carregamento offline/restrito, **When** as fontes sobem, **Then** display e Inter vêm de assets locais (sem CDN externa obrigatória).

---

### User Story 4 - Acentos de campanha intactos (Priority: P2)

O mestre continua a escolher entre as **cinco** cores de acento da spec 108 no painel; a mesa continua a aplicar o acento escolhido. Só muda o «chão» cromático (base) sob o qual esses acentos se lêem.

**Why this priority**: Evita regressão de produto enquanto a spec 111 (género) ainda não existe.

**Independent Test**: Trocar acento no painel; mesa reflecte; latão default sem acento; contraste dos pares de acento continua a passar.

**Acceptance Scenarios**:

1. **Given** campanha com acento gravado, **When** se abre a mesa, **Then** o acento escolhido continua a aplicar-se como hoje.
2. **Given** campanha sem acento, **When** se abre a mesa, **Then** vale o acento de base (latão / equivalente da paleta fantasia alinhada).
3. **Given** o seletor de 5 acentos no painel, **When** se inspeciona, **Then** o mecanismo e as opções permanecem — MUST NOT remover nem substituir por género nesta fase.

---

### Edge Cases

- Nomes de variável do protótipo ≠ nomes do app: o mapeamento de **papel** (ex. superfície intermédia do protótipo → papel já usado por «elevated»/aliases no app) MUST preservar as referências existentes (`accent-fill`, `accent-100`, etc.) via aliases — MUST NOT renomear em massa o código consumidor nesta spec.
- Escala de espaço: o valor **48 px** entra na escala; tokens de espaço já referenciados no código MUST NOT mudar de valor de forma a partir o layout (completar o que falta, não renumerar à força o que já é 24/32).
- Styleguide / pré-visualizações locais: MUST reflectir a nova base para não mentir aos programadores.
- Tema claro/escuro do app (`data-theme`) continua a ser o comutador do utilizador; género (`data-genre`) **não** é ligado nesta fase (111).
- Reduced-motion e alvos de toque (109) MUST permanecer válidos após mudança de tokens/forma.
- `/opt/codex-*` intocado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A paleta de **base** do app (tema escuro e claro) MUST usar **exactamente** os valores de cor do protótipo para o género **fantasia** nos modos escuro e claro correspondentes (fundos, superfícies, textos, bordas, acento de base, lavagem de acento, semânticas success/warning/danger/info, famílias de vínculo alinhadas aos `--link-*` do protótipo onde o papel existir).
- **FR-002**: Escalas de **raio** MUST alinhar ao protótipo (`sm`/`md`/`lg` + **`full` = pílula**). MUST usar raio pílula em: kit `.ui-btn`/`.ui-icon-btn`, chips/tags de filtro (incl. `.tag` legado), contentor de busca, e `.btn` legado nas telas principais. Inputs «caixa» e drawers/modais mantêm raios `sm`/`md`/`lg` (não pílula).
- **FR-003**: Escalas de **sombra / elevação** MUST alinhar aos valores suaves do protótipo (incluindo equivalente a sombra «float» onde o papel já exista no app).
- **FR-004**: A escala de **espaço** MUST incluir o degrau de **48 px** em falta; degraus já usados pelo código (4–32) MUST manter os valores estáveis que o layout actual assume, excepto onde o protótipo e o app já coincidem.
- **FR-005**: MUST existir token de fonte **display** (Cormorant Garamond) com ficheiros **locais**; MUST aplicar-se só a títulos editoriais **já** previstos (home e equivalentes que já pedem display). Corpo/UI permanece Inter local.
- **FR-006**: Aliases de compatibilidade (`accent-fill`, `accent-100`/`300`/`800`, e restantes aliases já documentados no sistema visual) MUST continuar a resolver para os papéis correctos após a troca de base — MUST NOT exigir refactor em massa dos consumidores.
- **FR-007**: O mecanismo dos **5 acentos de campanha** (108) MUST permanecer operacional e inalterado em comportamento; esta fase só recalibra a paleta de base sob a qual os acentos se aplicam.
- **FR-008**: O script/gate de **contraste** existente MUST passar após a mudança **sem piorar** nenhum par já coberto (incluindo amostragem dos acentos 108).
- **FR-010**: MUST existir checklist de revisão **lado a lado** (app × protótipo fantasia) das cinco telas × dois temas; MUST **reaprovar** as capturas de referência Playwright das telas principais (suite 109) nesta fase para o CI refletir a nova base.

### Out of Scope

- Género por campanha (`data-genre`, wizard, migração de acento→género) — spec **111**.
- Novas páginas de marketing ou crónica de sessões.
- Mudança de estrutura de SideMenu, mapa, grafo ou drawers além do que tokens/forma de controlos partilhados implicam.
- Aposentadoria do seletor de 5 acentos.

### Key Entities

- **Paleta de base**: conjunto de cores/raios/sombras/espaço/fontes do tema claro e escuro, alinhado ao género fantasia do protótipo.
- **Alias de compatibilidade**: nome antigo de token que aponta para o papel novo sem quebrar consumidores.
- **Forma pílula**: raio máximo aplicado a botões, chips e busca.
- **Fonte display**: família editorial local para títulos já existentes.
- **Acento de campanha**: escolha 108 sobre a base (inalterada em mecanismo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão lado a lado das **cinco** telas principais (home, painel, mapa, relações, rota) nos **dois** temas, um revisor **não** distingue diferença de **cor, raio ou sombra** face ao ecrã correspondente do protótipo (fantasia / modo equivalente) — critério-chave. As baselines Playwright dessas telas MUST ser **reaprovadas** nesta fase (CI verde com as novas capturas).
- **SC-002**: **Zero** regressões no gate de contraste: nenhum par previamente coberto piora de rácio — critério-chave.
- **SC-003**: **100%** dos botões do kit UI amostrados e dos chips/busca amostrados nas telas principais apresentam forma pílula.
- **SC-004**: Título editorial da Home (e pares já marcados para display) usa a fonte display local; restante UI amostrada permanece na fonte de interface.
- **SC-005**: Comutar os 5 acentos de campanha no painel continua a alterar o acento da mesa sem erro; default sem acento permanece o acento de base alinhado.

## Assumptions

- «Protótipo correspondente» = ecrãs de `frontend-next` no género **fantasia** (único com claro+escuro calibrados no README do protótipo); os outros géneros entram só na 111.
- Mapeamento de papéis (não 1:1 de nomes): texto-1/2/3 do protótipo → texto / secundário / terciário do app; superfície intermédia do protótipo alimenta o papel já consumido como elevated/aliases no app; bordas do protótipo alimentam divider/border-field/border-subtle conforme o uso actual — detalhe exacto no plano, validado pelo lado a lado.
- Espaço: acrescentar **48 px** sem renumerar `--space-6` (24) / `--space-8` (32) já referidos no código; o conjunto de valores {4,8,12,16,24,32,48} fica completo.
- Cormorant pesos 500/600 bastam (como no protótipo); hospedagem local espelha o padrão da Inter.
- Inputs de formulário «caixa» (não busca) seguem o raio `sm` do protótipo, não pílula — alinhado a `.input` do protótipo.
- Baselines visuais da 109 **são** reaprovadas nesta fase (CI); o critério de aceite continua a ser paridade com o **protótipo**, não com as baselines antigas.
- Esta fase prepara o terreno cromático para 111 mas **não** expõe `data-genre` ao utilizador.
