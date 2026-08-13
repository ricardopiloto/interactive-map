# UI Contract: Formulário GM de vínculo

**Feature**: `081-novos-tipos-vinculo`  
**Scope**: FR-003, FR-005 (direcção), FR-007, US1, US3

## Selects de tipo

Todos os `<select>` de tipo (recíproco: um; duas vias: dois) listam `VINCULO_TIPOS` na ordem canónica.

## Direcção — Vínculo de Sangue

Aplica-se **só** em `modo === 'reciproco'`.

| Trigger | Efeito |
|---------|--------|
| `onChange` do select de tipo, novo valor `vinculo_sangue` | `direcao = 'a_para_b'` (mesmo em criar e em editar) |
| Abrir diálogo sobre vínculo já gravado como `vinculo_sangue` | **não** resetar `direcao` |
| Utilizador clica Mútuo / B→A depois do default | valor do radio ganha |
| `modo === 'duas_vias'` | não alterar `direcao` (controlo continua oculto) |

Implementação sugerida: no `onChange` do select recíproco, além de `{ tipo_ab, tipo_ba: tipo_ab }`, se `tipo_ab === 'vinculo_sangue'` incluir `direcao: 'a_para_b'`.

## Qualificador (datalist)

`suggestionsForTipos(...)` em `qualificadorSuggestions.ts`:

- Estender `BY_TIPO` com `adversario` e `vinculo_sangue` (Record completo — TS falha se faltar chave)
- `aliado` += `'Lacaio'`
- `vinculo_sangue`: `['Lacaio']`
- `adversario`: mesma lista que `inimizade` (`['Rival', 'Traidor', 'Antigo aliado']`)
- `Medo` continua injectado no fim da união

Valores do datalist = strings persistidas (PT), iguais às de 075.

Opcional de paridade i18n (não usado pelo datalist actual):

```json
"qualificador": { "lacaio": "Lacaio | Minion" }
```

## Regressão

- Os 6 tipos legados: mesmas sugestões de antes, excepto Aliado que ganha Lacaio
- Mudar tipo **não** apaga o texto do qualificador já escrito (075)
