ATELIER_ID = "22222222-2222-2222-2222-222222222222"


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "catalogue-service"


def test_category_and_creation_flow(client):
    category = client.post(
        "/api/categories",
        json={"slug": "robes", "nom": "Robes"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]

    creation = client.post(
        "/api/creations",
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

    # petit JPEG minimal
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
        files=[("files", ("test.jpg", jpeg, "image/jpeg"))],
    )
    assert response.status_code == 200
    urls = response.json()["urls"]
    assert len(urls) == 1
    assert urls[0].startswith("http://testserver/media/")
