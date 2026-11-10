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
