# auth-service

Service d’authentification Couturia : inscription, connexion, rôles et JWT.

## Endpoints (Sprint 1)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Santé du service |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil du porteur du JWT |

Rôles : `client`, `professionnel`, `admin`.
