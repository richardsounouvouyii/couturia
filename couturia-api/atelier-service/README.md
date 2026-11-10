# atelier-service

Profils d’ateliers / stylistes (vitrine publique).

## Endpoints (socle)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Santé |
| GET | `/api/ateliers` | Annuaire (filtre ville/spécialité) |
| GET | `/api/ateliers/{id}` | Profil public |
| POST | `/api/ateliers` | Création d’atelier (owner_user_id externe) |
