# Research: 034-revert-pin-offset

## 1. O que a 030 mudou (causa do desvio)

**Decision**: Reverter explicitamente as mudanças de âncora/tamanho da 030 em `.campaign-map__pin` e `.campaign-map__party*`, e remover o bloco `@media (max-width: 799px)` só de pin/party.

Estado **actual (030)** (resumo):
- Pin: `--pin-size: 24px`; `margin-left/top: calc(var(--pin-size) * -1)`; `transform-origin: 100% 100%` (+ selected/hover)
- Party: variáveis `--party-w/h` / `--party-brasao` com margens tip/centro
- Móvel: `--pin-size: 20px` e party proporcional em `max-width: 799px`

Estado **pré-030** (baseline em `git show HEAD:…/CampaignMap.css` para estes blocos; 030 ainda não commitada nesse caminho, mas o working tree diverge):
- Pin: `width/height: 24px`; `margin-left: -12px`; `margin-top: -22px`; `transform: rotate(-45deg)` **sem** `transform-origin` explícito na ponta
- Selected/hover: scale sem `transform-origin: 100% 100%`
- Bandeira: `24×32`, `margin-left: -12px`, `margin-top: -28px`
- Brasão: `22×22`, `margin-left/top: -11px`, `rotate(45deg)`
- Sem media 799 para tamanho de pin

**Rationale**: Spec pede restaurar pré-030; o desvio ao reposicionar coincide com a nova âncora (ponta = canto) vs o clique que o utilizador compara com o estilo antigo.

**Alternatives considered**:
- “Corrigir” a âncora 030 de outra forma → fora de âmbito (só reverter)
- `git checkout` do ficheiro CSS inteiro → apagaria estilos 032 (banner Cancelar) e outros pós-HEAD

## 2. Como reverter sem perder estilos posteriores

**Decision**: Patch cirúrgico: substituir regras `.campaign-map__pin*`, `.campaign-map__party--bandeira`, `.campaign-map__party--brasao` pelo texto pré-030; apagar apenas o `@media (max-width: 799px)` de pin/party. Manter banner, conexões, legend layout, `@media 720px` de controls/legend, etc.

**Rationale**: YAGNI + FR-006.

## 3. Status Deferred / Staged da 030

**Decision**: Em `specs/030-pin-size-offset/spec.md`, definir `**Status**: Deferred / Staged` e uma nota curta: revertida do produto pela 034; retomar só após revalidar com reposicionamento. Não apagar plan/tasks/contracts da 030.

**Rationale**: Clarificação Session 2026-08-03 opção A; FR-005; SC-003.

**Alternatives considered**: Apagar pasta 030 → rejeitado; git stash como “stage” → rejeitado na clarificação.

## 4. CHANGELOG

**Decision**: Em `[0.6.0]`, remover (ou mover para nota “diferido”) os bullets que afirmam pins menores no móvel e alinhamento pela ponta (linhas Changed/Fixed / resumo que citam 030). Manter resto de 0.6.0 (rotas, etc.).

**Rationale**: Changelog não deve afirmar comportamento já revertido.

## 5. Validação

**Decision**: Quickstart = reposicionar num ponto óbvio + confirmar sem desvio lateral; viewport móvel sem redução 15–25%; pasta 030 com Status Deferred.
