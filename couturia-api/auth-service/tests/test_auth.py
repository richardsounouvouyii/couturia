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
    assert response.status_code == 400
