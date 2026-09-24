"""initial campaign content schema

Revision ID: 001_campaign
Revises:
Create Date: 2026-09-19

"""

from typing import Sequence, Union

from alembic import op
from sqlmodel import SQLModel

import app.models  # noqa: F401

revision: str = "001_campaign"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    SQLModel.metadata.create_all(bind)


def downgrade() -> None:
    bind = op.get_bind()
    SQLModel.metadata.drop_all(bind)
