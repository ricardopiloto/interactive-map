# Spec Delta

## Purpose

Garante que o retrato de um Personagem (`NPC.retrato_url`, já suportado pelo backend) seja exibido em todo lugar de `frontend-v2/` onde ele já era exibido no `frontend/` legado: no editor de Personagem, no painel de detalhe e nos nós do grafo de Relações.

## ADDED Requirements

### Requirement: Prévia do retrato no editor de Personagem
O editor de Personagem (tela de Relações, Modo GM) SHALL mostrar o retrato atual do Personagem, se existir, antes do campo de upload de um novo arquivo.

#### Scenario: Personagem já tem retrato
- **WHEN** o mestre abre o editor de um Personagem que já tem `retrato_url`
- **THEN** a imagem atual aparece no editor, acima do campo de upload

#### Scenario: Upload de um novo retrato atualiza a prévia
- **WHEN** o mestre envia um novo arquivo de imagem pelo editor
- **THEN** a prévia exibida passa a mostrar a imagem recém-enviada

### Requirement: Retrato no painel de detalhe do Personagem
O painel de detalhe de um Personagem (acessado pelo grafo de Relações, visível a qualquer visitante quando o Personagem é visível) SHALL mostrar o retrato, se existir, no topo do painel.

#### Scenario: Personagem visível com retrato
- **WHEN** qualquer visitante abre o painel de detalhe de um Personagem visível que tem retrato
- **THEN** a imagem aparece no topo do painel

#### Scenario: Personagem sem retrato não mostra espaço quebrado
- **WHEN** o Personagem não tem `retrato_url`
- **THEN** o painel não reserva nem mostra nenhum espaço de imagem quebrada — mostra só o conteúdo textual, como já acontece hoje

### Requirement: Retrato recortado em círculo nos nós do grafo de Relações
Cada nó do grafo de Relações SHALL mostrar o retrato do Personagem, recortado em círculo, quando `retrato_url` existir e carregar com sucesso. Quando não houver retrato, ou quando a imagem falhar ao carregar, o nó SHALL mostrar as iniciais do nome, como já acontece hoje.

#### Scenario: Personagem com retrato válido
- **WHEN** o grafo renderiza um Personagem com `retrato_url` que carrega com sucesso
- **THEN** o nó mostra a imagem recortada em círculo, preenchendo o espaço do nó

#### Scenario: Retrato falha ao carregar
- **WHEN** a URL do retrato não carrega (ex. arquivo removido, erro de rede)
- **THEN** o nó mostra as iniciais do nome, exatamente como um Personagem sem retrato nenhum — nunca um ícone de imagem quebrada do navegador

#### Scenario: Anel de destaque de PJ continua visível com retrato
- **WHEN** um Personagem com `tipo = "pj"` tem retrato
- **THEN** o anel de destaque ao redor do nó (já usado hoje pra distinguir PJ de NPC) continua visível, por cima da imagem
