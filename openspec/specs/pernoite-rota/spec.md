# pernoite-rota Specification

## Purpose
Garante que uma rota de vários dias de viagem mostre, no mapa, onde o grupo pernoita cada noite — distinguindo pernoite abrigado (numa cidade, ou perto o bastante de uma) de pernoite ao relento — e que essa distinção considere a proximidade real de qualquer cidade da campanha, não só os pontos exatos da rota calculada.

## Requirements

### Requirement: Pernoite perto de uma cidade não é ao relento
Ao calcular um pernoite que não cai sobre um nó vinculado a um Local, o sistema SHALL verificar a distância até cada Local da campanha; se a distância até o Local mais próximo for menor ou igual ao raio de abrigo configurado, o pernoite SHALL ser classificado como abrigado nesse Local, não ao relento. O raio SHALL ser expresso no mesmo espaço de coordenadas do mapa (0–1), não em milhas, e SHALL ser o mesmo pra toda a campanha (não configurável por Local).

#### Scenario: Pernoite cai perto de uma cidade fora da rota calculada
- **WHEN** o ponto ideal de pernoite de um dia de viagem cai fora de qualquer nó vinculado a Local, mas dentro do raio de abrigo de um Local que não está no caminho calculado
- **THEN** o pernoite é classificado como abrigado nesse Local, com seu nome e identificador

#### Scenario: Pernoite longe de qualquer cidade continua ao relento
- **WHEN** o ponto ideal de pernoite de um dia de viagem não cai dentro do raio de abrigo de nenhum Local da campanha
- **THEN** o pernoite continua classificado como ao relento, exatamente como hoje

#### Scenario: Dois Locais dentro do raio escolhem o mais próximo
- **WHEN** o ponto ideal de pernoite cai dentro do raio de abrigo de mais de um Local
- **THEN** o pernoite é classificado como abrigado no Local com menor distância até o ponto

### Requirement: Marcadores de pernoite visíveis no mapa
A tela de Rota SHALL mostrar, pra rota selecionada, um marcador distinto pra cada pernoite ao relento, na posição calculada, e um destaque visual no pin do nó onde o grupo pernoita abrigado. Rotas alternativas não selecionadas SHALL NOT mostrar marcadores de pernoite.

#### Scenario: Pernoite ao relento aparece como marcador próprio
- **WHEN** a rota selecionada tem um pernoite classificado como ao relento
- **THEN** o mapa mostra um marcador distinto na posição calculada desse pernoite

#### Scenario: Pernoite abrigado destaca o pin existente
- **WHEN** a rota selecionada tem um pernoite classificado como abrigado num Local
- **THEN** o pin já existente desse nó no mapa recebe um destaque visual indicando que é onde o grupo pernoita

#### Scenario: Rotas alternativas não mostram pernoites
- **WHEN** há mais de uma rota candidata calculada e uma delas não está selecionada
- **THEN** o mapa não mostra marcadores de pernoite pra essa rota alternativa

### Requirement: Traçado da rota colorido por fadiga do dia
Quando a rota selecionada acumula fadiga residual (ritmo intenso), o trecho correspondente a cada dia de viagem com fadiga residual SHALL ser visualmente distinguível do restante do traçado, refletindo o nível de fadiga acumulada.

#### Scenario: Dia com fadiga residual tem traçado distinto
- **WHEN** um dia de viagem da rota selecionada termina com fadiga residual acumulada (ritmo intenso)
- **THEN** o trecho desse dia no mapa é visualmente distinguível do restante do traçado, refletindo o nível de fadiga

#### Scenario: Ritmo normal não mostra coloração de fadiga
- **WHEN** a rota selecionada usa ritmo normal (sem acúmulo de fadiga)
- **THEN** o traçado não mostra nenhuma coloração de fadiga
