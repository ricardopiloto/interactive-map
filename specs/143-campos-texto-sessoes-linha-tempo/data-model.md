# Data Model: Campos de texto padronizados em Sessões e Linha do Tempo

Esta feature não adiciona entidades, campos persistidos, relacionamentos ou regras de validação. A mudança é apenas de apresentação dos controles usados para editar dados existentes.

## Sessão (existente)

- `titulo`: texto de uma linha, obrigatório.
- `data_rotulo`: rótulo textual livre e opcional.
- `resumo`: conteúdo textual opcional editado com Markdown.

## Evento da Linha do Tempo (existente)

- `titulo`: texto de uma linha, obrigatório.
- `rotulo_era`: rótulo textual livre e opcional.
- `descricao`: conteúdo textual opcional editado com Markdown.

## Invariantes

- Tipos, limites, valores, payloads e validação permanecem inalterados.
- A área de escrita Markdown continua editável e sua prévia continua somente para leitura.
- Número da Sessão, ano/mês do Evento, associações, visibilidade e checkboxes não integram o escopo visual desta feature.
