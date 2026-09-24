# Data Model: Paridade de clique no filtro do painel de detalhe (Relações)

Não aplicável — nenhuma entidade, schema ou persistência nova.

### Estado de UI (já existente; só a interação muda)

| Estado | Onde | Persistência | Notas |
|--------|------|--------------|--------|
| `activeTipos: Set<VinculoTipo>` | `RelacoesPage` (grafo) | Sessão de componente | Intactos; passam a ser mutados via helper partilhado |
| `activeDetailTipos: Set<VinculoTipo>` | `PersonagemDetailBody` | Sessão; reset ao remount (`key={personagem.id}`) | Intactos como Set independente; mesma API de clique |
| Pending click timer | ref por call site / hook | Nenhum | MUST ser limpo no unmount (FR-004) |

Tipos de vínculo continuam a ser `VINCULO_TIPOS` / `VinculoTipo` de `vinculoStyles` — sem novos valores.
