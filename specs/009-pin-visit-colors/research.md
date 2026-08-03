# Research: 009-pin-visit-colors

## 1. Representação da cor

**Decision**: Armazenar como string CSS hex `#RRGGBB` (7 chars). Validar no schema Pydantic com regex `^#[0-9A-Fa-f]{6}$`. Normalizar para maiúsculas ou minúsculas de forma consistente na escrita (preferir lowercase).

**Rationale**: Simples, suficiente para `<input type="color">` e `background` CSS; sem alpha (pins sólidos).

**Alternatives considered**:
- Nome nomeado / token de tema → menos flexível para seletor livre
- Inteiro RGB → pior DX no frontend

## 2. Persistência e migração SQLite

**Decision**: Campo `cor_pin: str` no model `Local`. Em `_migrate_sqlite`: se coluna ausente, `ALTER TABLE local ADD COLUMN cor_pin VARCHAR(7) NOT NULL DEFAULT '#c4b5fd'` (lilás sugerido “conhecido não visitado”). Seed e creates novos exigem cor explícita; default de formulário GM = lilás ou último swatch.

**Rationale**: Padrão já usado para `grupo_posicao.formato`; assumptions da spec.

**Alternatives considered**: Tabela de migração Alembic → overkill no projeto atual.

## 3. API

**Decision**: Incluir `cor_pin` em `LocalCreate` (obrigatório), `LocalUpdate` (opcional no partial mas se enviado deve ser válido; na prática o form GM sempre envia), `LocalRead` (sempre). Admin create/update rejeitam ausente/ inválido. Público já devolve `LocalRead` — jogadores leem cor, não escrevem.

**Rationale**: FR-003/004/007/008.

**Alternatives considered**: Endpoint separado só de cor → YAGNI.

## 4. UI do seletor

**Decision**: No `LocalFormDialog`: `<input type="color">` + botões swatch (vermelho `#e5484d` alinhado ao pin atual; lilás `#c4b5fd` ou similar Nocturne). Validação: desabilitar Salvar se `cor_pin` vazio. Sem UI de cor no fluxo jogador / PinModal editável.

**Rationale**: FR-002; native color input = seletor livre; swatches = convenção sugerida.

**Alternatives considered**: Biblioteca de color picker → desnecessário.

## 5. Renderização do pin e legenda

**Decision**: `style={{ background: local.cor_pin }}` (ou CSS variable) em `.campaign-map__pin`; manter borda escura existente. Legenda: além de “Local”, texto curto da convenção sugerida (ex. “Vermelho ≈ visitado · Lilás ≈ conhecido”) e amostra do swatch padrão — deixando claro que o GM pode usar outras cores (FR-005).

**Rationale**: Pin hoje é `#e5484d` fixo no CSS; inline override por local.

**Alternatives considered**: Classes CSS por enum → conflita com seletor livre.

## 6. Sem enum de status de visita

**Decision**: Não adicionar `status_visita` nesta entrega. Convenção é documental + swatches.

**Rationale**: Clarificação A.
