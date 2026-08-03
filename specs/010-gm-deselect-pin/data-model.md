# Data Model: 010-gm-deselect-pin

Nenhuma alteração de modelo de dados persistido, schemas ou APIs.

Esta feature altera apenas o **estado de seleção de UI** no cliente.

## Entidades de UI (conceituais)

### Seleção de pin (sessão)

| Campo / estado | Descrição |
|----------------|-----------|
| `selectedLocalId` | `number \| null` — local destacado no mapa (`MapPage`) |
| `placementMode` | `none \| add-pin \| reposition \| move-group` — se ≠ `none`, clique no stage posiciona, não deseleciona |
| `isGm` | Sessão GM; callback de deseleção por clique vazio só exigido quando verdadeiro |
| `localDraft` | Formulário admin de local; **independente** da seleção — não limpar no deselect |

### Apresentação

| Sinal | Descrição |
|-------|-----------|
| `.campaign-map__pin--selected` | Classe visual quando `local.id === selectedLocalId` |
| Ficha/detalhe ligada à seleção | Em jogador: `PinModal` quando `selectedLocal`; em GM atual pode não haver ficha — clear ainda zera o id |

## Transições

1. **GM idle, pin selecionado** → clique na área vazia do stage → `selectedLocalId = null` → pin perde destaque; ficha associada fecha se existir; `localDraft` inalterado.
2. **GM idle, pin A selecionado** → clique no pin B → `selectedLocalId = B` (pins com `stopPropagation`).
3. **GM em placement** → clique no stage → coordenadas / fluxo de posicionamento; **sem** clear-only no mesmo handler branch.
4. **GM idle, nenhum selecionado** → clique vazio → no-op seguro.
5. **Pan/zoom** → não devem por si só zerar `selectedLocalId`.
6. **Clique no marker do grupo** → não deseleciona (stopPropagation).

## Validação

- Sem novas entidades de domínio.
- Invariante: deselect por clique fora ⇔ `selectedLocalId === null` após o evento, com `localDraft` preservado.
