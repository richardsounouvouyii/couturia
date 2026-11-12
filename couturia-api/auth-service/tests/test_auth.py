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
