# Spec Delta

## Purpose

Garante que o produto usa uma única paleta de cores para toda campanha, sem nenhuma seleção de gênero/tema por campanha em nenhuma tela ou fluxo, nova ou existente.

## ADDED Requirements

### Requirement: Uma única paleta de cores para todo o produto
O sistema SHALL usar uma única paleta de cores (a paleta OKLCH de `paper-parchment-pages-main`) para a interface de toda campanha, SHALL NOT oferecer nenhuma seleção de gênero ou tema de cor por campanha, e SHALL NOT aplicar nenhuma variação de paleta condicionada a um campo de gênero.

#### Scenario: Nenhum seletor de gênero/tema em nenhuma tela
- **WHEN** uma pessoa cria uma campanha nova ou abre o Painel de uma campanha existente
- **THEN** não há nenhum controle para escolher ou alterar um gênero/tema de cor da campanha

#### Scenario: Cores idênticas entre campanhas diferentes
- **WHEN** duas campanhas diferentes são abertas, uma depois da outra
- **THEN** a paleta de cores da interface é idêntica nas duas, independentemente do sistema de RPG ou de qualquer outro dado da campanha

### Requirement: Campanha não tem mais um campo de gênero
O sistema SHALL NOT persistir, aceitar ou retornar um campo de gênero para nenhuma campanha, nova ou já existente — incluindo nas respostas de configuração pública, na listagem de campanhas do dono e no catálogo, e no manifesto de export/import de pacote.

#### Scenario: Resposta de configuração não inclui gênero
- **WHEN** o cliente busca a configuração pública de uma campanha
- **THEN** a resposta não contém nenhum campo de gênero

#### Scenario: Export e reimportação de uma campanha não referenciam gênero
- **WHEN** uma campanha é exportada e depois reimportada como um novo pacote
- **THEN** o manifesto gerado não contém um campo de gênero, e a reimportação funciona normalmente sem esse campo

### Requirement: Sistema de RPG e capa continuam independentes do tema
O sistema SHALL continuar permitindo que o dono informe o sistema de RPG (texto livre) e a imagem de capa da campanha — nenhum dos dois SHALL depender ou ser afetado pela remoção do tema por gênero.

#### Scenario: Sistema de RPG continua editável
- **WHEN** o dono cria ou edita uma campanha
- **THEN** o campo de sistema de RPG continua disponível e funciona normalmente, sem nenhuma ligação com paleta de cores

#### Scenario: Capa da campanha continua funcionando
- **WHEN** o dono faz upload de uma imagem de capa para a campanha
- **THEN** a capa é salva e exibida normalmente, sem nenhuma ligação com paleta de cores
