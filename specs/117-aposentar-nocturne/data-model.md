# Data model: Migração nocturne → kit (117)

Nenhuma entidade de persistência. Modelo de trabalho da feature:

## TargetClass

| Campo | Tipo | Notas |
|-------|------|--------|
| `selector` | string | ex. `.btn-primary`, `.seg-opt` |
| `category` | enum | `button` \| `field` \| `segment` \| `card` \| `tag` \| `dialog` \| `global` \| `form-chrome` |
| `occurrences` | paths[] | Ficheiros fora de `components/ui` (+ dívida interna do kit) |

## KitMapping

| Campo | Tipo | Notas |
|-------|------|--------|
| `targetClass` | ref | Classe legado |
| `destination` | string | Componente (`Button`) ou CSS kit (`ui-seg`) ou `global.css` |
| `gap` | boolean | true se precisa criação nesta feature |
| `notes` | string | ex. `block` prop, variant accent |

## MigrationBatch

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | string | `auth`, `painel`, `admin-forms`, `gm`, `relacoes`, `map-routes`, `kit-debt`, `globals` |
| `files` | path[] | Lote implementável |
| `status` | pending → done | |

## RemovalGate

| Campo | Tipo | Notas |
|-------|------|--------|
| `grepClean` | boolean | 0 hits fora do kit (padrões contratados) |
| `kitSelfContained` | boolean | kit não usa classes só definidas em nocturne |
| `globalsAbsorbed` | boolean | tipografia/focus/text-muted em global |
| `tscPass` | boolean | |
| `fileDeleted` | boolean | `nocturne.css` ausente + import removido |

## Transitions

```text
[inventory] --> [kit extensions] --> [migrate batches*] --> [kit debt] --> [globals absorb]
  --> [grep gate] --> [remove import + delete file] --> [tsc + smoke]
```

## Validation rules

- Não apagar ficheiro se `grepClean` ou `kitSelfContained` falsos.
- `form-chrome` (npc-form/local-form image slots) MUST ter CSS noutro ficheiro de componente antes do delete.
- Nomes não-alvo (`auth-card`, `ui-*`, BEM de página) MUST NOT entrar no inventário como falhas.
