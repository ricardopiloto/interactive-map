# Contract: Recusas de segurança (import)

**Feature**: 097

## Must refuse (400/409; zero efeitos)

| Cenário | Código |
|---------|--------|
| Não é zip / zip corrompido | `PACOTE_INVALIDO` |
| Contém `campanha.db` ou path fora do contrato | `ENTRADA_PROIBIDA` |
| Path com `..` ou absoluto | `ENTRADA_PROIBIDA` |
| Uncompressed size > tecto | `ZIP_DEMASIADO_GRANDE` |
| Manifesto inválido | `MANIFESTO_INVALIDO` |
| `schema_version` futura / sem migrator | `SCHEMA_FUTURO` / `SCHEMA_DESCONHECIDO` |
| `sistema` desconhecido | `SISTEMA_DESCONHECIDO` |
| FK / ID em falta | `CONTEUDO_INVALIDO` |
| Imagem referida ausente | `CONTEUDO_INVALIDO` |
| Bytes de imagens > cota default | `COTA_EXCEDIDA` |
| Slug origem ocupado e sem `--slug`/body livre | `SLUG_OCUPADO` |
| Slug inválido (formato 093) | `SLUG_INVALIDO` |

## Must not

- Abrir / migrar / copiar `.db` de utilizador para o sítio.
- Deixar pasta `campanhas/<uuid>/` órfã após falha.
- Inserir linha `Campanha` se a cópia de conteúdo falhou.
- Alterar campanha existente (import = sempre nova).

## Observabilidade

Log estruturado no servidor: `import_recusado code=…` sem dump do zip.
