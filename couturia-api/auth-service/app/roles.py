"""Rôles utilisateurs Couturia (source de vérité API)."""

from __future__ import annotations

from app.models.user import UserRole

# Inscription publique (front) — uniquement ces rôles
PUBLIC_REGISTER_ROLES: frozenset[UserRole] = frozenset(
    {
        UserRole.client,
        UserRole.styliste,
    }
)

# Rôles staff (créés uniquement en interne / plus tard)
STAFF_ROLES: frozenset[UserRole] = frozenset(
    {
        UserRole.admin,
        UserRole.super_admin,
    }
)


def can_self_register(role: UserRole) -> bool:
    return role in PUBLIC_REGISTER_ROLES


def is_staff(role: UserRole) -> bool:
    return role in STAFF_ROLES


def is_styliste(role: UserRole) -> bool:
    return role == UserRole.styliste


def is_super_admin(role: UserRole) -> bool:
    return role == UserRole.super_admin
