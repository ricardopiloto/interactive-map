from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.vinculo import VinculoTipo


def normalize_tipos(
    tipo_ab: VinculoTipo, tipo_ba: Optional[VinculoTipo]
) -> tuple[VinculoTipo, Optional[VinculoTipo]]:
    """Equal tipos collapse to reciprocal (tipo_ba=null)."""
    if tipo_ba is not None and tipo_ba == tipo_ab:
        return tipo_ab, None
    return tipo_ab, tipo_ba


class VinculoCreate(BaseModel):
    personagem_a_id: int
    personagem_b_id: int
    tipo_ab: VinculoTipo
    tipo_ba: Optional[VinculoTipo] = None
    nota_ab: str = Field(default="", max_length=500)
    nota_ba: str = Field(default="", max_length=500)
    publico: bool = False

    @model_validator(mode="after")
    def reject_self_link_and_normalize(self) -> "VinculoCreate":
        if self.personagem_a_id == self.personagem_b_id:
            raise ValueError("Vínculo não pode ligar um personagem a si mesmo")
        tipo_ab, tipo_ba = normalize_tipos(self.tipo_ab, self.tipo_ba)
        self.tipo_ab = tipo_ab
        self.tipo_ba = tipo_ba
        if tipo_ba is None:
            self.nota_ba = ""
        return self


class VinculoUpdate(BaseModel):
    personagem_a_id: Optional[int] = None
    personagem_b_id: Optional[int] = None
    tipo_ab: Optional[VinculoTipo] = None
    tipo_ba: Optional[VinculoTipo] = None
    nota_ab: Optional[str] = Field(default=None, max_length=500)
    nota_ba: Optional[str] = Field(default=None, max_length=500)
    publico: Optional[bool] = None


class VinculoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    personagem_a_id: int
    personagem_b_id: int
    tipo_ab: VinculoTipo
    tipo_ba: Optional[VinculoTipo] = None
    nota_ab: str = ""
    nota_ba: str = ""
    publico: bool
