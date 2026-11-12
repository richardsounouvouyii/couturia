"""rename professionnel→styliste ; documenter admin/super_admin

Revision ID: 20261112_0002
Revises: 20261101_0001
Create Date: 2026-11-12

Les rôles sont stockés en VARCHAR (pas d'ENUM Postgres natif).
On migre les anciennes valeurs `professionnel` vers `styliste`.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20261112_0002"
down_revision: Union[str, Sequence[str], None] = "20261101_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE users SET role = 'styliste' WHERE role = 'professionnel'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE users SET role = 'professionnel' WHERE role = 'styliste'"
    )
