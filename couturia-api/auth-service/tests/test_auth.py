def test_register_login_and_me(client):
    register = client.post(
        "/api/auth/register",
        json={
            "email": "client@example.com",
            "password": "motdepasse1",
            "full_name": "Aïcha Client",
            "role": "client",
        },
    )
    assert register.status_code == 201
    token = register.json()["access_token"]
    assert register.json()["user"]["email"] == "client@example.com"
    assert register.json()["user"]["role"] == "client"

    duplicate = client.post(
        "/api/auth/register",
        json={
            "email": "client@example.com",
            "password": "motdepasse1",
            "full_name": "Aïcha Client",
            "role": "client",
        },
    )
    assert duplicate.status_code == 409

    login = client.post(
        "/api/auth/login",
        json={"email": "client@example.com", "password": "motdepasse1"},
    )
    assert login.status_code == 200
    assert "access_token" in login.json()

    me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["full_name"] == "Aïcha Client"


def test_register_styliste(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "styliste@example.com",
            "password": "motdepasse1",
            "full_name": "Aïcha Styliste",
            "role": "styliste",
        },
    )
    assert response.status_code == 201
    assert response.json()["user"]["role"] == "styliste"


def test_register_rejects_admin_self_assign(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "motdepasse1",
            "full_name": "Admin",
            "role": "admin",
        },
    )
    # PublicRegisterRole → validation 422 (rôle hors inscription publique)
    assert response.status_code == 422


def test_register_rejects_super_admin_self_assign(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "super@example.com",
            "password": "motdepasse1",
            "full_name": "Super Admin",
            "role": "super_admin",
        },
    )
    assert response.status_code == 422


def test_register_rejects_legacy_professionnel(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "legacy@example.com",
            "password": "motdepasse1",
            "full_name": "Legacy",
            "role": "professionnel",
        },
    )
    assert response.status_code == 422


def _create_admin_via_db():
    from app.db import get_db
    from app.main import app
    from app.models.user import UserRole
    from app.repositories.user_repository import UserRepository
    from app.security import hash_password

    gen = app.dependency_overrides[get_db]()
    db = next(gen)
    try:
        return UserRepository(db).create(
            email="staff@couturia.test",
            password_hash=hash_password("motdepasse1"),
            full_name="Staff Test",
            role=UserRole.admin,
        )
    finally:
        try:
            next(gen)
        except StopIteration:
            pass


def test_list_users_requires_staff(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "client-list@example.com",
            "password": "motdepasse1",
            "full_name": "Client List",
            "role": "client",
        },
    )
    login = client.post(
        "/api/auth/login",
        json={"email": "client-list@example.com", "password": "motdepasse1"},
    )
    token = login.json()["access_token"]
    forbidden = client.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert forbidden.status_code == 403


def test_list_and_suspend_users_as_staff(client):
    _create_admin_via_db()
    staff_login = client.post(
        "/api/auth/login",
        json={"email": "staff@couturia.test", "password": "motdepasse1"},
    )
    assert staff_login.status_code == 200
    staff_token = staff_login.json()["access_token"]

    created = client.post(
        "/api/auth/register",
        json={
            "email": "client-admin@example.com",
            "password": "motdepasse1",
            "full_name": "Client Admin View",
            "role": "client",
        },
    )
    assert created.status_code == 201
    user_id = created.json()["user"]["id"]

    listed = client.get(
        "/api/auth/users?role=client",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["total"] >= 1
    assert any(item["email"] == "client-admin@example.com" for item in body["items"])

    patched = client.patch(
        f"/api/auth/users/{user_id}",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"is_active": False},
    )
    assert patched.status_code == 200
    assert patched.json()["is_active"] is False

    role_patch = client.patch(
        f"/api/auth/users/{user_id}",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"role": "styliste", "is_active": True},
    )
    assert role_patch.status_code == 200
    assert role_patch.json()["role"] == "styliste"
    assert role_patch.json()["is_active"] is True

    self_id = staff_login.json()["user"]["id"]
    self_role = client.patch(
        f"/api/auth/users/{self_id}",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"role": "client"},
    )
    assert self_role.status_code == 400
