# UI Contract: Markdown na descrição do pin

Escopo: leitura em `PinModal`; edição em `LocalFormDialog` (hint apenas).

## Must

| Situação | Comportamento |
|----------|----------------|
| Jogador abre pin com texto puro | Texto legível, sem artefatos estranhos |
| Jogador abre pin com MD (negrito, lista, título, link https) | Formatação visível; link abre em nova aba |
| `![alt](url)` na descrição | Sem `<img>` / sem request de rede pela imagem |
| Link `javascript:…` ou esquema não http(s) | Não navegável como link ativo |
| HTML/`<script>` no texto | Não executado |
| Form GM — label descrição | Indicação breve “Markdown opcional” (ou equivalente) |
| Form GM | Sem preview / botão pré-visualizar |

## Must not

- Alterar renderização de descrições de NPC/arco nesta entrega
- Exigir flag ou modo “ativar Markdown”
- Mudar API/schema de `descricao`

## Componente sugerido

`MarkdownSafe` props: `{ children: string }` (ou `source`).

- Empty / whitespace → caller pode mostrar “Sem descrição.”
- Links: `target="_blank"` + `rel="noopener noreferrer"` quando http(s)
- `img`: não renderizar

## Acceptance check

1. Descrição `**negrito** e [site](https://example.com)` → negrito + link nova aba.  
2. Descrição `![x](https://example.com/a.png)` → sem imagem carregada.  
3. Descrição `<script>alert(1)</script>` → sem alert.  
4. Form local mostra hint Markdown; sem UI de preview.
