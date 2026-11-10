"""create ateliers table

Revision ID: 20261101_0001
Revises:
Create Date: 2026-11-01

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261101_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ateliers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("owner_user_id", sa.UUID(), nullable=False),
        sa.Column("nom", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("specialite", sa.String(length=255), nullable=False),
        sa.Column("ville", sa.String(length=120), nullable=False),
        sa.Column("quartier", sa.String(length=120), nullable=True),
        sa.Column("telephone_whatsapp", sa.String(length=40), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("couverture_url", sa.String(length=500), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ateliers_owner_user_id", "ateliers", ["owner_user_id"])
    op.create_index("ix_ateliers_ville", "ateliers", ["ville"])


def downgrade() -> None:
    op.drop_index("ix_ateliers_ville", table_name="ateliers")
    op.drop_index("ix_ateliers_owner_user_id", table_name="ateliers")
    op.drop_table("ateliers")
