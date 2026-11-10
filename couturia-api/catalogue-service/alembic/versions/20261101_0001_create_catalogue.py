"""create categories and creations

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
        "categories",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("nom", sa.String(length=120), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    op.create_table(
        "creations",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("atelier_id", sa.UUID(), nullable=False),
        sa.Column("category_id", sa.UUID(), nullable=False),
        sa.Column("titre", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("prix_indicatif", sa.Integer(), nullable=True),
        sa.Column("devise", sa.String(length=3), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("ville", sa.String(length=120), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
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
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_creations_atelier_id", "creations", ["atelier_id"])
    op.create_index("ix_creations_category_id", "creations", ["category_id"])
    op.create_index("ix_creations_ville", "creations", ["ville"])


def downgrade() -> None:
    op.drop_index("ix_creations_ville", table_name="creations")
    op.drop_index("ix_creations_category_id", table_name="creations")
    op.drop_index("ix_creations_atelier_id", table_name="creations")
    op.drop_table("creations")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_table("categories")
