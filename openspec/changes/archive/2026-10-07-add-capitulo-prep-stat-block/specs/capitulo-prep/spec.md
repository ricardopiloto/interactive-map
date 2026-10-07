# Spec Delta

## Purpose

Dá ao mestre um lugar dentro do Campaign Codex para preparar o conteúdo de uma aventura antes de jogá-la — cenário, desenvolvimento, encontros e handouts — organizado em Capítulos dentro de um Arco, distinto da crônica pós-jogo já registrada em Sessão.

## ADDED Requirements

### Requirement: Vínculo opcional entre Capítulo e Arco
Um Capítulo SHALL poder existir sem nenhum Arco associado (`arco_id` opcional) — o mestre pode preparar um Capítulo avulso. Quando um `arco_id` é informado, o sistema SHALL validar que o Arco existe na mesma campanha e SHALL rejeitar a criação ou atualização de um Capítulo que referencie um Arco inexistente ou de outra campanha.

#### Scenario: Criar capítulo num arco existente
- **WHEN** um mestre autorizado cria um Capítulo informando um `arco_id` válido da própria campanha
- **THEN** o sistema cria o Capítulo associado a esse Arco e retorna seus dados, incluindo um `ordem` atribuído

#### Scenario: Criar capítulo sem arco
- **WHEN** um mestre autorizado cria um Capítulo sem informar `arco_id`
- **THEN** o sistema cria o Capítulo normalmente, sem nenhum Arco associado

#### Scenario: Rejeitar arco inexistente
- **WHEN** um mestre tenta criar ou atualizar um Capítulo informando um `arco_id` que não existe na campanha
- **THEN** o sistema rejeita a requisição com um erro estruturado e não aplica a alteração

### Requirement: Corpo do Capítulo é um texto único em markdown
Cada Capítulo SHALL ter um único campo de corpo em markdown (`corpo_markdown`) onde cenário, desenvolvimento, encontros e handouts são escritos como texto corrido, sem exigir subcampos estruturados separados para cada seção narrativa.

#### Scenario: Salvar capítulo com conteúdo livre
- **WHEN** um mestre salva um Capítulo cujo `corpo_markdown` contém seções de cenário, um encontro de combate e um handout, todos como texto markdown
- **THEN** o sistema persiste o conteúdo integralmente, sem exigir que essas seções sejam campos separados

### Requirement: Capítulos são ordenáveis
O sistema SHALL permitir que um mestre defina e altere a ordem de exibição dos Capítulos. Essa ordenação SHALL ser mantida separadamente para os Capítulos de cada Arco e para o conjunto de Capítulos sem Arco. A listagem de Capítulos SHALL respeitar essa ordem dentro de cada um desses grupos.

#### Scenario: Reordenar capítulos de um arco
- **WHEN** um mestre altera o `ordem` de um Capítulo dentro do seu Arco
- **THEN** a listagem subsequente de Capítulos desse Arco reflete a nova ordem

#### Scenario: Reordenar capítulos avulsos
- **WHEN** um mestre altera o `ordem` de um Capítulo que não tem Arco associado
- **THEN** a listagem subsequente de Capítulos sem Arco reflete a nova ordem

### Requirement: Sessão pode referenciar o Capítulo que foi jogado
Uma Sessão SHALL poder referenciar, no máximo, um Capítulo existente da mesma campanha (`capitulo_id` opcional em Sessão), indicando qual conteúdo de preparação foi jogado naquela Sessão. Um mesmo Capítulo SHALL poder ser referenciado por várias Sessões — por exemplo, quando seu conteúdo é jogado ao longo de mais de uma sessão de mesa. O sistema SHALL rejeitar a referência a um Capítulo inexistente ou de outra campanha.

#### Scenario: Vincular sessão a um capítulo jogado
- **WHEN** um mestre define `capitulo_id` de uma Sessão para um Capítulo existente da campanha
- **THEN** o sistema grava o vínculo e passa a expor esse Capítulo ao consultar a Sessão

#### Scenario: Mesmo capítulo jogado em várias sessões
- **WHEN** duas Sessões diferentes da campanha são definidas com o mesmo `capitulo_id`
- **THEN** o sistema aceita ambos os vínculos, sem erro de duplicidade

#### Scenario: Rejeitar capítulo inexistente
- **WHEN** um mestre tenta definir o `capitulo_id` de uma Sessão para um Capítulo que não existe na campanha
- **THEN** o sistema rejeita a requisição com um erro estruturado e não aplica a alteração

#### Scenario: Desfazer vínculo
- **WHEN** um mestre remove o `capitulo_id` de uma Sessão previamente vinculada
- **THEN** a Sessão volta a não ter Capítulo associado e o Capítulo referenciado permanece intacto (nunca é apagado por uma operação sobre a Sessão)

### Requirement: Arco de uma Sessão vinculada a Capítulo é sincronizado automaticamente
Quando uma Sessão tem um `capitulo_id` definido, o `arco_id` dessa Sessão SHALL ser mantido automaticamente igual ao `arco_id` do Capítulo referenciado, incluindo nulo quando o Capítulo não tem Arco. O sistema SHALL recalcular esse valor sempre que o `capitulo_id` da Sessão mudar ou o `arco_id` do Capítulo referenciado mudar. Enquanto uma Sessão tiver `capitulo_id` definido, uma tentativa de definir diretamente nela um `arco_id` diferente do valor sincronizado SHALL ser rejeitada com um erro estruturado, orientando o mestre a alterar o Arco pelo Capítulo ou a remover o vínculo primeiro. Assim que o vínculo é removido, o `arco_id` SHALL manter o último valor sincronizado e volta a ser livremente editável.

#### Scenario: Vincular sessão a capítulo sincroniza o arco
- **WHEN** um mestre vincula uma Sessão a um Capítulo que tem `arco_id` definido
- **THEN** a Sessão passa a ter esse mesmo `arco_id`, substituindo qualquer valor anterior

#### Scenario: Mudar o arco do capítulo propaga para as sessões vinculadas
- **WHEN** um mestre altera o `arco_id` de um Capítulo que já tem Sessões vinculadas (inclusive removendo-o)
- **THEN** todas essas Sessões passam a refletir o novo `arco_id` automaticamente

#### Scenario: Rejeitar edição direta de arco numa sessão vinculada
- **WHEN** um mestre tenta definir manualmente um `arco_id` diferente do sincronizado numa Sessão que tem `capitulo_id` definido
- **THEN** o sistema rejeita a requisição com um erro estruturado e o `arco_id` da Sessão permanece o sincronizado

#### Scenario: Desvincular capítulo libera edição direta do arco
- **WHEN** um mestre remove o `capitulo_id` de uma Sessão
- **THEN** o `arco_id` dessa Sessão mantém o último valor sincronizado, mas passa a poder ser editado diretamente de novo

### Requirement: Visibilidade do Capítulo para jogadores
Um Capítulo SHALL ter uma flag `visivel_para_todos`. A API pública (não autenticada como mestre) SHALL retornar apenas Capítulos com `visivel_para_todos` verdadeiro. A API administrativa SHALL sempre retornar todos os Capítulos da campanha, independentemente dessa flag.

#### Scenario: Jogador não vê capítulo oculto
- **WHEN** um Capítulo tem `visivel_para_todos` falso
- **THEN** a listagem e a leitura pública de Capítulos daquele Arco não incluem esse Capítulo

#### Scenario: Mestre vê todos os capítulos
- **WHEN** um mestre autenticado lista os Capítulos de um Arco
- **THEN** a resposta inclui Capítulos visíveis e ocultos aos jogadores

### Requirement: Capítulos são listáveis com ou sem filtro de Arco
O sistema SHALL permitir listar os Capítulos de uma campanha sem exigir um `arco_id`. Quando um `arco_id` é informado como filtro, a listagem SHALL retornar apenas os Capítulos daquele Arco. A listagem sem filtro SHALL incluir tanto Capítulos vinculados a algum Arco quanto Capítulos sem Arco.

#### Scenario: Listar todos os capítulos da campanha
- **WHEN** um mestre lista Capítulos sem informar `arco_id`
- **THEN** a resposta inclui Capítulos de todos os Arcos da campanha e os Capítulos sem Arco

#### Scenario: Filtrar capítulos por arco
- **WHEN** um mestre lista Capítulos informando um `arco_id`
- **THEN** a resposta inclui somente os Capítulos daquele Arco

### Requirement: Gestão de Capítulo restrita a membro autorizado da campanha
Criar, editar, reordenar, vincular/desvincular de Arco, e apagar um Capítulo SHALL exigir autenticação como membro da campanha, seguindo o mesmo controle de acesso já aplicado a Arco e Sessão. Vincular ou desvincular uma Sessão a um Capítulo SHALL seguir o mesmo controle de acesso, pela gestão de Sessão. Leitura pública SHALL permanecer disponível sem autenticação, sujeita à regra de visibilidade.

#### Scenario: Requisição não autenticada tenta criar capítulo
- **WHEN** uma requisição sem sessão de membro válida tenta criar, editar ou apagar um Capítulo
- **THEN** o sistema rejeita a requisição e nenhum dado é alterado

### Requirement: Remover Arco remove seus Capítulos
Apagar um Arco SHALL apagar todos os seus Capítulos. Capítulos sem Arco associado SHALL NOT ser afetados pela remoção de nenhum Arco. Essa remoção SHALL NOT apagar Sessões eventualmente vinculadas aos Capítulos removidos — apenas o vínculo é desfeito, seguindo a mesma regra de sincronização de arco já definida para quando um Capítulo é desvinculado de uma Sessão (a Sessão mantém o último `arco_id` sincronizado, agora editável livremente).

#### Scenario: Apagar arco com capítulos vinculados a sessões
- **WHEN** um mestre apaga um Arco que tem Capítulos, alguns vinculados a Sessões
- **THEN** os Capítulos desse Arco deixam de existir e as Sessões que estavam vinculadas a eles permanecem no sistema, sem Capítulo, com o `arco_id` mantido no último valor sincronizado

#### Scenario: Apagar arco não afeta capítulos avulsos
- **WHEN** um mestre apaga um Arco numa campanha que também tem Capítulos sem nenhum Arco associado
- **THEN** esses Capítulos avulsos permanecem inalterados

### Requirement: Apagar um Capítulo não apaga Sessões associadas
Apagar um Capítulo SHALL desfazer o vínculo de todas as Sessões que o referenciavam (`capitulo_id` volta a nulo), seguindo a mesma regra de sincronização de arco definida para o desvínculo manual. Apagar um Capítulo SHALL NOT apagar nenhuma Sessão.

#### Scenario: Apagar capítulo referenciado por sessões
- **WHEN** um mestre apaga um Capítulo que está referenciado por uma ou mais Sessões
- **THEN** essas Sessões permanecem no sistema, sem `capitulo_id`, com o `arco_id` mantido no último valor sincronizado e agora editável livremente

### Requirement: Isolamento por campanha
Capítulos SHALL permanecer isolados por campanha: um Capítulo de uma campanha SHALL NOT ser visível, editável ou referenciável a partir de outra campanha. Esta capability SHALL integrar a matriz de testes de isolamento já existente do produto.

#### Scenario: Capítulo de outra campanha não aparece
- **WHEN** uma requisição é feita no contexto da campanha A
- **THEN** Capítulos pertencentes à campanha B não aparecem em nenhuma listagem ou busca

### Requirement: Internacionalização da interface
Toda copy nova introduzida pela gestão de Capítulos (rótulos, mensagens de erro, estados vazios) SHALL estar disponível em pt-BR e en.

#### Scenario: Trocar idioma da interface
- **WHEN** um usuário troca o idioma da interface para en
- **THEN** os rótulos e mensagens da tela de Capítulos aparecem em inglês, sem strings fixas em português
