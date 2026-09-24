# Data Model: Filtros consistentes em Relações

Esta feature não altera entidades persistidas nem contratos de dados. Os filtros são estados transitórios da interface aplicados aos personagens e vínculos já carregados para a campanha.

## Seleção de tipos

- **Conteúdo**: conjunto de tipos de vínculo selecionados.
- **Estado vazio**: ausência de restrição por tipo; todos os vínculos elegíveis passam pelo critério de tipo.
- **Seleção parcial**: um vínculo passa se qualquer tipo/direção que ele apresenta corresponder a pelo menos um tipo selecionado.
- **Transições**: clique simples alterna inclusão do tipo; duplo-clique isola aquele tipo; duplo-clique no tipo já isolado retorna ao estado vazio.
- **Persistência**: nenhuma; a seleção vive somente na tela.

## Filtro de status e busca

- Status restringe o conjunto de personagens visíveis e, por consequência, vínculos cujas duas pontas permanecem nesse conjunto.
- Busca textual restringe os itens da lista do SidePanel e fornece correspondência para destaque no grafo; não exclui nós do grafo apenas pela ausência de correspondência textual.
- Estado de status e busca não é persistido como parte da campanha.

## Seleção e isolamento

- A seleção referencia um `Personagem` já presente no conjunto visível.
- Isolamento é um estado transitório ligado à seleção e restringe as arestas aos vínculos incidentes ao personagem selecionado depois da aplicação do filtro de tipo.
- Se um filtro de status remove o personagem selecionado do conjunto visível, a seleção e o isolamento são limpos.

## Entidades existentes

- **Personagem**: identificador, nome, status e dados atuais usados pela página.
- **Vínculo**: identificadores dos personagens nas duas pontas e tipo associado a cada direção, quando presente.

Não há validações, campos, relacionamentos, migrações ou payloads novos.
