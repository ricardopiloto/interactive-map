# Spec Delta

## Purpose

Dá a cada NPC uma ficha mecânica estruturada e correta para o sistema de jogo da campanha a que pertence, separada da descrição narrativa, para que o mestre tenha a ficha certa (WFRP, WoD, ...) em vez de um texto livre genérico.

## ADDED Requirements

### Requirement: Stat block separado da descrição narrativa
Um NPC SHALL ter um campo estruturado `stat_block`, distinto do campo narrativo `descricao` já existente. Alterar `stat_block` SHALL NOT exigir nem afetar o conteúdo de `descricao`, e vice-versa.

#### Scenario: Editar stat block sem tocar na narrativa
- **WHEN** um mestre atualiza apenas o `stat_block` de um NPC
- **THEN** o `descricao` do NPC permanece inalterado

### Requirement: Formato do stat block é definido pelo sistema da campanha
O formato aceito para `stat_block` SHALL ser determinado pelo `sistema` da campanha à qual o NPC pertence (os mesmos valores já usados em `Campanha.sistema`, por exemplo `wfrp` e `wod`). Um NPC SHALL NOT poder gravar um `stat_block` em formato de um sistema diferente do sistema da sua campanha.

#### Scenario: Gravar stat block de WFRP numa campanha WFRP
- **WHEN** um mestre grava em um NPC de uma campanha `wfrp` um `stat_block` com os campos definidos para esse sistema (características, perícias, talentos, pertences)
- **THEN** o sistema aceita e persiste o `stat_block`

### Requirement: Validação de campos do stat block por sistema
O sistema SHALL validar o payload de `stat_block` contra os campos definidos para o sistema da campanha. Um payload com campos desconhecidos para aquele sistema, ou com um valor de tipo incompatível com o campo esperado, SHALL ser rejeitado com um erro estruturado identificando o problema, sem gravar alterações parciais.

#### Scenario: Rejeitar campo desconhecido
- **WHEN** um mestre envia um `stat_block` contendo um campo que não existe na definição do sistema da campanha
- **THEN** o sistema rejeita a requisição inteira com um erro estruturado e o `stat_block` anterior do NPC permanece inalterado

#### Scenario: Rejeitar sistema sem template registrado
- **WHEN** um mestre tenta gravar `stat_block` num NPC de uma campanha cujo `sistema` não tem um template de stat block registrado
- **THEN** o sistema rejeita a requisição com um erro estruturado indicando que o sistema não é suportado para stat block

### Requirement: Descoberta do schema de campos pelo cliente
A API administrativa SHALL expor, para uma campanha, a definição de campos do stat block do seu sistema (nome do campo, rótulo e tipo), permitindo que a interface monte o formulário de edição correto sem precisar conhecer o sistema de antemão.

#### Scenario: UI monta formulário a partir do schema
- **WHEN** a interface administrativa abre o editor de um NPC de uma campanha `wod`
- **THEN** ela obtém do backend a definição de campos do stat block de `wod` e renderiza um formulário correspondente, diferente do formulário usado para `wfrp`

### Requirement: Renderização do stat block em markdown
O sistema SHALL ser capaz de converter o `stat_block` de um NPC num texto em markdown legível, formatado de acordo com as convenções do sistema daquele NPC (por exemplo, tabela de características e listas de perícias/talentos para WFRP). A tabela de características SHALL usar colunas alinhadas ao centro (`:-:`), replicando a convenção de tabela já usada pelo mestre em suas fichas fora do produto.

#### Scenario: Renderizar stat block para exibição
- **WHEN** o sistema precisa apresentar a ficha mecânica de um NPC como texto (por exemplo, numa visão administrativa de detalhe)
- **THEN** ele produz o `stat_block` renderizado em markdown, consistente com o sistema da campanha do NPC

#### Scenario: Tabela de características com alinhamento centralizado
- **WHEN** o sistema renderiza em markdown um `stat_block` que contém campos numéricos de características
- **THEN** a tabela gerada usa uma linha separadora com alinhamento centralizado (`:-:`) para cada coluna, não um separador neutro (`---`)

### Requirement: Campos numéricos de características são apresentados como tabela, não como campos soltos
Os campos do tipo numérico (`int`) do stat block de um sistema — as características de combate do personagem — SHALL ser apresentados como uma única tabela, com uma linha de cabeçalho contendo os rótulos curtos dos campos e uma linha com os valores correspondentes, tanto na edição quanto na visualização. Esses campos SHALL NOT ser apresentados como campos isolados empilhados verticalmente. A ordem das colunas SHALL seguir a ordem em que os campos são declarados no schema do sistema. Colunas sem valor preenchido SHALL permanecer visíveis na tabela. Campos de outros tipos (listas e texto livre) do mesmo stat block SHALL continuar sendo apresentados fora dessa tabela.

#### Scenario: Editor mostra características como tabela única
- **WHEN** um mestre abre o editor de stat block de um NPC
- **THEN** os campos numéricos de características aparecem como uma única tabela editável — uma linha de cabeçalho com os rótulos e uma linha de campos de entrada abaixo — em vez de um campo por linha

#### Scenario: Visualização mostra as mesmas características como tabela
- **WHEN** um mestre consulta o stat block já preenchido de um NPC numa superfície administrativa de leitura
- **THEN** os campos numéricos de características aparecem como uma tabela (cabeçalho e linha de valores), no mesmo formato visual usado na edição

#### Scenario: Característica sem valor continua visível na tabela
- **WHEN** um stat block tem alguma característica numérica sem valor preenchido
- **THEN** a coluna dessa característica continua aparecendo na tabela, tanto na edição quanto na visualização, em vez de ser omitida

### Requirement: Stat block nunca é exposto a jogadores
A API pública (não autenticada como mestre) SHALL NOT incluir o campo `stat_block` em nenhuma resposta, independentemente do valor de `visivel_para_todos` do NPC. A visibilidade de `stat_block` é sempre restrita a membros autorizados da campanha.

#### Scenario: Jogador lê NPC visível sem receber stat block
- **WHEN** um jogador consulta publicamente um NPC com `visivel_para_todos` verdadeiro e `stat_block` preenchido
- **THEN** a resposta inclui a descrição narrativa do NPC, mas não inclui `stat_block`

### Requirement: Compatibilidade com NPCs existentes
NPCs criados antes desta mudança SHALL continuar funcionando normalmente, com `stat_block` tratado como ausente/vazio até que um mestre o preencha explicitamente. Nenhuma migração de dados de `descricao` para `stat_block` SHALL ser feita automaticamente.

#### Scenario: Ler NPC antigo sem stat block
- **WHEN** um NPC criado antes desta mudança é lido pela API administrativa
- **THEN** o campo `stat_block` é retornado vazio, sem erro, e o restante dos dados do NPC permanece intacto
