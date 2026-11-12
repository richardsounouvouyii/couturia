OWNER_ID = "11111111-1111-1111-1111-111111111111"


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "atelier-service"


def test_create_list_and_get_atelier(client):
    created = client.post(
        "/api/ateliers",
        json={
            "owner_user_id": OWNER_ID,
            "nom": "Atelier Aïcha",
            "description": "Robes wax et sur mesure",
            "specialite": "Robes & wax",
            "ville": "Cotonou",
            "quartier": "Akpakpa",
            "telephone_whatsapp": "+22990000000",
        },
    )
    assert created.status_code == 201
    atelier_id = created.json()["id"]

    listing = client.get("/api/ateliers", params={"ville": "Cotonou"})
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    detail = client.get(f"/api/ateliers/{atelier_id}")
    assert detail.status_code == 200
    assert detail.json()["nom"] == "Atelier Aïcha"

    by_owner = client.get(f"/api/ateliers/by-owner/{OWNER_ID}")
    assert by_owner.status_code == 200
    assert by_owner.json()["id"] == atelier_id
    assert by_owner.json()["telephone_whatsapp"] == "+22990000000"
