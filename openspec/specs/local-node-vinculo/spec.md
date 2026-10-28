# local-node-vinculo Specification

## Purpose
Garante que toda Localidade tem sempre um nó de rede (Waypoint) associado, na mesma posição geográfica, e que os dois permanecem sincronizados ao longo do tempo — não só no instante em que o vínculo é criado.

## Requirements

### Requirement: Toda Localidade ganha um Waypoint associado na criação
Ao criar uma Localidade sem um Waypoint explicitamente informado, o sistema SHALL criar automaticamente um Waypoint na mesma posição (x,y) da Localidade e vinculá-lo a ela. Um Waypoint SHALL poder existir sem nenhuma Localidade associada. Esta garantia vale no momento da criação (e, para Localidades já existentes antes desta change, no backfill de dados que roda uma vez) — desvincular manualmente uma Localidade do seu Waypoint continua possível pela interação de vínculo já existente (fora de escopo restringir isso nesta change) e, se isso acontecer, a Localidade fica sem Waypoint até ser vinculada a outro.

#### Scenario: Criar uma Localidade sem informar um nó
- **WHEN** uma Localidade é criada sem `waypoint_id` no payload
- **THEN** um Waypoint novo é criado na mesma posição da Localidade e vinculado a ela automaticamente

#### Scenario: Criar uma Localidade vinculando a um nó já existente
- **WHEN** uma Localidade é criada informando um `waypoint_id` de um nó já existente
- **THEN** nenhum Waypoint novo é criado; a Localidade usa o nó informado, e a posição da Localidade passa a ser a do nó (comportamento já existente, preservado)

### Requirement: Posição de Localidade e Waypoint vinculados fica sempre sincronizada
Quando uma Localidade e um Waypoint estão vinculados, mover qualquer um dos dois SHALL atualizar a posição do outro, de forma que os dois nunca fiquem com posições diferentes. Os segmentos de rota conectados a esse Waypoint SHALL refletir a nova posição.

#### Scenario: Reposicionar uma Localidade vinculada
- **WHEN** o dono move uma Localidade que já está vinculada a um Waypoint (sem trocar o vínculo)
- **THEN** a nova posição é salva na Localidade, e o Waypoint vinculado passa a ter a mesma posição nova

#### Scenario: Mover um Waypoint vinculado no editor de Rede de rotas
- **WHEN** o dono move um Waypoint que está vinculado a uma Localidade, pelo editor de Rede de rotas
- **THEN** a Localidade vinculada passa a ter a mesma posição nova, e qualquer segmento conectado a esse Waypoint é redesenhado na posição nova

#### Scenario: Trocar o vínculo de uma Localidade para outro nó
- **WHEN** o dono vincula uma Localidade já existente a um Waypoint diferente do atual
- **THEN** a Localidade adota a posição do novo Waypoint vinculado (não o contrário)

### Requirement: Mover um Waypoint recalcula a distância dos segmentos conectados
Quando um Waypoint é movido (por qualquer uma das direções de sincronização desta change), o sistema SHALL recalcular a distância armazenada de todo segmento de rota conectado a ele, para que o cálculo de rota não use uma distância desatualizada em relação à geometria real.

#### Scenario: Distância de um segmento após mover o nó
- **WHEN** um Waypoint com pelo menos um segmento de rota conectado é movido
- **THEN** a distância armazenada desse segmento é recalculada a partir da nova posição, e um cálculo de rota subsequente usando esse segmento reflete a distância nova

### Requirement: Excluir uma Localidade não remove o Waypoint vinculado
Ao excluir uma Localidade vinculada a um Waypoint, o sistema SHALL desvincular (não excluir) o Waypoint — ele continua existindo como um nó de rede sem Localidade associada.

#### Scenario: Excluir uma Localidade vinculada
- **WHEN** uma Localidade vinculada a um Waypoint é excluída
- **THEN** o Waypoint continua existindo na rede de rotas, sem nenhuma Localidade associada
