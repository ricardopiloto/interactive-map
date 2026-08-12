from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.vinculo import VinculoTipo


class VinculoCreate(BaseModel):
    personagem_a_id: int
    personagem_b_id: int
    tipo: VinculoTipo
    nota: str = Field(default="", max_length=500)
    publico: bool = False

    @model_validator(mode="after")
    def reject_self_link(self) -> "VinculoCreate":
        if self.personagem_a_id == self.personagem_b_id:
            raise ValueError("Vínculo não pode ligar um personagem a si mesmo")
        return self


class VinculoUpdate(BaseModel):
    personagem_a_id: Optional[int] = None
    personagem_b_id: Optional[int] = None
    tipo: Optional[VinculoTipo] = None
    nota: Optional[str] = Field(default=None, max_length=500)
    publico: Optional[bool] = None


class VinculoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    personagem_a_id: int
    personagem_b_id: int
    tipo: VinculoTipo
    nota: str
    publico: bool
