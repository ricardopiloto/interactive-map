from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.vinculo import VinculoDirecao, VinculoTipo


def normalize_tipos(
    tipo_ab: VinculoTipo, tipo_ba: Optional[VinculoTipo]
) -> tuple[VinculoTipo, Optional[VinculoTipo]]:
    """Equal tipos collapse to reciprocal (tipo_ba=null)."""
    if tipo_ba is not None and tipo_ba == tipo_ab:
        return tipo_ab, None
    return tipo_ab, tipo_ba


def is_duas_vias(tipo_ab: VinculoTipo, tipo_ba: Optional[VinculoTipo]) -> bool:
    return tipo_ba is not None and tipo_ba != tipo_ab


def flip_direcao(direcao: Optional[VinculoDirecao]) -> Optional[VinculoDirecao]:
    if direcao is None:
        return None
    if direcao == VinculoDirecao.a_para_b:
        return VinculoDirecao.b_para_a
    return VinculoDirecao.a_para_b


def _trim_qual(v: str) -> str:
    return (v or "").strip()


class VinculoCreate(BaseModel):
    personagem_a_id: int
    personagem_b_id: int
    tipo_ab: VinculoTipo
    tipo_ba: Optional[VinculoTipo] = None
    nota_ab: str = Field(default="", max_length=500)
    nota_ba: str = Field(default="", max_length=500)
    publico: bool = False
    conhecido_ab: bool = True
    conhecido_ba: bool = True
    qualificador_ab: str = Field(default="", max_length=80)
    qualificador_ba: str = Field(default="", max_length=80)
    direcao: Optional[VinculoDirecao] = None

    @field_validator("qualificador_ab", "qualificador_ba")
    @classmethod
    def trim_qualificadores(cls, v: str) -> str:
        return _trim_qual(v)

    @model_validator(mode="after")
    def reject_self_link_and_normalize(self) -> "VinculoCreate":
        if self.personagem_a_id == self.personagem_b_id:
            raise ValueError("Vínculo não pode ligar um personagem a si mesmo")
        tipo_ab, tipo_ba = normalize_tipos(self.tipo_ab, self.tipo_ba)
        self.tipo_ab = tipo_ab
        self.tipo_ba = tipo_ba
        if tipo_ba is None:
            self.nota_ba = ""
            self.qualificador_ba = ""
        return self


class VinculoUpdate(BaseModel):
    personagem_a_id: Optional[int] = None
    personagem_b_id: Optional[int] = None
    tipo_ab: Optional[VinculoTipo] = None
    tipo_ba: Optional[VinculoTipo] = None
    nota_ab: Optional[str] = Field(default=None, max_length=500)
    nota_ba: Optional[str] = Field(default=None, max_length=500)
    publico: Optional[bool] = None
    conhecido_ab: Optional[bool] = None
    conhecido_ba: Optional[bool] = None
    qualificador_ab: Optional[str] = Field(default=None, max_length=80)
    qualificador_ba: Optional[str] = Field(default=None, max_length=80)
    direcao: Optional[VinculoDirecao] = None

    @field_validator("qualificador_ab", "qualificador_ba")
    @classmethod
    def trim_qualificadores(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return _trim_qual(v)


class VinculoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    personagem_a_id: int
    personagem_b_id: int
    tipo_ab: Optional[VinculoTipo] = None
    tipo_ba: Optional[VinculoTipo] = None
    nota_ab: str = ""
    nota_ba: str = ""
    publico: bool
    conhecido_ab: Optional[bool] = None
    conhecido_ba: Optional[bool] = None
    qualificador_ab: str = ""
    qualificador_ba: str = ""
    direcao: Optional[VinculoDirecao] = None
