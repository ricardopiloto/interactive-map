# Spec Delta

## ADDED Requirements

### Requirement: Rascunho da sessão propõe combates como blocos de combate

O prompt do rascunho da sessão SHALL instruir a IA a propor combates planejados no formato do bloco de combate das Notas de Preparo (`> [!combate] Título` seguido de lista com Inimigos, Ambiente, Tática ou gatilho e Desfecho), nascendo do contexto (fios, arcos, personagens, locais), só onde uma cena pedir conflito e em número reduzido. O prompt SHALL proibir estatísticas e termos mecânicos nos combates, usando o marcador de mecânica a definir onde a mecânica seria necessária, e SHALL declarar que a instrução do mestre prevalece, inclusive para pedir mais combates ou nenhum. A sintaxe do bloco de combate SHALL ser explicitamente permitida pelas regras de saída do prompt. Como o resto do rascunho, a proposta SHALL passar pela revisão antes de entrar nas Notas de Preparo. A obediência do modelo a essas instruções não é garantida pelo sistema; formato fora do padrão é exibido como texto comum.

#### Scenario: Prompt do rascunho instrui combates

- **WHEN** o prompt do rascunho da sessão é montado
- **THEN** ele contém o formato do bloco de combate, a regra de propor só onde houver conflito, a proibição de estatísticas com o marcador de mecânica a definir e a precedência da instrução do mestre

#### Scenario: Instrução do mestre prevalece

- **WHEN** o mestre pede o rascunho com a instrução de não ter combates
- **THEN** o prompt enviado contém essa instrução e a declaração de que ela prevalece sobre a proposta de combates

#### Scenario: Sintaxe do bloco permitida

- **WHEN** o prompt é montado
- **THEN** as regras de saída que proíbem links wiki, frontmatter e prompts de imagem excetuam expressamente a sintaxe `> [!combate]`

### Requirement: Resumo e contexto não tratam combate planejado como ocorrido

O prompt do Resumo SHALL instruir a IA a não copiar blocos de combate das Notas de Preparo como fatos ocorridos. O contexto enviado à IA SHALL omitir os blocos de combate presentes nas notas de preparo de sessões diferentes da sessão alvo (tanto no texto da sessão que usa as notas na ausência de resumo quanto nas notas de sessões anteriores), de modo que um combate planejado numa sessão não jogada não seja lido como acontecimento.

#### Scenario: Prompt do Resumo

- **WHEN** o prompt do Resumo é montado
- **THEN** ele contém a instrução de não copiar blocos de combate como fatos ocorridos

#### Scenario: Notas anteriores com combate planejado

- **WHEN** uma sessão anterior tem notas de preparo com um bloco de combate e o mestre pede o rascunho de outra sessão
- **THEN** o contexto enviado inclui o restante das notas dessa sessão anterior, mas não o bloco de combate

#### Scenario: Notas da sessão alvo preservadas

- **WHEN** o mestre pede o Resumo ou o rascunho de uma sessão cujas próprias notas têm blocos de combate
- **THEN** as notas da sessão alvo são enviadas inteiras, e a instrução do prompt orienta a IA sobre como tratá-las
