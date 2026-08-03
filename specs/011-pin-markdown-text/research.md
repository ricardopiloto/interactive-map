# Research: 011-pin-markdown-text

## 1. Onde renderizar

**Decision**: Renderizar Markdown apenas na **leitura** do detalhe do pin (`PinModal` → corpo da descrição). Lista/sidebar e formulário GM mostram texto bruto (textarea). NPC/arco não mudam.

**Rationale**: Alinha FR-002/009; GM não tem `PinModal` hoje — validação = sair do Modo GM ou abrir como jogador (já previsto na US2).

**Alternatives considered**:
- Render também no SideMenu → fora do “detalhe do pin”; risco de layout quebrado em cards curtos
- Preview no form GM → rejeitado na clarificação

## 2. Biblioteca Markdown

**Decision**: Usar **`react-markdown`** no frontend, com componentes customizados e schema de sanitização (`rehype-sanitize` ou allowlist via props/`allowedElements`), em vez de `dangerouslySetInnerHTML` cru.

**Rationale**: Idiomático em React; evita HTML string intermediário; fácil anular `img` e customizar `a`.

**Alternatives considered**:
- `marked` + `DOMPurify` → funciona, mas mistura HTML string + React
- Parser Markdown próprio → YAGNI / risco de segurança
- Render no backend → desnecessário; storage continua texto

## 3. Política de imagens

**Decision**: Não renderizar nós `img` (componente que retorna `null` ou omitido do allowlist). Sintaxe `![...](...)` não carrega rede.

**Rationale**: Clarificação A / FR-010 / SC-005.

**Alternatives considered**: Mostrar só `alt` como texto → opcional cosmético; default = omitir imagem.

## 4. Política de links

**Decision**: Componente `a` (ou equivalente):
- Se `href` começa com `http:` ou `https:` → `<a href=… target="_blank" rel="noopener noreferrer">`
- Caso contrário (incl. `javascript:`, `data:`, relativo ambíguo perigoso) → renderizar como texto ou `<span>` sem navegação

**Rationale**: Clarificação A / FR-011 / SC-006.

**Alternatives considered**:
- Links só como texto → rejeitado (usuário escolheu A)
- Qualquer esquema → inseguro

## 5. Texto puro e Markdown inválido

**Decision**: Pipeline único: texto puro passa pelo mesmo renderer (parágrafos/linhas); Markdown quebrado degrada graciosamente (biblioteca padrão) sem crash (FR-008).

**Rationale**: Sem flag “é markdown?”; um campo só (assumptions).

**Alternatives considered**: Detectar MD e bifurcar → frágil e desnecessário.

## 6. Backend / persistência

**Decision**: Nenhuma mudança de modelo, schema, migrate ou validação de API. `descricao` permanece string; tamanho/limites atuais.

**Rationale**: Markdown é convenção de conteúdo, não tipo de dado novo.

**Alternatives considered**: Campo `descricao_formato` enum → rejeitado (sem modo).

## 7. Estilo visual

**Decision**: Classes locais sob o modal (ex. `.pin-modal__markdown`) para `p`, `ul`/`ol`, `h1`–`h3`, `a`, `strong`/`em`, alinhadas ao Nocturne (tamanho/opacidade do `.dialog-body`).

**Rationale**: Evitar tipografia default do browser que quebre o diálogo.

**Alternatives considered**: Importar CSS “github-markdown” completo → pesado e fora da marca.
