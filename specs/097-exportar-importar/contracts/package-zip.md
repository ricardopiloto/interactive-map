# Contract: Pacote zip

**Feature**: 097  
**Format**: layout + regras de validação

## Layout

```text
manifest.json          # obrigatório
content.json           # obrigatório
uploads/map/*          # opcional; só ficheiros regulares
uploads/portraits/*
uploads/locals/*
```

## Regras

1. Encoding UTF-8 nos JSON.
2. Nomes de ficheiro de imagem: basename sem `/` nem `..`.
3. Paths no zip MUST ser relativos; reject absolute e `..`.
4. Compressão: DEFLATE ou STORED.
5. Entrada proibida: qualquer path fora da lista (ex.: `campanha.db`, `README`, `data/…`).
6. `package_format` MUST ser `1` nesta revisão do contrato.

## Manifesto — schema mínimo

Ver [data-model.md](../data-model.md). Campos desconhecidos no manifesto: ignorar (forward-compatible) **excepto** se `package_format` > suportado → recusa.

## content.json — schema mínimo

Ver data-model. Arrays ausentes tratam-se como `[]`; `map_scale` ausente = null.

## Resposta de validação (lógica interna)

Códigos sugeridos (corpo HTTP/CLI):

| Código | Quando |
|--------|--------|
| `PACOTE_INVALIDO` | Zip corrompido / não é zip |
| `ENTRADA_PROIBIDA` | Path fora do contrato |
| `MANIFESTO_INVALIDO` | JSON/campos obrigatórios |
| `CONTEUDO_INVALIDO` | JSON / FK quebrada / imagem em falta |
| `SCHEMA_FUTURO` | Revisão desconhecida / mais nova |
| `SCHEMA_DESCONHECIDO` | Id antigo sem migrator |
| `SISTEMA_DESCONHECIDO` | `sistema` não suportado |
| `COTA_EXCEDIDA` | Imagens > cota default |
| `ZIP_DEMASIADO_GRANDE` | Uncompressed > tecto |
