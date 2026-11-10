# catalogue-service

Créations, catégories et exposition publique du catalogue.

## Endpoints (socle)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Santé |
| GET | `/api/categories` | Liste des catégories |
| POST | `/api/categories` | Créer une catégorie |
| GET | `/api/creations` | Catalogue filtrable |
| GET | `/api/creations/{id}` | Détail création |
| POST | `/api/creations` | Publier une création |
