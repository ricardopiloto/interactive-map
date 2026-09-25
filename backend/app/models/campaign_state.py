from datetime import datetime

from sqlmodel import Field, SQLModel


class CampaignState(SQLModel, table=True):
    """Operational singleton in each campaign DB; never contains narrative data."""

    __tablename__ = "campaign_state"

    id: int = Field(default=1, primary_key=True)
    modificado_em: datetime | None = Field(default=None)
