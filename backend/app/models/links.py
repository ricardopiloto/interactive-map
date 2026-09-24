from sqlmodel import Field, SQLModel


class LocalNPCLink(SQLModel, table=True):
    __tablename__ = "local_npc"

    local_id: int = Field(foreign_key="local.id", primary_key=True)
    npc_id: int = Field(foreign_key="npc.id", primary_key=True)


class LocalConexaoLink(SQLModel, table=True):
    """Directed exit: group left origem toward destino."""

    __tablename__ = "local_conexao"

    origem_id: int = Field(foreign_key="local.id", primary_key=True)
    destino_id: int = Field(foreign_key="local.id", primary_key=True)


class SessaoLocalLink(SQLModel, table=True):
    __tablename__ = "sessao_local"

    sessao_id: int = Field(foreign_key="sessao.id", primary_key=True)
    local_id: int = Field(foreign_key="local.id", primary_key=True)


class SessaoNpcLink(SQLModel, table=True):
    __tablename__ = "sessao_npc"

    sessao_id: int = Field(foreign_key="sessao.id", primary_key=True)
    npc_id: int = Field(foreign_key="npc.id", primary_key=True)
