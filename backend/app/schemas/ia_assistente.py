from typing import Literal

from pydantic import BaseModel, Field

TipoAssistencia = Literal[
    "rascunho_sessao", "resumo_sessao", "descricao_personagem", "descricao_local"
]


class AssistirRequest(BaseModel):
    tipo: TipoAssistencia
    texto_atual: str = Field(default="", max_length=50000)
    instrucao: str = Field(default="", max_length=5000)
    alvo_id: int | None = Field(default=None, gt=0)
    campo_publico: bool = True


class AssistirResponse(BaseModel):
    estado: Literal["sugestao", "vazio", "falha"]
    texto: str | None = None
    mensagem: str = ""
    usou_conteudo_oculto: bool = False
    truncado: bool = False
    limite_caracteres: int
    campo_destino: str
