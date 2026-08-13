# API Contract: `VinculoTipo`

**Feature**: `081-novos-tipos-vinculo`  
**Scope**: FR-001, FR-002  
**Endpoints**: inalterados (`POST/PATCH` admin vínculos; GET público já devolve `tipo_ab` / `tipo_ba`)

## Enum

Valores aceites em `tipo_ab` e `tipo_ba`:

```text
aliado | vinculo_sangue | amizade | inimizade | adversario | romance | familia | conhecido
```

(Ordem de documentação = ordem canónica de UI; JSON não ordena o enum.)

## Request (create / update)

Mesmo schema actual (`VinculoCreate` / `VinculoUpdate`). Exemplos novos:

```json
{
  "personagem_a_id": 1,
  "personagem_b_id": 2,
  "tipo_ab": "adversario",
  "tipo_ba": null,
  "direcao": null,
  "qualificador_ab": "Rival",
  "publico": false
}
```

```json
{
  "personagem_a_id": 1,
  "personagem_b_id": 2,
  "tipo_ab": "vinculo_sangue",
  "tipo_ba": null,
  "direcao": "a_para_b",
  "qualificador_ab": "Lacaio",
  "publico": false
}
```

Duas vias misturando novo + legado:

```json
{
  "tipo_ab": "adversario",
  "tipo_ba": "amizade"
}
```

## Validation

- Valor fora do enum → 422 (Pydantic), mesmo código de erro que tipos inválidos hoje.
- Sem migração: clientes antigos que **não enviem** os novos IDs continuam válidos.
- Clientes antigos que **recebam** um ID novo devem tolerar string desconhecida (fora desta frente: o frontend 0.16.0 conhece os 8).

## Persistence

- Tabela `vinculo`, colunas existentes.
- Sem novo índice, CHECK ou coluna.
