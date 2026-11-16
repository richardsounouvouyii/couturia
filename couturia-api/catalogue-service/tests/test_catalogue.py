from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import jwt

ATELIER_ID = "22222222-2222-2222-2222-222222222222"
OWNER_ID = "11111111-1111-1111-1111-111111111111"
JWT_SECRET = "change-me-in-production-use-a-long-random-string"


def _stylist_token(user_id: str = OWNER_ID, role: str = "styliste") -> str:
    return jwt.encode(
        {
            "sub": user_id,
            "role": role,
            "exp": datetime.now(UTC) + timedelta(hours=1),
            "iat": datetime.now(UTC),
        },
        JWT_SECRET,
        algorithm="HS256",
    )


def _auth(user_id: str = OWNER_ID, role: str = "styliste") -> dict[str, str]:
    return {"Authorization": f"Bearer {_stylist_token(user_id, role)}"}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "catalogue-service"


def test_create_creation_requires_auth(client):
    denied_creation = client.post(
        "/api/creations",
        json={
            "atelier_id": ATELIER_ID,
            "category_id": str(uuid4()),
            "titre": "Sans auth",
        },
    )
    assert denied_creation.status_code == 401

    denied_category = client.post(
        "/api/categories",
        json={"slug": "secret", "nom": "Secret"},
    )
    assert denied_category.status_code == 401

    denied_media = client.post("/api/media/upload", files=[])
    assert denied_media.status_code == 401


def test_category_and_creation_flow(client, monkeypatch):
    def fake_owns(*, user_id: UUID, atelier_id: UUID) -> None:
        assert str(user_id) == OWNER_ID
        assert str(atelier_id) == ATELIER_ID

    monkeypatch.setattr(
        "app.api.routes.creations.assert_user_owns_atelier",
        fake_owns,
    )

    category = client.post(
        "/api/categories",
        json={"slug": "robes", "nom": "Robes"},
        headers=_auth(),
    )
    assert category.status_code == 201
    category_id = category.json()["id"]

    creation = client.post(
        "/api/creations",
        headers=_auth(),
        json={
            "atelier_id": ATELIER_ID,
            "category_id": category_id,
            "titre": "Robe wax cocktail",
            "description": "Donnée de test",
            "prix_indicatif": 35000,
            "ville": "Cotonou",
        },
    )
    assert creation.status_code == 201
    creation_id = creation.json()["id"]

    listing = client.get("/api/creations", params={"ville": "Cotonou"})
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    detail = client.get(f"/api/creations/{creation_id}")
    assert detail.status_code == 200
    assert detail.json()["titre"] == "Robe wax cocktail"
    assert detail.json()["category"]["slug"] == "robes"


def test_upload_media(client, tmp_path, monkeypatch):
    monkeypatch.setenv("CATALOGUE_MEDIA_ROOT", str(tmp_path))
    monkeypatch.setenv("CATALOGUE_PUBLIC_URL", "http://testserver")
    from app.config import get_settings

    get_settings.cache_clear()

    jpeg = (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
        b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
        b"\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342"
        b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
        b"\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        b"\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01"
        b"\x00\x00?\x00\xaa\xff\xd9"
    )
    response = client.post(
        "/api/media/upload",
        headers=_auth(),
        files=[("files", ("test.jpg", jpeg, "image/jpeg"))],
    )
    assert response.status_code == 200
    urls = response.json()["urls"]
    assert len(urls) == 1
    assert urls[0].startswith("http://testserver/media/")
