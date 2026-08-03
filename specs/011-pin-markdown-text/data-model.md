# Data Model: 011-pin-markdown-text

Nenhuma alteração de schema SQLite, SQLModel ou contratos OpenAPI.

## Entidade existente

### Local — campo `descricao`

| Aspecto | Valor |
|---------|--------|
| Tipo | string (texto) |
| Conteúdo | Texto livre e/ou sintaxe Markdown opcional |
| Persistência | Inalterada (create/update admin + leitura pública) |
| Validação API | Regras atuais (sem parser Markdown no servidor) |
| Migração | Nenhuma — locais existentes continuam válidos |

## Entidades de UI

| Conceito | Descrição |
|----------|-----------|
| Texto bruto | Conteúdo em `LocalFormDialog` (textarea) e armazenamento |
| Texto renderizado | Saída segura em `PinModal` via `MarkdownSafe` |
| Subconjunto suportado | Ênfase, listas, títulos simples, links http/https |
| Explicitamente não renderizado | Imagens MD; HTML/script executável; links com esquemas inseguros |

## Transições

1. GM edita `descricao` → salva string → API persiste bytes/texto.
2. Jogador abre pin → cliente lê `descricao` → `MarkdownSafe` → DOM seguro.
3. String vazia → mensagem “Sem descrição.” (comportamento atual).

## Invariantes

- Armazenamento ≡ o que o GM digitou (round-trip no textarea).
- Render nunca executa script nem carrega `img` de Markdown.
- NPC/`arco` descriptions não entram neste modelo de feature.
