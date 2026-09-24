# Quickstart: Tema visual da campanha editável

**Feature**: `146-tema-campanha-editavel`  
**Pré-requisitos**: stack local da aplicação disponível, conta do dono e uma segunda conta participante; campanhas de teste A e B.

## 1. Testes de API e isolamento

Escreva primeiro os testes previstos em `backend/tests/test_campanha_genero_http.py` e amplie `backend/tests/test_isolation_http.py` antes de implementar a rota.

```bash
cd backend
source .venv/bin/activate
pytest -q tests/test_campanha_genero_http.py tests/test_isolation_http.py
```

Valide no mínimo:

1. Dono altera gênero para cada opção permitida; resposta e banco retornam o valor persistido.
2. Configuração pública de A após atualização expõe o novo gênero; a configuração de B conserva o próprio gênero.
3. Usuário anônimo recebe `401`; participante que não é dono recebe `403`; campanha ausente/inativa recebe `404`.
4. Valor inválido não altera nenhum dado e devolve o erro documentado.
5. `sistema` e demais atributos da campanha não mudam.

## 2. Regressão do domínio de gêneros

```bash
cd backend
source .venv/bin/activate
pytest -q tests/test_genero_identidade.py tests/test_visibilidade_patch.py
```

Confirme que a criação, a leitura de configuração, as paletas e as mutações existentes seguem funcionando sem migration nova.

## 3. Fluxo do dono no Painel

1. Entrar como dono e abrir `/painel`.
2. Em uma campanha, selecionar outro gênero; cancelar e confirmar que o valor salvo não mudou.
3. Selecionar novamente e salvar; confirmar que o cartão apresenta o gênero confirmado.
4. Simular resposta de erro/rede: nenhuma confirmação falsa deve aparecer, e o valor anterior continua selecionado como salvo.
5. Reabrir a campanha alterada e confirmar que sua configuração usa a paleta correspondente.

## 4. Propagação e isolamento visual

1. Abrir a mesma campanha em outra sessão/conta participante e recarregar; confirmar que usa o gênero compartilhado salvo.
2. Navegar para outra campanha com gênero distinto; confirmar que cada uma mantém sua própria identidade.
3. Repetir com preferência pessoal `light`, `dark` e `auto`: Fantasia respeita a preferência existente; Gótico, Sci-Fi e Urbano forçam modo escuro enquanto ativos; ao sair para contexto sem campanha, a preferência pessoal continua vigente.

## 5. Idiomas e build

Trocar o idioma entre pt-BR e en e validar rótulos, salvar, cancelar, processamento e erros. Confirmar que os quatro nomes de gênero são compreensíveis e que a preferência pessoal continua separada.

```bash
cd frontend
npm run build
```

**Referências**: [API](./contracts/genero-api.md), [Painel](./contracts/painel-tema.md), [modelo de dados](./data-model.md).
